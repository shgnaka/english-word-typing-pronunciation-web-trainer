import type { SessionScore, TypingResult } from "./types";

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateSessionScore(results: TypingResult[]): SessionScore {
  const totalElapsedMs = results.reduce((sum, result) => sum + result.elapsedMs, 0);
  const totalKeystrokes = results.reduce((sum, result) => sum + result.keystrokes, 0);
  const totalMistakes = results.reduce((sum, result) => sum + result.mistakes, 0);
  const completedChars = results.reduce((sum, result) => sum + result.word.length, 0);

  const minutes = totalElapsedMs > 0 ? totalElapsedMs / 60000 : 1;
  const grossWpm = completedChars / 5 / minutes;
  const accuracy = totalKeystrokes > 0 ? ((totalKeystrokes - totalMistakes) / totalKeystrokes) * 100 : 100;
  const rawScore = grossWpm * (accuracy / 100);

  let level = "Starter";
  if (rawScore >= 55) level = "Expert";
  else if (rawScore >= 40) level = "Advanced";
  else if (rawScore >= 25) level = "Skilled";
  else if (rawScore >= 12) level = "Building";

  return {
    wpm: round(grossWpm),
    accuracy: round(accuracy),
    rawScore: round(rawScore),
    level
  };
}
