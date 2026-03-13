import { defaultWords } from "../../data/defaultWords";
import { buildSessionQueue } from "../../domain/session";
import type { BuiltinWordOverrides, DisplayLanguage, SessionConfig, ThemePreference, WordEntry, WordOrder } from "../../domain/types";
import { dedupeWords, orderWords, resolveBuiltinWords, sanitizeWordOrder } from "../../domain/words";
import {
  defaultDisplayLanguage,
  defaultThemePreference,
  loadBuiltinWordOrder,
  loadBuiltinWordOverrides,
  loadCustomWords,
  loadDisplayLanguage,
  loadSessionConfig,
  loadThemePreference
} from "../../infra/storage";

export function buildResolvedBuiltinWords(overrides: BuiltinWordOverrides): WordEntry[] {
  return resolveBuiltinWords(defaultWords, overrides);
}

export function buildActiveCustomWords(customWords: WordEntry[], order: WordOrder): WordEntry[] {
  return customWords.filter((word) => order.includes(word.id));
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

export function buildActiveWordsFromPreferences(
  builtinWordOverrides: BuiltinWordOverrides,
  customWords: WordEntry[],
  order: WordOrder
): WordEntry[] {
  return buildAvailableWords([...buildResolvedBuiltinWords(builtinWordOverrides), ...buildActiveCustomWords(customWords, order)], order);
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
  themePreference: ThemePreference;
} {
  const customWords = loadCustomWords();
  const builtinWordOverrides = loadBuiltinWordOverrides();
  const resolvedBuiltinWords = buildResolvedBuiltinWords(builtinWordOverrides);
  const wordOrder = buildWordOrder([...resolvedBuiltinWords, ...customWords], loadBuiltinWordOrder());

  return {
    wordOrder,
    builtinWordOverrides,
    customWords,
    config: loadSessionConfig(),
    displayLanguage: loadDisplayLanguage() ?? defaultDisplayLanguage,
    themePreference: loadThemePreference() ?? defaultThemePreference
  };
}
