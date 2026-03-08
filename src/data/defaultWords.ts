import { createWordEntry } from "../domain/words";
import type { WordEntry } from "../domain/types";

const baseWords = [
  "apple",
  "book",
  "chair",
  "dream",
  "earth",
  "friend",
  "garden",
  "happy",
  "island",
  "journey",
  "keyboard",
  "language",
  "music",
  "nature",
  "orange",
  "planet",
  "quick",
  "river",
  "smile",
  "travel"
];

export const defaultWords: WordEntry[] = baseWords
  .map((word) => createWordEntry(word, "builtin"))
  .filter((word): word is WordEntry => word !== null);
