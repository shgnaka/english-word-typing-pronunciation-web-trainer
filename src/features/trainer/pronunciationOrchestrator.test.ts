import { describe, expect, it, vi } from "vitest";
import type { WordEntry } from "../../domain/types";
import { PronunciationOrchestrator } from "./pronunciationOrchestrator";

function createWordEntry(text: string): WordEntry {
  return {
    id: `word-${text}`,
    text,
    normalizedText: text,
    source: "builtin",
    createdAt: "2026-03-10T00:00:00.000Z"
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("PronunciationOrchestrator", () => {
  it("dedupes overlapping manual pronunciation requests", async () => {
    const statuses: string[] = [];
    const speakDeferred = deferred<{ source: "browser-generated" }>();
    const speakWord = vi.fn().mockReturnValue(speakDeferred.promise);
    const orchestrator = new PronunciationOrchestrator(
      {
        hasCachedWordAudio: vi.fn().mockResolvedValue(false),
        preloadBrowserTtsWords: vi.fn(),
        speakWord
      },
      (status) => statuses.push(status)
    );

    orchestrator.syncCurrentWord({
      screen: "practice",
      countdown: 0,
      sessionKey: "word-apple:0",
      currentWord: "apple",
      speechEnabled: true,
      browserTtsEnabled: true,
      isComplete: false
    });

    const firstRequest = orchestrator.speakCurrentWord("apple", {
      speechEnabled: true,
      browserTtsEnabled: true
    });
    const secondRequest = orchestrator.speakCurrentWord("apple", {
      speechEnabled: true,
      browserTtsEnabled: true
    });

    await Promise.resolve();

    expect(speakWord).toHaveBeenCalledTimes(1);

    speakDeferred.resolve({ source: "browser-generated" });
    await Promise.all([firstRequest, secondRequest]);

    expect(statuses).toContain("generating");
    expect(statuses[statuses.length - 1]).toBe("idle");
  });

  it("ignores stale manual pronunciation results after the current word changes", async () => {
    const statuses: string[] = [];
    const speakDeferred = deferred<{ source: "speech-synthesis" }>();
    const orchestrator = new PronunciationOrchestrator(
      {
        hasCachedWordAudio: vi.fn().mockResolvedValue(false),
        preloadBrowserTtsWords: vi.fn(),
        speakWord: vi.fn().mockReturnValue(speakDeferred.promise)
      },
      (status) => statuses.push(status)
    );

    orchestrator.syncCurrentWord({
      screen: "practice",
      countdown: 0,
      sessionKey: "word-apple:0",
      currentWord: "apple",
      speechEnabled: true,
      browserTtsEnabled: true,
      isComplete: false
    });

    const manualRequest = orchestrator.speakCurrentWord("apple", {
      speechEnabled: true,
      browserTtsEnabled: true
    });

    await Promise.resolve();

    orchestrator.syncCurrentWord({
      screen: "practice",
      countdown: 0,
      sessionKey: "word-banana:0",
      currentWord: "banana",
      speechEnabled: true,
      browserTtsEnabled: true,
      isComplete: false
    });

    speakDeferred.resolve({ source: "speech-synthesis" });
    await manualRequest;

    expect(statuses[statuses.length - 1]).toBe("idle");
    expect(statuses).not.toContain("fallback");
  });

  it("surfaces fallback for manual browser TTS requests that fall back to speech synthesis", async () => {
    const statuses: string[] = [];
    const orchestrator = new PronunciationOrchestrator(
      {
        hasCachedWordAudio: vi.fn().mockResolvedValue(false),
        preloadBrowserTtsWords: vi.fn(),
        speakWord: vi.fn().mockResolvedValue({ source: "speech-synthesis" })
      },
      (status) => statuses.push(status)
    );

    orchestrator.syncCurrentWord({
      screen: "practice",
      countdown: 0,
      sessionKey: "word-apple:0",
      currentWord: "apple",
      speechEnabled: true,
      browserTtsEnabled: true,
      isComplete: false
    });

    await orchestrator.speakCurrentWord("apple", {
      speechEnabled: true,
      browserTtsEnabled: true
    });

    expect(statuses).toContain("generating");
    expect(statuses[statuses.length - 1]).toBe("fallback");
  });

  it("preloads available words only when browser TTS is enabled", () => {
    const preloadBrowserTtsWords = vi.fn();
    const orchestrator = new PronunciationOrchestrator(
      {
        hasCachedWordAudio: vi.fn(),
        preloadBrowserTtsWords,
        speakWord: vi.fn()
      },
      vi.fn()
    );

    orchestrator.preloadAvailableWords([createWordEntry("apple"), createWordEntry("book")], {
      wordCount: 10,
      shuffle: false,
      speechEnabled: true,
      browserTtsEnabled: false,
      showFingerGuide: true,
      showKeyboardHint: true,
      showWordReading: false
    });
    orchestrator.preloadAvailableWords([createWordEntry("apple"), createWordEntry("book")], {
      wordCount: 10,
      shuffle: false,
      speechEnabled: true,
      browserTtsEnabled: true,
      showFingerGuide: true,
      showKeyboardHint: true,
      showWordReading: false
    });

    expect(preloadBrowserTtsWords).toHaveBeenCalledTimes(1);
    expect(preloadBrowserTtsWords).toHaveBeenCalledWith(["apple", "book"]);
  });
});
