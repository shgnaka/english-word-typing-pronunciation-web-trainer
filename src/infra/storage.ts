import type { SessionConfig, WordEntry } from "../domain/types";

const customWordsKey = "wordbeat.customWords";
const sessionConfigKey = "wordbeat.sessionConfig";

export const defaultSessionConfig: SessionConfig = {
  wordCount: 10,
  shuffle: false,
  speechEnabled: true,
  showFingerGuide: true,
  showKeyboardHint: true
};

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
      ...parsed
    };
  } catch {
    return defaultSessionConfig;
  }
}

export function saveSessionConfig(config: SessionConfig): void {
  globalThis.localStorage?.setItem(sessionConfigKey, JSON.stringify(config));
}
