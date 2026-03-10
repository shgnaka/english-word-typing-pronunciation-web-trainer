import type { TypingResult, TypingSessionState, WordEntry } from "./types";

export function buildSessionQueue(words: WordEntry[], wordCount: number, shuffle: boolean): WordEntry[] {
  const queue = [...words];
  if (shuffle) {
    for (let index = queue.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [queue[index], queue[swapIndex]] = [queue[swapIndex], queue[index]];
    }
  }
  return queue.slice(0, Math.min(wordCount, queue.length));
}

export function createInitialSession(queue: WordEntry[]): TypingSessionState {
  return {
    queue,
    currentWord: queue[0] ?? null,
    charIndex: 0,
    mistakes: 0,
    keystrokes: 0,
    startedAt: null,
    completedWords: [],
    isComplete: queue.length === 0,
    lastInputCorrect: null,
    lastMistypedKey: null
  };
}

export function getTargetCharacter(state: TypingSessionState): string {
  return state.currentWord?.text[state.charIndex] ?? "";
}

function buildResult(wordId: string, word: string, startedAt: number, endedAt: number, keystrokes: number, mistakes: number): TypingResult {
  return {
    wordId,
    word,
    elapsedMs: Math.max(endedAt - startedAt, 1),
    keystrokes,
    mistakes,
    completed: true
  };
}

export function applyKeystroke(
  state: TypingSessionState,
  key: string,
  timestamp: number
): TypingSessionState {
  if (!state.currentWord || state.isComplete) {
    return state;
  }

  const normalizedKey = key.toLowerCase();
  if (!/^[a-z]$/.test(normalizedKey)) {
    return state;
  }

  const startedAt = state.startedAt ?? timestamp;
  const target = getTargetCharacter(state);
  const nextKeystrokes = state.keystrokes + 1;

  if (normalizedKey !== target) {
    return {
      ...state,
      startedAt,
      keystrokes: nextKeystrokes,
      mistakes: state.mistakes + 1,
      lastInputCorrect: false,
      lastMistypedKey: normalizedKey
    };
  }

  const nextIndex = state.charIndex + 1;
  const currentWord = state.currentWord;

  if (nextIndex < currentWord.text.length) {
    return {
      ...state,
      startedAt,
      charIndex: nextIndex,
      keystrokes: nextKeystrokes,
      lastInputCorrect: true,
      lastMistypedKey: null
    };
  }

  const result = buildResult(currentWord.id, currentWord.text, startedAt, timestamp, nextKeystrokes, state.mistakes);
  const remainingQueue = state.queue.slice(1);

  return {
    queue: remainingQueue,
    currentWord: remainingQueue[0] ?? null,
    charIndex: 0,
    mistakes: 0,
    keystrokes: 0,
    startedAt: remainingQueue[0] ? timestamp : null,
    completedWords: [...state.completedWords, result],
    isComplete: remainingQueue.length === 0,
    lastInputCorrect: true,
    lastMistypedKey: null
  };
}
