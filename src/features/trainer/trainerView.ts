import { keyboardGuideMap } from "../../domain/keyboard";
import { calculateSessionScore } from "../../domain/scoring";
import { getTargetCharacter } from "../../domain/session";
import type { SessionConfig, TypingSessionState } from "../../domain/types";

export interface TrainerViewState {
  currentTarget: string;
  currentGuide: (typeof keyboardGuideMap)[string] | null;
  score: ReturnType<typeof calculateSessionScore>;
  totalWords: number;
  remainingWords: number;
  completedWordsCount: number;
  progressPercent: number;
  isCountdownActive: boolean;
  isPracticeFocused: boolean;
  isTypingActiveLayout: boolean;
  hasPendingConfigChanges: boolean;
}

export function deriveTrainerViewState(args: {
  session: TypingSessionState;
  screen: "practice" | "words" | "settings" | "results";
  countdown: number;
  config: SessionConfig;
  draftConfig: SessionConfig;
}): TrainerViewState {
  const { session, screen, countdown, config, draftConfig } = args;
  const currentTarget = getTargetCharacter(session);
  const currentGuide = currentTarget ? keyboardGuideMap[currentTarget] : null;
  const score = calculateSessionScore(session.completedWords);
  const totalWords = session.completedWords.length + session.queue.length;
  const remainingWords = session.queue.length;
  const completedWordsCount = session.completedWords.length;
  const progressPercent = totalWords > 0 ? Math.round((completedWordsCount / totalWords) * 100) : 0;
  const isCountdownActive = screen === "practice" && countdown > 0 && !session.isComplete && Boolean(session.currentWord);
  const isPracticeFocused = screen === "practice" && countdown === 0 && !session.isComplete && Boolean(session.currentWord);
  const isTypingActiveLayout = isPracticeFocused;
  const hasPendingConfigChanges = JSON.stringify(config) !== JSON.stringify(draftConfig);

  return {
    currentTarget,
    currentGuide,
    score,
    totalWords,
    remainingWords,
    completedWordsCount,
    progressPercent,
    isCountdownActive,
    isPracticeFocused,
    isTypingActiveLayout,
    hasPendingConfigChanges
  };
}
