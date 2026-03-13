export type WordSource = "builtin" | "custom";

export type BuiltinWordOverrideStatus = "edited" | "deleted";

export interface BuiltinWordOverride {
  status: BuiltinWordOverrideStatus;
  text?: string;
  normalizedText?: string;
  updatedAt: string;
}

export type BuiltinWordOverrides = Record<string, BuiltinWordOverride>;
export type WordOrder = string[];

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
  browserTtsEnabled: boolean;
  showFingerGuide: boolean;
  showKeyboardHint: boolean;
  showWordReading: boolean;
}

export type ReadingHintConfidence = "high" | "medium" | "low";
export type ReadingHintStrategy = "exception" | "rule-based";

export interface ReadingHint {
  text: string;
  confidence: ReadingHintConfidence;
  strategy: ReadingHintStrategy;
}

export interface ReadingResult extends ReadingHint {
  normalized: string;
  graphemes: string[];
  phonemes: string[];
  moras: string[];
  katakana: string;
}

export interface TypingResult {
  wordId: string;
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
  lastMistypedKey: string | null;
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
