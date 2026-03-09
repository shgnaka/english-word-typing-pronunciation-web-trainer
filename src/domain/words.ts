import type { BuiltinWordOverrides, WordEntry } from "./types";

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
