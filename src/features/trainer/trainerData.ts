import { defaultWords } from "../../data/defaultWords";
import { buildSessionQueue } from "../../domain/session";
import type { BuiltinWordOverrides, DisplayLanguage, SessionConfig, WordEntry, WordOrder } from "../../domain/types";
import { dedupeWords, orderWords, resolveBuiltinWords, sanitizeWordOrder } from "../../domain/words";
import { defaultDisplayLanguage, loadBuiltinWordOrder, loadBuiltinWordOverrides, loadCustomWords, loadDisplayLanguage, loadSessionConfig } from "../../infra/storage";

export function buildResolvedBuiltinWords(overrides: BuiltinWordOverrides): WordEntry[] {
  return resolveBuiltinWords(defaultWords, overrides);
}

export function buildResolvedHiddenBuiltinWords(overrides: BuiltinWordOverrides, order: WordOrder): WordEntry[] {
  const hiddenWords = defaultWords.filter((word) => overrides[word.id]?.status === "deleted");
  return orderWords(hiddenWords, order);
}

export function buildWordOrder(words: WordEntry[], order: WordOrder): WordOrder {
  return sanitizeWordOrder(words, order);
}

export function buildAvailableWords(words: WordEntry[], order: WordOrder): WordEntry[] {
  return dedupeWords(orderWords(words, order));
}

export function buildTrainerQueue(words: WordEntry[], config: SessionConfig): WordEntry[] {
  return buildSessionQueue(words, config.wordCount, config.shuffle);
}

export function loadTrainerPreferences(): {
  wordOrder: WordOrder;
  builtinWordOverrides: BuiltinWordOverrides;
  customWords: WordEntry[];
  config: SessionConfig;
  displayLanguage: DisplayLanguage;
} {
  const customWords = loadCustomWords();
  const builtinWordOverrides = loadBuiltinWordOverrides();
  const resolvedBuiltinWords = buildResolvedBuiltinWords(builtinWordOverrides);

  return {
    wordOrder: buildWordOrder([...resolvedBuiltinWords, ...customWords], loadBuiltinWordOrder()),
    builtinWordOverrides,
    customWords,
    config: loadSessionConfig(),
    displayLanguage: loadDisplayLanguage() ?? defaultDisplayLanguage
  };
}
