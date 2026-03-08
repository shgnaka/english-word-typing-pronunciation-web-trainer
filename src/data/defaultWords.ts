import { createWordEntry } from "../domain/words";
import type { WordEntry } from "../domain/types";

// Keep the default list beginner-friendly: shorter, more familiar words first,
// then gradually introduce longer words and more finger travel.
const baseWords = [
  "apple",
  "book",
  "happy",
  "smile",
  "music",
  "chair",
  "dream",
  "earth",
  "friend",
  "garden",
  "orange",
  "quick",
  "river",
  "travel",
  "nature",
  "planet",
  "island",
  "journey",
  "keyboard",
  "language"
];

export const defaultWords: WordEntry[] = baseWords
  .map((word) => createWordEntry(word, "builtin"))
  .filter((word): word is WordEntry => word !== null);
