export type WordSource = "builtin" | "custom";

export interface WordEntry {
  id: string;
  text: string;
  normalizedText: string;
  source: WordSource;
  createdAt: string;
}

export interface SessionConfig {
  wordCount: number;
  shuffle: boolean;
  speechEnabled: boolean;
  showFingerGuide: boolean;
  showKeyboardHint: boolean;
}

export interface TypingResult {
  word: string;
  elapsedMs: number;
  keystrokes: number;
  mistakes: number;
  completed: boolean;
}

export interface SessionScore {
  wpm: number;
  accuracy: number;
  rawScore: number;
  level: string;
}

export interface TypingSessionState {
  queue: WordEntry[];
  currentWord: WordEntry | null;
  charIndex: number;
  mistakes: number;
  keystrokes: number;
  startedAt: number | null;
  completedWords: TypingResult[];
  isComplete: boolean;
  lastInputCorrect: boolean | null;
}

export type FingerId =
  | "left-pinky"
  | "left-ring"
  | "left-middle"
  | "left-index"
  | "right-index"
  | "right-middle"
  | "right-ring"
  | "right-pinky";

export type DisplayLanguage = "en" | "ja" | "ja-hira";

export interface KeyboardGuide {
  keyPosition: string;
  finger: string;
  fingerId: FingerId;
}

export type KeyboardGuideMap = Record<string, KeyboardGuide>;
