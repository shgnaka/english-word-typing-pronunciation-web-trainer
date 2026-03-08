import { describe, expect, it } from "vitest";
import { calculateSessionScore } from "./scoring";
import type { TypingResult } from "./types";

function buildResult(word: string, elapsedMs: number, keystrokes: number, mistakes: number): TypingResult {
  return {
    word,
    elapsedMs,
    keystrokes,
    mistakes,
    completed: true
  };
}

describe("calculateSessionScore", () => {
  it.each([
    {
      name: "case 1: apple in 60 seconds",
      results: [buildResult("apple", 60000, 5, 0)],
      expected: { wpm: 1, accuracy: 100, rawScore: 1, level: "Starter" }
    },
    {
      name: "case 2: apple in 12 seconds",
      results: [buildResult("apple", 12000, 5, 0)],
      expected: { wpm: 5, accuracy: 100, rawScore: 5, level: "Starter" }
    },
    {
      name: "case 3: apple in 6 seconds",
      results: [buildResult("apple", 6000, 5, 0)],
      expected: { wpm: 10, accuracy: 100, rawScore: 10, level: "Starter" }
    },
    {
      name: "case 4: apple in 5 seconds reaches Building",
      results: [buildResult("apple", 5000, 5, 0)],
      expected: { wpm: 12, accuracy: 100, rawScore: 12, level: "Building" }
    },
    {
      name: "case 5: apple in 2.4 seconds reaches Skilled",
      results: [buildResult("apple", 2400, 5, 0)],
      expected: { wpm: 25, accuracy: 100, rawScore: 25, level: "Skilled" }
    },
    {
      name: "case 6: apple in 1.5 seconds reaches Advanced",
      results: [buildResult("apple", 1500, 5, 0)],
      expected: { wpm: 40, accuracy: 100, rawScore: 40, level: "Advanced" }
    },
    {
      name: "case 7: apple in 1.091 seconds reaches Expert",
      results: [buildResult("apple", 1091, 5, 0)],
      expected: { wpm: 55, accuracy: 100, rawScore: 55, level: "Expert" }
    },
    {
      name: "case 8: one mistake drops raw score below Building",
      results: [buildResult("apple", 5000, 6, 1)],
      expected: { wpm: 12, accuracy: 83.3, rawScore: 10, level: "Starter" }
    },
    {
      name: "case 9: faster run with one mistake stays in Building",
      results: [buildResult("apple", 2500, 6, 1)],
      expected: { wpm: 24, accuracy: 83.3, rawScore: 20, level: "Building" }
    },
    {
      name: "case 10: multi-word session aggregates time and mistakes",
      results: [buildResult("apple", 3000, 5, 0), buildResult("banana", 3000, 6, 1)],
      expected: { wpm: 22, accuracy: 90.9, rawScore: 20, level: "Building" }
    }
  ])("$name", ({ results, expected }) => {
    expect(calculateSessionScore(results)).toEqual(expected);
  });

  it("returns a perfect default score when there are no completed words", () => {
    expect(calculateSessionScore([])).toEqual({
      wpm: 0,
      accuracy: 100,
      rawScore: 0,
      level: "Starter"
    });
  });
});
