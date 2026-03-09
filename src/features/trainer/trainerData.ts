import { defaultWords } from "../../data/defaultWords";
import { buildSessionQueue } from "../../domain/session";
import type { BuiltinWordOrder, BuiltinWordOverrides, DisplayLanguage, SessionConfig, WordEntry } from "../../domain/types";
import { dedupeWords, orderBuiltinWords, resolveBuiltinWords, sanitizeBuiltinWordOrder } from "../../domain/words";
import { defaultDisplayLanguage, loadBuiltinWordOrder, loadBuiltinWordOverrides, loadCustomWords, loadDisplayLanguage, loadSessionConfig } from "../../infra/storage";

export function buildResolvedBuiltinWords(overrides: BuiltinWordOverrides, order: BuiltinWordOrder): WordEntry[] {
  return orderBuiltinWords(resolveBuiltinWords(defaultWords, overrides), order);
}

export function buildResolvedHiddenBuiltinWords(overrides: BuiltinWordOverrides, order: BuiltinWordOrder): WordEntry[] {
  const hiddenWords = defaultWords.filter((word) => overrides[word.id]?.status === "deleted");
  return orderBuiltinWords(hiddenWords, order);
}

export function buildBuiltinWordOrder(order: BuiltinWordOrder): BuiltinWordOrder {
  return sanitizeBuiltinWordOrder(defaultWords, order);
}

export function buildAvailableWords(builtinWords: WordEntry[], customWords: WordEntry[]): WordEntry[] {
  return dedupeWords([...builtinWords, ...customWords]);
}

export function buildTrainerQueue(words: WordEntry[], config: SessionConfig): WordEntry[] {
  return buildSessionQueue(words, config.wordCount, config.shuffle);
}

export function loadTrainerPreferences(): {
  builtinWordOrder: BuiltinWordOrder;
  builtinWordOverrides: BuiltinWordOverrides;
  customWords: WordEntry[];
  config: SessionConfig;
  displayLanguage: DisplayLanguage;
} {
  return {
    builtinWordOrder: buildBuiltinWordOrder(loadBuiltinWordOrder()),
    builtinWordOverrides: loadBuiltinWordOverrides(),
    customWords: loadCustomWords(),
    config: loadSessionConfig(),
    displayLanguage: loadDisplayLanguage() ?? defaultDisplayLanguage
  };
}
