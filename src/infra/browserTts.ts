import {
  BROWSER_TTS_MODEL_VERSION,
  BROWSER_TTS_VOICE_VARIANT
} from "./browserTtsShared";
import type { BrowserTtsWorkerResponse } from "./browserTtsShared";

const databaseName = "wordbeat.browserTts";
const databaseVersion = 1;
const storeName = "audio-cache";
const browserTtsCacheTtlMs = 1000 * 60 * 60 * 24 * 30;

interface AudioCacheRecord {
  key: string;
  word: string;
  audioBlob: Blob;
  createdAt: number;
}

let databasePromise: Promise<IDBDatabase> | null = null;
let workerClient: BrowserTtsWorkerClient | null = null;
let currentAudio: { element: HTMLAudioElement; url: string } | null = null;
const inflightGenerations = new Map<string, Promise<Blob>>();
let backgroundQueue = Promise.resolve();

function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

export function isBrowserTtsCacheExpired(createdAt: number, now = Date.now()): boolean {
  return now - createdAt > browserTtsCacheTtlMs;
}

export function createBrowserTtsCacheKey(word: string): string {
  return [BROWSER_TTS_MODEL_VERSION, BROWSER_TTS_VOICE_VARIANT, normalizeWord(word)].join("::");
}

export function isBrowserTtsSupported(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof Audio !== "undefined" &&
    typeof Blob !== "undefined" &&
    typeof indexedDB !== "undefined" &&
    typeof URL !== "undefined"
  );
}

function openAudioCacheDatabase(): Promise<IDBDatabase> {
  if (!isBrowserTtsSupported()) {
    return Promise.reject(new Error("Browser TTS is not supported in this environment."));
  }

  databasePromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open browser TTS cache."));
  });

  return databasePromise;
}

async function readAudioCacheRecord(key: string): Promise<AudioCacheRecord | null> {
  const database = await openAudioCacheDatabase();

  return await new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(key);
    request.onsuccess = () => resolve((request.result as AudioCacheRecord | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("Failed to read browser TTS cache record."));
  });
}

async function writeAudioCacheRecord(record: AudioCacheRecord): Promise<void> {
  const database = await openAudioCacheDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Failed to write browser TTS cache record."));
  });
}

async function deleteAudioCacheRecord(key: string): Promise<void> {
  const database = await openAudioCacheDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Failed to delete browser TTS cache record."));
  });
}

async function listAudioCacheRecords(): Promise<AudioCacheRecord[]> {
  const database = await openAudioCacheDatabase();

  return await new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    request.onsuccess = () => resolve((request.result as AudioCacheRecord[] | undefined) ?? []);
    request.onerror = () => reject(request.error ?? new Error("Failed to list browser TTS cache records."));
  });
}

class BrowserTtsWorkerClient {
  private worker = new Worker(new URL("./browserTtsWorker.ts", import.meta.url), { type: "module" });
  private nextMessageId = 0;
  private pending = new Map<number, { resolve: (value: Blob | void) => void; reject: (error: Error) => void }>();

  constructor() {
    this.worker.onmessage = (event: MessageEvent<BrowserTtsWorkerResponse>) => {
      const message = event.data;
      const pending = this.pending.get(message.id);
      if (!pending) {
        return;
      }

      this.pending.delete(message.id);

      if (message.type === "error") {
        pending.reject(new Error(message.error));
        return;
      }

      pending.resolve(message.type === "generated" ? message.audioBlob : undefined);
    };

    this.worker.onerror = (event) => {
      const error = new Error(event.message || "Browser TTS worker failed.");
      for (const pending of this.pending.values()) {
        pending.reject(error);
      }
      this.pending.clear();
      this.worker.terminate();
      workerClient = null;
    };
  }

  private request(message: { type: "load" } | { type: "generate"; word: string }): Promise<Blob | void> {
    const id = ++this.nextMessageId;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ ...message, id });
    });
  }

  async load(): Promise<void> {
    await this.request({ type: "load" });
  }

  async generate(word: string): Promise<Blob> {
    const response = await this.request({ type: "generate", word });
    if (!(response instanceof Blob)) {
      throw new Error("Browser TTS worker did not return audio.");
    }
    return response;
  }
}

function getWorkerClient(): BrowserTtsWorkerClient {
  workerClient ??= new BrowserTtsWorkerClient();
  return workerClient;
}

export async function hasCachedWordAudio(word: string): Promise<boolean> {
  return (await getCachedWordAudio(word)) !== null;
}

export async function getCachedWordAudio(word: string): Promise<Blob | null> {
  const normalizedWord = normalizeWord(word);
  if (!normalizedWord || !isBrowserTtsSupported()) {
    return null;
  }

  const record = await readAudioCacheRecord(createBrowserTtsCacheKey(normalizedWord));
  if (record && isBrowserTtsCacheExpired(record.createdAt)) {
    await deleteAudioCacheRecord(record.key).catch(() => undefined);
    return null;
  }

  return record?.audioBlob ?? null;
}

export async function purgeExpiredBrowserTtsCache(now = Date.now()): Promise<number> {
  if (!isBrowserTtsSupported()) {
    return 0;
  }

  const records = await listAudioCacheRecords();
  const expiredRecords = records.filter((record) => isBrowserTtsCacheExpired(record.createdAt, now));
  await Promise.all(expiredRecords.map((record) => deleteAudioCacheRecord(record.key)));
  return expiredRecords.length;
}

export async function clearBrowserTtsCache(): Promise<number> {
  if (!isBrowserTtsSupported()) {
    return 0;
  }

  const records = await listAudioCacheRecords();
  await Promise.all(records.map((record) => deleteAudioCacheRecord(record.key)));
  return records.length;
}

export async function ensureWordAudio(word: string): Promise<Blob> {
  const normalizedWord = normalizeWord(word);
  if (!normalizedWord) {
    throw new Error("A word is required to generate browser audio.");
  }

  const cachedAudio = await getCachedWordAudio(normalizedWord);
  if (cachedAudio) {
    return cachedAudio;
  }

  const inflight = inflightGenerations.get(normalizedWord);
  if (inflight) {
    return inflight;
  }

  const generation = (async () => {
    const client = getWorkerClient();
    const generatedAudio = await client.generate(normalizedWord);
    await writeAudioCacheRecord({
      key: createBrowserTtsCacheKey(normalizedWord),
      word: normalizedWord,
      audioBlob: generatedAudio,
      createdAt: Date.now()
    });
    return generatedAudio;
  })().finally(() => {
    inflightGenerations.delete(normalizedWord);
  });

  inflightGenerations.set(normalizedWord, generation);
  return generation;
}

export async function playAudioBlob(audioBlob: Blob): Promise<void> {
  if (!isBrowserTtsSupported()) {
    throw new Error("Browser audio playback is not supported.");
  }

  if (currentAudio) {
    currentAudio.element.pause();
    URL.revokeObjectURL(currentAudio.url);
    currentAudio = null;
  }

  const objectUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(objectUrl);
  currentAudio = { element: audio, url: objectUrl };

  const cleanup = () => {
    if (currentAudio?.element === audio) {
      URL.revokeObjectURL(objectUrl);
      currentAudio = null;
    }
  };

  audio.addEventListener("ended", cleanup, { once: true });
  audio.addEventListener("error", cleanup, { once: true });

  try {
    await audio.play();
  } catch (error) {
    cleanup();
    throw error;
  }
}

export function queueWordGeneration(word: string): void {
  const normalizedWord = normalizeWord(word);
  if (!normalizedWord || !isBrowserTtsSupported()) {
    return;
  }

  backgroundQueue = backgroundQueue
    .then(async () => {
      await purgeExpiredBrowserTtsCache();
      const isCached = await hasCachedWordAudio(normalizedWord);
      if (!isCached) {
        await ensureWordAudio(normalizedWord);
      }
    })
    .catch(() => undefined);
}

export function preloadBrowserTtsWords(words: string[]): void {
  const uniqueWords = [...new Set(words.map(normalizeWord).filter(Boolean))];
  if (uniqueWords.length === 0 || !isBrowserTtsSupported()) {
    return;
  }

  backgroundQueue = backgroundQueue
    .then(async () => {
      await purgeExpiredBrowserTtsCache();
      let hasMissingWord = false;

      for (const word of uniqueWords) {
        if (!(await hasCachedWordAudio(word))) {
          hasMissingWord = true;
          break;
        }
      }

      if (!hasMissingWord) {
        return;
      }

      await getWorkerClient().load();

      for (const word of uniqueWords) {
        if (!(await hasCachedWordAudio(word))) {
          await ensureWordAudio(word);
        }
      }
    })
    .catch(() => undefined);
}
