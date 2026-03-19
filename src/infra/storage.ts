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

const storageNamespace = "wordbeat";
const customWordsKey = "customWords";
const builtinWordOverridesKey = "builtinWordOverrides";
const builtinWordOrderKey = "builtinWordOrder";
const sessionConfigKey = "sessionConfig";
const displayLanguageKey = "displayLanguage";
const wordsPanelStateKey = "wordsPanelState";
const themePreferenceKey = "themePreference";
const profilesKey = "profiles";
const currentProfileIdKey = "currentProfileId";
const storageSchemaVersion = 1;
export const defaultStorageScopeId = "anonymous";
export const defaultProfileName = "Profile 1";

interface VersionedStorageRecord<T> {
  version: number;
  value: T;
}

interface StorageCodec<T> {
  parse: (value: unknown) => T;
}

const fallbackStoredAt = "1970-01-01T00:00:00.000Z";

export interface StoredProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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

function normalizeStorageScopeId(scopeId: string | undefined): string {
  return scopeId && scopeId.length > 0 ? scopeId : defaultStorageScopeId;
}

function buildStorageKey(key: string, scopeId = defaultStorageScopeId): string {
  const normalizedScopeId = normalizeStorageScopeId(scopeId);

  if (normalizedScopeId === defaultStorageScopeId) {
    return `${storageNamespace}.${key}`;
  }

  return `${storageNamespace}.${normalizedScopeId}.${key}`;
}

function sanitizeStoredTimestamp(value: unknown): string {
  if (typeof value !== "string") {
    return fallbackStoredAt;
  }

  return Number.isNaN(Date.parse(value)) ? fallbackStoredAt : value;
}

function sanitizeProfileName(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function sanitizeStoredProfile(value: unknown, fallbackName: string): StoredProfile | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === "string" && value.id.trim().length > 0 ? value.id.trim() : "";
  if (!id) {
    return null;
  }

  return {
    id,
    name: sanitizeProfileName(value.name, fallbackName),
    createdAt: sanitizeStoredTimestamp(value.createdAt),
    updatedAt: sanitizeStoredTimestamp(typeof value.updatedAt === "string" ? value.updatedAt : value.createdAt)
  };
}

function sanitizeStoredProfiles(value: unknown): StoredProfile[] {
  const defaultProfile: StoredProfile = {
    id: defaultStorageScopeId,
    name: defaultProfileName,
    createdAt: fallbackStoredAt,
    updatedAt: fallbackStoredAt
  };

  if (!Array.isArray(value)) {
    return [defaultProfile];
  }

  const sanitizedProfiles = value.flatMap((profile, index) => {
    const sanitizedProfile = sanitizeStoredProfile(profile, `Profile ${index + 1}`);
    return sanitizedProfile ? [sanitizedProfile] : [];
  });

  if (sanitizedProfiles.some((profile) => profile.id === defaultStorageScopeId)) {
    return sanitizedProfiles;
  }

  return [defaultProfile, ...sanitizedProfiles];
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
    showKeyboardHint: sanitizeStoredBoolean(parsed.showKeyboardHint, defaultSessionConfig.showKeyboardHint),
    showWordReading: sanitizeStoredBoolean(parsed.showWordReading, defaultSessionConfig.showWordReading)
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
const storedProfilesCodec = createStorageCodec<StoredProfile[]>((value) => sanitizeStoredProfiles(value));

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

function saveVersionedRecord<T>(key: string, value: T, scopeId = defaultStorageScopeId): void {
  globalThis.localStorage?.setItem(
    buildStorageKey(key, scopeId),
    JSON.stringify({
      version: storageSchemaVersion,
      value
    } satisfies VersionedStorageRecord<T>)
  );
}

function loadVersionedStorageValue<T>(key: string, codec: StorageCodec<T>, fallback: T, scopeId = defaultStorageScopeId): T {
  const raw = globalThis.localStorage?.getItem(buildStorageKey(key, scopeId));
  if (!raw) {
    return fallback;
  }

  const value = parseStoredValue(raw, codec, fallback);
  saveVersionedRecord(key, value, scopeId);
  return value;
}

function saveVersionedStorageValue<T>(key: string, codec: StorageCodec<T>, value: unknown, scopeId = defaultStorageScopeId): void {
  saveVersionedRecord(key, codec.parse(value), scopeId);
}

function loadStoredProfiles(): StoredProfile[] {
  return loadVersionedStorageValue(profilesKey, storedProfilesCodec, sanitizeStoredProfiles([]));
}

function writeStoredProfiles(profiles: StoredProfile[]): void {
  saveVersionedStorageValue(profilesKey, storedProfilesCodec, profiles);
}

function touchProfileUpdatedAt(profileId: string, updatedAt = new Date().toISOString()): void {
  const profiles = loadStoredProfiles();
  if (!profiles.some((profile) => profile.id === profileId)) {
    return;
  }

  const nextProfiles = profiles.map((profile) =>
    profile.id === profileId
      ? { ...profile, updatedAt }
      : profile
  );

  writeStoredProfiles(nextProfiles);
}

export function loadCustomWords(scopeId = defaultStorageScopeId): WordEntry[] {
  return loadVersionedStorageValue(customWordsKey, customWordsCodec, [], scopeId);
}

export function saveCustomWords(words: WordEntry[], scopeId = defaultStorageScopeId): void {
  saveVersionedStorageValue(customWordsKey, customWordsCodec, words, scopeId);
  touchProfileUpdatedAt(scopeId);
}

export function loadBuiltinWordOverrides(scopeId = defaultStorageScopeId): BuiltinWordOverrides {
  return loadVersionedStorageValue(builtinWordOverridesKey, builtinWordOverridesCodec, {}, scopeId);
}

export function saveBuiltinWordOverrides(overrides: BuiltinWordOverrides, scopeId = defaultStorageScopeId): void {
  saveVersionedStorageValue(builtinWordOverridesKey, builtinWordOverridesCodec, overrides, scopeId);
  touchProfileUpdatedAt(scopeId);
}

export function clearBuiltinWordOverrides(scopeId = defaultStorageScopeId): void {
  saveVersionedRecord(builtinWordOverridesKey, {}, scopeId);
  touchProfileUpdatedAt(scopeId);
}

export function loadBuiltinWordOrder(scopeId = defaultStorageScopeId): WordOrder {
  return loadVersionedStorageValue(builtinWordOrderKey, builtinWordOrderCodec, [], scopeId);
}

export function saveBuiltinWordOrder(order: WordOrder, scopeId = defaultStorageScopeId): void {
  saveVersionedStorageValue(builtinWordOrderKey, builtinWordOrderCodec, order, scopeId);
  touchProfileUpdatedAt(scopeId);
}

export function clearBuiltinWordOrder(scopeId = defaultStorageScopeId): void {
  saveVersionedRecord(builtinWordOrderKey, [], scopeId);
  touchProfileUpdatedAt(scopeId);
}

export function loadSessionConfig(scopeId = defaultStorageScopeId): SessionConfig {
  return loadVersionedStorageValue(sessionConfigKey, sessionConfigCodec, defaultSessionConfig, scopeId);
}

export function saveSessionConfig(config: SessionConfig, scopeId = defaultStorageScopeId): void {
  saveVersionedStorageValue(sessionConfigKey, sessionConfigCodec, config, scopeId);
  touchProfileUpdatedAt(scopeId);
}

export function loadWordsPanelState(scopeId = defaultStorageScopeId): WordsPanelState {
  return loadVersionedStorageValue(wordsPanelStateKey, wordsPanelStateCodec, defaultWordsPanelState, scopeId);
}

export function saveWordsPanelState(state: WordsPanelState, scopeId = defaultStorageScopeId): void {
  saveVersionedStorageValue(wordsPanelStateKey, wordsPanelStateCodec, state, scopeId);
  touchProfileUpdatedAt(scopeId);
}

export function loadThemePreference(scopeId = defaultStorageScopeId): ThemePreference {
  return loadVersionedStorageValue(themePreferenceKey, themePreferenceCodec, defaultThemePreference, scopeId);
}

export function saveThemePreference(preference: ThemePreference, scopeId = defaultStorageScopeId): void {
  saveVersionedStorageValue(themePreferenceKey, themePreferenceCodec, preference, scopeId);
  touchProfileUpdatedAt(scopeId);
}

export function loadDisplayLanguage(scopeId = defaultStorageScopeId): DisplayLanguage {
  return parseDisplayLanguageValue(globalThis.localStorage?.getItem(buildStorageKey(displayLanguageKey, scopeId)));
}

export function saveDisplayLanguage(language: DisplayLanguage, scopeId = defaultStorageScopeId): void {
  globalThis.localStorage?.setItem(buildStorageKey(displayLanguageKey, scopeId), language);
  touchProfileUpdatedAt(scopeId);
}

export function loadProfiles(): StoredProfile[] {
  return loadStoredProfiles();
}

export function saveProfiles(profiles: StoredProfile[]): void {
  writeStoredProfiles(profiles);
}

export function loadCurrentProfileId(): string {
  const currentProfileId = globalThis.localStorage?.getItem(buildStorageKey(currentProfileIdKey));
  return currentProfileId && currentProfileId.length > 0 ? currentProfileId : defaultStorageScopeId;
}

export function saveCurrentProfileId(profileId: string): void {
  globalThis.localStorage?.setItem(buildStorageKey(currentProfileIdKey), profileId || defaultStorageScopeId);
}
