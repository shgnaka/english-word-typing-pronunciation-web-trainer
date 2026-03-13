import { describe, expect, it } from "vitest";
import {
  convertWordToKatakana,
  generateReadingHint,
  graphemesToPhonemes,
  lookupReadingException,
  morasToKatakana,
  normalizeReadingInput,
  phonemesToMoras,
  tokenizeGraphemes
} from "./reading";

describe("reading pipeline", () => {
  it("normalizes reading input", () => {
    expect(normalizeReadingInput("Hello")).toBe("hello");
    expect(normalizeReadingInput("it's")).toBe("its");
    expect(normalizeReadingInput("X-ray")).toBe("xray");
  });

  it("looks up exception readings", () => {
    expect(lookupReadingException("one")).toBe("ワン");
    expect(lookupReadingException("queue")).toBe("キュー");
  });

  it("tokenizes graphemes with longest-match patterns", () => {
    expect(tokenizeGraphemes("phone")).toEqual(["ph", "o", "n", "e"]);
    expect(tokenizeGraphemes("light")).toEqual(["l", "igh", "t"]);
    expect(tokenizeGraphemes("chair")).toEqual(["ch", "ai", "r"]);
  });

  it("maps graphemes to simplified phonemes", () => {
    expect(graphemesToPhonemes(["ph", "o", "n", "e"])).toEqual(["F", "OU", "N"]);
    expect(graphemesToPhonemes(["qu", "i", "ck"])).toEqual(["KW", "I", "K"]);
  });

  it("maps phonemes to moras and katakana", () => {
    expect(phonemesToMoras(["S", "T", "R", "AI", "K"])).toEqual(["ス", "ト", "ラ", "イ", "ッ", "ク"]);
    expect(morasToKatakana(["ス", "ト", "ラ", "イ", "ク"])).toBe("ストライク");
  });

  it("converts straightforward rule-based words", () => {
    expect(convertWordToKatakana("rain")).toMatchObject({
      katakana: "レイン",
      strategy: "rule-based"
    });
    expect(convertWordToKatakana("train")).toMatchObject({
      katakana: "トレイン",
      strategy: "rule-based"
    });
    expect(convertWordToKatakana("strike")).toMatchObject({
      katakana: "ストライック",
      strategy: "rule-based"
    });
  });

  it("uses exceptions for irregular and high-value words", () => {
    expect(convertWordToKatakana("computer")).toMatchObject({
      katakana: "コンピューター",
      strategy: "exception",
      confidence: "high"
    });
    expect(convertWordToKatakana("hello")).toMatchObject({
      katakana: "ハロー",
      strategy: "exception"
    });
  });

  it("returns null for empty input", () => {
    expect(convertWordToKatakana("!!!")).toBeNull();
    expect(generateReadingHint("")).toBeNull();
  });
});
