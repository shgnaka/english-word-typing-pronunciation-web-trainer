import { defaultWords } from "../../data/defaultWords";
import { buildSessionQueue } from "../../domain/session";
import type { BuiltinWordOverrides, DisplayLanguage, SessionConfig, WordEntry } from "../../domain/types";
import { dedupeWords, resolveBuiltinWords } from "../../domain/words";
import { defaultDisplayLanguage, loadBuiltinWordOverrides, loadCustomWords, loadDisplayLanguage, loadSessionConfig } from "../../infra/storage";

export function buildResolvedBuiltinWords(overrides: BuiltinWordOverrides): WordEntry[] {
  return resolveBuiltinWords(defaultWords, overrides);
}

export function buildAvailableWords(builtinWords: WordEntry[], customWords: WordEntry[]): WordEntry[] {
  return dedupeWords([...builtinWords, ...customWords]);
}

export function buildTrainerQueue(words: WordEntry[], config: SessionConfig): WordEntry[] {
  return buildSessionQueue(words, config.wordCount, config.shuffle);
}

export function loadTrainerPreferences(): {
  builtinWordOverrides: BuiltinWordOverrides;
  customWords: WordEntry[];
  config: SessionConfig;
  displayLanguage: DisplayLanguage;
} {
  return {
    builtinWordOverrides: loadBuiltinWordOverrides(),
    customWords: loadCustomWords(),
    config: loadSessionConfig(),
    displayLanguage: loadDisplayLanguage() ?? defaultDisplayLanguage
  };
}
