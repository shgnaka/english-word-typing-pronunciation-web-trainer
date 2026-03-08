import { defaultWords } from "../../data/defaultWords";
import { buildSessionQueue } from "../../domain/session";
import type { DisplayLanguage, SessionConfig, WordEntry } from "../../domain/types";
import { dedupeWords } from "../../domain/words";
import { defaultDisplayLanguage, loadCustomWords, loadDisplayLanguage, loadSessionConfig } from "../../infra/storage";

export function buildAvailableWords(customWords: WordEntry[]): WordEntry[] {
  return dedupeWords([...defaultWords, ...customWords]);
}

export function buildTrainerQueue(words: WordEntry[], config: SessionConfig): WordEntry[] {
  return buildSessionQueue(words, config.wordCount, config.shuffle);
}

export function loadTrainerPreferences(): {
  customWords: WordEntry[];
  config: SessionConfig;
  displayLanguage: DisplayLanguage;
} {
  return {
    customWords: loadCustomWords(),
    config: loadSessionConfig(),
    displayLanguage: loadDisplayLanguage() ?? defaultDisplayLanguage
  };
}
