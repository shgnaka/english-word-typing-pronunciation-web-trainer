import { useEffect, useState } from "react";
import { applyKeystroke, createInitialSession } from "../../domain/session";
import type { SessionConfig, TypingSessionState, WordEntry } from "../../domain/types";
import { buildTrainerQueue } from "./trainerData";

export type Screen = "practice" | "words" | "settings" | "results";

function hasActiveCountdown(screen: Screen, countdown: number, session: TypingSessionState): boolean {
  return screen === "practice" && countdown > 0 && !session.isComplete && Boolean(session.currentWord);
}

export function useTrainerSession() {
  const [screen, setScreen] = useState<Screen>("practice");
  const [session, setSession] = useState<TypingSessionState>(() => createInitialSession([]));
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!hasActiveCountdown(screen, countdown, session)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [countdown, screen, session]);

  function initializeSession(queue: WordEntry[]) {
    setSession(createInitialSession(queue));
    setCountdown(queue.length > 0 ? 3 : 0);
  }

  function restartSession(words: WordEntry[], nextConfig: SessionConfig) {
    const queue = buildTrainerQueue(words, nextConfig);
    initializeSession(queue);
    setScreen("practice");
  }

  function handleKeyInput(key: string) {
    if (hasActiveCountdown(screen, countdown, session)) {
      return;
    }

    setSession((current) => {
      const next = applyKeystroke(current, key, Date.now());
      if (next.isComplete && next.completedWords.length > 0) {
        setScreen("results");
      }
      return next;
    });
  }

  return {
    screen,
    setScreen,
    session,
    countdown,
    initializeSession,
    restartSession,
    handleKeyInput,
    skipCountdown() {
      setCountdown(0);
    }
  };
}
