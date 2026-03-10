import type { BuiltinWordOverrides, WordEntry, WordOrder } from "./types";

export function normalizeWord(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z]/g, "");
}

export function createWordEntry(text: string, source: WordEntry["source"]): WordEntry | null {
  const normalizedText = normalizeWord(text);
  if (!normalizedText) {
    return null;
  }

  return {
    id: `${source}-${normalizedText}`,
    text: normalizedText,
    normalizedText,
    source,
    createdAt: new Date().toISOString()
  };
}

export function dedupeWords(words: WordEntry[]): WordEntry[] {
  const seen = new Set<string>();
  return words.filter((word) => {
    if (seen.has(word.normalizedText)) {
      return false;
    }
    seen.add(word.normalizedText);
    return true;
  });
}

export function resolveBuiltinWords(words: WordEntry[], overrides: BuiltinWordOverrides): WordEntry[] {
  return words.flatMap((word) => {
    const override = overrides[word.id];
    if (!override) {
      return [word];
    }

    if (override.status === "deleted") {
      return [];
    }

    return [
      {
        ...word,
        text: override.text ?? word.text,
        normalizedText: override.normalizedText ?? word.normalizedText
      }
    ];
  });
}

export function sanitizeWordOrder(words: WordEntry[], order: WordOrder): WordOrder {
  const validIds = new Set(words.map((word) => word.id));
  const sanitizedOrder = order.filter((wordId) => validIds.has(wordId));
  const seen = new Set(sanitizedOrder);

  for (const word of words) {
    if (!seen.has(word.id)) {
      sanitizedOrder.push(word.id);
      seen.add(word.id);
    }
  }

  return sanitizedOrder;
}

export function orderWords(words: WordEntry[], order: WordOrder): WordEntry[] {
  const sanitizedOrder = sanitizeWordOrder(words, order);
  const orderById = new Map(sanitizedOrder.map((wordId, index) => [wordId, index]));

  return [...words].sort((left, right) => {
    return (orderById.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (orderById.get(right.id) ?? Number.MAX_SAFE_INTEGER);
  });
}
