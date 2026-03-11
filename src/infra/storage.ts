import type {
  BuiltinWordOverride,
  BuiltinWordOverrides,
  DisplayLanguage,
  SessionConfig,
  ThemeAccent,
  ThemeId,
  ThemePreference,
  WordEntry,
  WordOrder
} from "../domain/types";
import { normalizeWord } from "../domain/words";
import { sanitizeBackgroundIntensity } from "../theme";

const customWordsKey = "wordbeat.customWords";
const builtinWordOverridesKey = "wordbeat.builtinWordOverrides";
const builtinWordOrderKey = "wordbeat.builtinWordOrder";
const sessionConfigKey = "wordbeat.sessionConfig";
const displayLanguageKey = "wordbeat.displayLanguage";
const wordsPanelStateKey = "wordbeat.wordsPanelState";
const themePreferenceKey = "wordbeat.themePreference";
const storageSchemaVersion = 1;

interface VersionedStorageRecord<T> {
  version: number;
  value: T;
}

interface StorageCodec<T> {
  parse: (value: unknown) => T;
}

const fallbackStoredAt = "1970-01-01T00:00:00.000Z";

export const defaultSessionConfig: SessionConfig = {
  wordCount: 10,
  shuffle: false,
  speechEnabled: true,
  browserTtsEnabled: false,
  showFingerGuide: true,
  showKeyboardHint: true
};

export const defaultDisplayLanguage: DisplayLanguage = "en";

export const defaultThemePreference: ThemePreference = {
  themeId: "dusk",
  accent: "amber",
  backgroundIntensity: 60
};

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

function sanitizeStoredBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function isVersionedStorageRecord<T>(value: unknown): value is VersionedStorageRecord<T> {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "version" in value && "value" in value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeStoredTimestamp(value: unknown): string {
  if (typeof value !== "string") {
    return fallbackStoredAt;
  }

  return Number.isNaN(Date.parse(value)) ? fallbackStoredAt : value;
}

function sanitizeWordEntry(value: unknown, source: WordEntry["source"]): WordEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  const normalizedText = normalizeWord(
    typeof value.normalizedText === "string" && value.normalizedText.length > 0
      ? value.normalizedText
      : typeof value.text === "string"
      ? value.text
      : ""
  );

  if (!normalizedText) {
    return null;
  }

  const sanitizedSource = value.source === "builtin" || value.source === "custom" ? value.source : source;
  const id = typeof value.id === "string" && value.id.length > 0 ? value.id : `${sanitizedSource}-${normalizedText}`;

  return {
    id,
    text: normalizedText,
    normalizedText,
    source: sanitizedSource,
    createdAt: sanitizeStoredTimestamp(value.createdAt)
  };
}

function sanitizeWordEntries(values: unknown, source: WordEntry["source"]): WordEntry[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.flatMap((value) => {
    const entry = sanitizeWordEntry(value, source);
    return entry ? [entry] : [];
  });
}

function sanitizeBuiltinWordOverride(value: unknown): BuiltinWordOverride | null {
  if (!isRecord(value)) {
    return null;
  }

  if (value.status === "deleted") {
    return {
      status: "deleted",
      updatedAt: sanitizeStoredTimestamp(value.updatedAt)
    };
  }

  if (value.status !== "edited") {
    return null;
  }

  const normalizedText = normalizeWord(
    typeof value.normalizedText === "string" && value.normalizedText.length > 0
      ? value.normalizedText
      : typeof value.text === "string"
      ? value.text
      : ""
  );

  if (!normalizedText) {
    return null;
  }

  return {
    status: "edited",
    text: normalizedText,
    normalizedText,
    updatedAt: sanitizeStoredTimestamp(value.updatedAt)
  };
}

function sanitizeBuiltinWordOverridesValue(value: unknown): BuiltinWordOverrides {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([wordId, override]) => {
      const sanitizedOverride = sanitizeBuiltinWordOverride(override);
      return sanitizedOverride ? [[wordId, sanitizedOverride]] : [];
    })
  );
}

function sanitizeWordOrderValue(value: unknown): WordOrder {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((wordId): wordId is string => typeof wordId === "string" && wordId.length > 0);
}

function sanitizeSessionConfigValue(value: Partial<SessionConfig> | null | undefined): SessionConfig {
  const parsed = value ?? {};

  return {
    ...defaultSessionConfig,
    ...parsed,
    wordCount: sanitizeWordCount(parsed.wordCount ?? defaultSessionConfig.wordCount),
    shuffle: sanitizeStoredBoolean(parsed.shuffle, defaultSessionConfig.shuffle),
    speechEnabled: sanitizeStoredBoolean(parsed.speechEnabled, defaultSessionConfig.speechEnabled),
    browserTtsEnabled: sanitizeStoredBoolean(parsed.browserTtsEnabled, defaultSessionConfig.browserTtsEnabled),
    showFingerGuide: sanitizeStoredBoolean(parsed.showFingerGuide, defaultSessionConfig.showFingerGuide),
    showKeyboardHint: sanitizeStoredBoolean(parsed.showKeyboardHint, defaultSessionConfig.showKeyboardHint)
  };
}

function sanitizeWordsPanelStateValue(value: Partial<WordsPanelState> | null | undefined): WordsPanelState {
  const parsed = value ?? {};

  return {
    builtinMinimized: sanitizeStoredBoolean(parsed.builtinMinimized, defaultWordsPanelState.builtinMinimized),
    hiddenBuiltinMinimized: sanitizeStoredBoolean(parsed.hiddenBuiltinMinimized, defaultWordsPanelState.hiddenBuiltinMinimized),
    customMinimized: sanitizeStoredBoolean(parsed.customMinimized, defaultWordsPanelState.customMinimized),
    inactiveCustomMinimized: sanitizeStoredBoolean(parsed.inactiveCustomMinimized, defaultWordsPanelState.inactiveCustomMinimized)
  };
}

function createStorageCodec<T>(parse: (value: unknown) => T): StorageCodec<T> {
  return { parse };
}

const customWordsCodec = createStorageCodec<WordEntry[]>((value) => sanitizeWordEntries(value, "custom"));
const builtinWordOverridesCodec = createStorageCodec<BuiltinWordOverrides>((value) => sanitizeBuiltinWordOverridesValue(value));
const builtinWordOrderCodec = createStorageCodec<WordOrder>((value) => sanitizeWordOrderValue(value));
const sessionConfigCodec = createStorageCodec<SessionConfig>((value) => sanitizeSessionConfigValue(value as Partial<SessionConfig> | null | undefined));
const wordsPanelStateCodec = createStorageCodec<WordsPanelState>((value) => sanitizeWordsPanelStateValue(value as Partial<WordsPanelState> | null | undefined));
const themePreferenceCodec = createStorageCodec<ThemePreference>((value) => sanitizeThemePreferenceValue(value as Partial<ThemePreference> | null | undefined));

function parseDisplayLanguageValue(value: unknown): DisplayLanguage {
  return value === "en" || value === "ja" || value === "ja-hira" ? value : defaultDisplayLanguage;
}

function parseThemeId(value: unknown): ThemeId {
  return value === "dusk" || value === "forest" || value === "ocean" || value === "dawn" || value === "daylight"
    ? value
    : defaultThemePreference.themeId;
}

function parseThemeAccent(value: unknown): ThemeAccent {
  return value === "amber" || value === "mint" || value === "sky" || value === "rose" ? value : defaultThemePreference.accent;
}

function sanitizeThemePreferenceValue(value: Partial<ThemePreference> | null | undefined): ThemePreference {
  const parsed = value ?? {};

  return {
    themeId: parseThemeId(parsed.themeId),
    accent: parseThemeAccent(parsed.accent),
    backgroundIntensity: sanitizeBackgroundIntensity(parsed.backgroundIntensity ?? defaultThemePreference.backgroundIntensity)
  };
}

function parseStoredValue<T>(raw: string, codec: StorageCodec<T>, fallback: T): T {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return codec.parse(isVersionedStorageRecord<unknown>(parsed) ? parsed.value : parsed);
  } catch {
    return fallback;
  }
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

function loadVersionedStorageValue<T>(key: string, codec: StorageCodec<T>, fallback: T): T {
  const raw = globalThis.localStorage?.getItem(key);
  if (!raw) {
    return fallback;
  }

  const value = parseStoredValue(raw, codec, fallback);
  saveVersionedRecord(key, value);
  return value;
}

function saveVersionedStorageValue<T>(key: string, codec: StorageCodec<T>, value: unknown): void {
  saveVersionedRecord(key, codec.parse(value));
}

export function loadCustomWords(): WordEntry[] {
  return loadVersionedStorageValue(customWordsKey, customWordsCodec, []);
}

export function saveCustomWords(words: WordEntry[]): void {
  saveVersionedStorageValue(customWordsKey, customWordsCodec, words);
}

export function loadBuiltinWordOverrides(): BuiltinWordOverrides {
  return loadVersionedStorageValue(builtinWordOverridesKey, builtinWordOverridesCodec, {});
}

export function saveBuiltinWordOverrides(overrides: BuiltinWordOverrides): void {
  saveVersionedStorageValue(builtinWordOverridesKey, builtinWordOverridesCodec, overrides);
}

export function clearBuiltinWordOverrides(): void {
  saveVersionedRecord(builtinWordOverridesKey, {});
}

export function loadBuiltinWordOrder(): WordOrder {
  return loadVersionedStorageValue(builtinWordOrderKey, builtinWordOrderCodec, []);
}

export function saveBuiltinWordOrder(order: WordOrder): void {
  saveVersionedStorageValue(builtinWordOrderKey, builtinWordOrderCodec, order);
}

export function clearBuiltinWordOrder(): void {
  saveVersionedRecord(builtinWordOrderKey, []);
}

export function loadSessionConfig(): SessionConfig {
  return loadVersionedStorageValue(sessionConfigKey, sessionConfigCodec, defaultSessionConfig);
}

export function saveSessionConfig(config: SessionConfig): void {
  saveVersionedStorageValue(sessionConfigKey, sessionConfigCodec, config);
}

export function loadWordsPanelState(): WordsPanelState {
  return loadVersionedStorageValue(wordsPanelStateKey, wordsPanelStateCodec, defaultWordsPanelState);
}

export function saveWordsPanelState(state: WordsPanelState): void {
  saveVersionedStorageValue(wordsPanelStateKey, wordsPanelStateCodec, state);
}

export function loadThemePreference(): ThemePreference {
  return loadVersionedStorageValue(themePreferenceKey, themePreferenceCodec, defaultThemePreference);
}

export function saveThemePreference(preference: ThemePreference): void {
  saveVersionedStorageValue(themePreferenceKey, themePreferenceCodec, preference);
}

export function loadDisplayLanguage(): DisplayLanguage {
  return parseDisplayLanguageValue(globalThis.localStorage?.getItem(displayLanguageKey));
}

export function saveDisplayLanguage(language: DisplayLanguage): void {
  globalThis.localStorage?.setItem(displayLanguageKey, language);
}
