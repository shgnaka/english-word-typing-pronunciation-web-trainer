import type { ReadingHint, ReadingResult } from "../types";
import { lookupReadingException } from "./exceptions";
import { graphemesToPhonemes } from "./graphemesToPhonemes";
import { morasToKatakana } from "./morasToKatakana";
import { normalizeReadingInput } from "./normalize";
import { phonemesToMoras } from "./phonemesToMoras";
import { tokenizeGraphemes } from "./tokenizeGraphemes";

const ambiguousGraphemes = new Set(["ea", "gh", "ow", "ou", "th"]);

function deriveConfidence(graphemes: string[], katakana: string): ReadingResult["confidence"] {
  if (!katakana || katakana.length > 24) {
    return "low";
  }

  const ambiguousCount = graphemes.filter((grapheme) => ambiguousGraphemes.has(grapheme)).length;
  if (ambiguousCount >= 2) {
    return "medium";
  }

  return "high";
}

export function convertWordToKatakana(word: string): ReadingResult | null {
  const normalized = normalizeReadingInput(word);
  if (!normalized) {
    return null;
  }

  const exceptionReading = lookupReadingException(normalized);
  if (exceptionReading) {
    return {
      normalized,
      graphemes: [],
      phonemes: [],
      moras: [exceptionReading],
      katakana: exceptionReading,
      text: exceptionReading,
      confidence: "high",
      strategy: "exception"
    };
  }

  const graphemes = tokenizeGraphemes(normalized);
  const phonemes = graphemesToPhonemes(graphemes);
  const moras = phonemesToMoras(phonemes);
  const katakana = morasToKatakana(moras);
  const confidence = deriveConfidence(graphemes, katakana);

  return {
    normalized,
    graphemes,
    phonemes,
    moras,
    katakana,
    text: katakana,
    confidence,
    strategy: "rule-based"
  };
}

export function generateReadingHint(word: string): ReadingHint | null {
  const result = convertWordToKatakana(word);
  if (!result || !result.katakana) {
    return null;
  }

  return {
    text: result.katakana,
    confidence: result.confidence,
    strategy: result.strategy
  };
}
