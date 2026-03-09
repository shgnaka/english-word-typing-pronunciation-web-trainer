import type { BuiltinWordOverrides, DisplayLanguage, SessionConfig, WordEntry } from "../domain/types";

const customWordsKey = "wordbeat.customWords";
const builtinWordOverridesKey = "wordbeat.builtinWordOverrides";
const sessionConfigKey = "wordbeat.sessionConfig";
const displayLanguageKey = "wordbeat.displayLanguage";
const storageSchemaVersion = 1;

interface VersionedStorageRecord<T> {
  version: number;
  value: T;
}

export const defaultSessionConfig: SessionConfig = {
  wordCount: 10,
  shuffle: false,
  speechEnabled: true,
  browserTtsEnabled: false,
  showFingerGuide: true,
  showKeyboardHint: true
};

export const defaultDisplayLanguage: DisplayLanguage = "en";

export function sanitizeWordCount(value: number): number {
  if (!Number.isFinite(value)) {
    return defaultSessionConfig.wordCount;
  }

  return Math.min(20, Math.max(1, Math.round(value)));
}

function isVersionedStorageRecord<T>(value: unknown): value is VersionedStorageRecord<T> {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "version" in value && "value" in value;
}

function sanitizeSessionConfigValue(value: Partial<SessionConfig> | null | undefined): SessionConfig {
  const parsed = value ?? {};

  return {
    ...defaultSessionConfig,
    ...parsed,
    wordCount: sanitizeWordCount(parsed.wordCount ?? defaultSessionConfig.wordCount),
    shuffle: Boolean(parsed.shuffle ?? defaultSessionConfig.shuffle),
    speechEnabled: Boolean(parsed.speechEnabled ?? defaultSessionConfig.speechEnabled),
    browserTtsEnabled: Boolean(parsed.browserTtsEnabled ?? defaultSessionConfig.browserTtsEnabled),
    showFingerGuide: Boolean(parsed.showFingerGuide ?? defaultSessionConfig.showFingerGuide),
    showKeyboardHint: Boolean(parsed.showKeyboardHint ?? defaultSessionConfig.showKeyboardHint)
  };
}

function saveVersionedRecord<T>(key: string, value: T): void {
  globalThis.localStorage?.setItem(
    key,
    JSON.stringify({
      version: storageSchemaVersion,
      value
    } satisfies VersionedStorageRecord<T>)
  );
}

export function loadCustomWords(): WordEntry[] {
  const raw = globalThis.localStorage?.getItem(customWordsKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as WordEntry[] | VersionedStorageRecord<WordEntry[]>;
    const words = Array.isArray(parsed)
      ? parsed
      : isVersionedStorageRecord<WordEntry[]>(parsed) && Array.isArray(parsed.value)
      ? parsed.value
      : [];

    saveVersionedRecord(customWordsKey, words);
    return words;
  } catch {
    return [];
  }
}

export function saveCustomWords(words: WordEntry[]): void {
  saveVersionedRecord(customWordsKey, words);
}

export function loadBuiltinWordOverrides(): BuiltinWordOverrides {
  const raw = globalThis.localStorage?.getItem(builtinWordOverridesKey);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const overrides: BuiltinWordOverrides =
      isVersionedStorageRecord<BuiltinWordOverrides>(parsed) && parsed.value && typeof parsed.value === "object"
        ? parsed.value
        : parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as BuiltinWordOverrides)
        : {};

    saveVersionedRecord(builtinWordOverridesKey, overrides);
    return overrides;
  } catch {
    return {};
  }
}

export function saveBuiltinWordOverrides(overrides: BuiltinWordOverrides): void {
  saveVersionedRecord(builtinWordOverridesKey, overrides);
}

export function clearBuiltinWordOverrides(): void {
  saveVersionedRecord(builtinWordOverridesKey, {});
}

export function loadSessionConfig(): SessionConfig {
  const raw = globalThis.localStorage?.getItem(sessionConfigKey);
  if (!raw) {
    return defaultSessionConfig;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SessionConfig> | VersionedStorageRecord<Partial<SessionConfig>>;
    const config = isVersionedStorageRecord<Partial<SessionConfig>>(parsed)
      ? sanitizeSessionConfigValue(parsed.value)
      : sanitizeSessionConfigValue(parsed);
    saveVersionedRecord(sessionConfigKey, config);
    return config;
  } catch {
    return defaultSessionConfig;
  }
}

export function saveSessionConfig(config: SessionConfig): void {
  saveVersionedRecord(sessionConfigKey, sanitizeSessionConfigValue(config));
}

export function loadDisplayLanguage(): DisplayLanguage {
  const raw = globalThis.localStorage?.getItem(displayLanguageKey);
  if (raw === "en" || raw === "ja" || raw === "ja-hira") {
    return raw;
  }

  return defaultDisplayLanguage;
}

export function saveDisplayLanguage(language: DisplayLanguage): void {
  globalThis.localStorage?.setItem(displayLanguageKey, language);
}
