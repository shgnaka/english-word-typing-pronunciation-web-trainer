import type { DisplayLanguage, SessionConfig, WordEntry } from "../domain/types";

const customWordsKey = "wordbeat.customWords";
const sessionConfigKey = "wordbeat.sessionConfig";
const displayLanguageKey = "wordbeat.displayLanguage";

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

export function loadCustomWords(): WordEntry[] {
  const raw = globalThis.localStorage?.getItem(customWordsKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as WordEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomWords(words: WordEntry[]): void {
  globalThis.localStorage?.setItem(customWordsKey, JSON.stringify(words));
}

export function loadSessionConfig(): SessionConfig {
  const raw = globalThis.localStorage?.getItem(sessionConfigKey);
  if (!raw) {
    return defaultSessionConfig;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SessionConfig>;
    return {
      ...defaultSessionConfig,
      ...parsed,
      wordCount: sanitizeWordCount(parsed.wordCount ?? defaultSessionConfig.wordCount),
      browserTtsEnabled: Boolean(parsed.browserTtsEnabled ?? defaultSessionConfig.browserTtsEnabled)
    };
  } catch {
    return defaultSessionConfig;
  }
}

export function saveSessionConfig(config: SessionConfig): void {
  globalThis.localStorage?.setItem(
    sessionConfigKey,
    JSON.stringify({
      ...config,
      wordCount: sanitizeWordCount(config.wordCount),
      browserTtsEnabled: Boolean(config.browserTtsEnabled)
    })
  );
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
