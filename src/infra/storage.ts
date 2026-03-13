import type { BuiltinWordOverrides, DisplayLanguage, SessionConfig, WordEntry, WordOrder } from "../domain/types";

const customWordsKey = "wordbeat.customWords";
const builtinWordOverridesKey = "wordbeat.builtinWordOverrides";
const builtinWordOrderKey = "wordbeat.builtinWordOrder";
const sessionConfigKey = "wordbeat.sessionConfig";
const displayLanguageKey = "wordbeat.displayLanguage";
const wordsPanelStateKey = "wordbeat.wordsPanelState";
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
  showKeyboardHint: true,
  showWordReading: false
};

export const defaultDisplayLanguage: DisplayLanguage = "en";

export interface WordsPanelState {
  builtinMinimized: boolean;
  hiddenBuiltinMinimized: boolean;
  customMinimized: boolean;
  inactiveCustomMinimized: boolean;
}

export const defaultWordsPanelState: WordsPanelState = {
  builtinMinimized: false,
  hiddenBuiltinMinimized: false,
  customMinimized: false,
  inactiveCustomMinimized: false
};

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
    showKeyboardHint: Boolean(parsed.showKeyboardHint ?? defaultSessionConfig.showKeyboardHint),
    showWordReading: Boolean(parsed.showWordReading ?? defaultSessionConfig.showWordReading)
  };
}

function sanitizeWordsPanelStateValue(value: Partial<WordsPanelState> | null | undefined): WordsPanelState {
  const parsed = value ?? {};

  return {
    builtinMinimized: Boolean(parsed.builtinMinimized ?? defaultWordsPanelState.builtinMinimized),
    hiddenBuiltinMinimized: Boolean(parsed.hiddenBuiltinMinimized ?? defaultWordsPanelState.hiddenBuiltinMinimized),
    customMinimized: Boolean(parsed.customMinimized ?? defaultWordsPanelState.customMinimized),
    inactiveCustomMinimized: Boolean(parsed.inactiveCustomMinimized ?? defaultWordsPanelState.inactiveCustomMinimized)
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

export function loadBuiltinWordOrder(): WordOrder {
  const raw = globalThis.localStorage?.getItem(builtinWordOrderKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as WordOrder | VersionedStorageRecord<WordOrder>;
    const order = Array.isArray(parsed)
      ? parsed
      : isVersionedStorageRecord<WordOrder>(parsed) && Array.isArray(parsed.value)
      ? parsed.value
      : [];

    saveVersionedRecord(builtinWordOrderKey, order);
    return order;
  } catch {
    return [];
  }
}

export function saveBuiltinWordOrder(order: WordOrder): void {
  saveVersionedRecord(builtinWordOrderKey, order);
}

export function clearBuiltinWordOrder(): void {
  saveVersionedRecord(builtinWordOrderKey, []);
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

export function loadWordsPanelState(): WordsPanelState {
  const raw = globalThis.localStorage?.getItem(wordsPanelStateKey);
  if (!raw) {
    return defaultWordsPanelState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WordsPanelState> | VersionedStorageRecord<Partial<WordsPanelState>>;
    const wordsPanelState = isVersionedStorageRecord<Partial<WordsPanelState>>(parsed)
      ? sanitizeWordsPanelStateValue(parsed.value)
      : sanitizeWordsPanelStateValue(parsed);
    saveVersionedRecord(wordsPanelStateKey, wordsPanelState);
    return wordsPanelState;
  } catch {
    return defaultWordsPanelState;
  }
}

export function saveWordsPanelState(state: WordsPanelState): void {
  saveVersionedRecord(wordsPanelStateKey, sanitizeWordsPanelStateValue(state));
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
