import { useEffect, useRef, useState } from "react";
import type { SessionConfig, TypingSessionState, WordEntry } from "../../domain/types";
import { hasCachedWordAudio, preloadBrowserTtsWords } from "../../infra/browserTts";
import { speakWord } from "../../infra/speech";
import type { Screen } from "./useTrainerSession";

export type PronunciationStatus = "idle" | "generating" | "playing" | "fallback" | "error";

interface UseTrainerPronunciationArgs {
  screen: Screen;
  countdown: number;
  session: TypingSessionState;
  config: SessionConfig;
  availableWords: WordEntry[];
}

export function useTrainerPronunciation(args: UseTrainerPronunciationArgs) {
  const { screen, countdown, session, config, availableWords } = args;
  const [pronunciationStatus, setPronunciationStatus] = useState<PronunciationStatus>("idle");
  const lastAutoPronouncedWordRef = useRef<string | null>(null);
  const isManualPronunciationPendingRef = useRef(false);

  useEffect(() => {
    if (screen !== "practice" || countdown > 0 || !config.speechEnabled || !session.currentWord || session.isComplete) {
      return;
    }

    const pronunciationKey = `${session.currentWord.id}:${session.completedWords.length}`;
    if (lastAutoPronouncedWordRef.current === pronunciationKey) {
      return;
    }

    void speakWord(session.currentWord.text, {
      browserTtsEnabled: config.browserTtsEnabled,
      trigger: "auto"
    });
    lastAutoPronouncedWordRef.current = pronunciationKey;
  }, [config.browserTtsEnabled, config.speechEnabled, countdown, screen, session.completedWords.length, session.currentWord, session.isComplete]);

  useEffect(() => {
    setPronunciationStatus("idle");
  }, [session.currentWord?.id]);

  useEffect(() => {
    if (!config.speechEnabled || !config.browserTtsEnabled) {
      return;
    }

    preloadBrowserTtsWords(availableWords.map((word) => word.text));
  }, [availableWords, config.browserTtsEnabled, config.speechEnabled]);

  async function pronounceCurrentWord(trigger: "auto" | "manual") {
    if (!session.currentWord || !config.speechEnabled) {
      return;
    }

    if (trigger === "manual" && isManualPronunciationPendingRef.current) {
      return;
    }

    const word = session.currentWord.text;

    if (trigger === "manual") {
      isManualPronunciationPendingRef.current = true;

      if (config.browserTtsEnabled) {
        const hasCachedAudio = await hasCachedWordAudio(word).catch(() => false);
        setPronunciationStatus(hasCachedAudio ? "playing" : "generating");
      } else {
        setPronunciationStatus("playing");
      }
    }

    try {
      const result = await speakWord(word, {
        browserTtsEnabled: config.browserTtsEnabled,
        trigger
      });

      if (trigger === "manual" && result.source === "none") {
        setPronunciationStatus("error");
        return;
      }

      if (trigger === "manual" && config.browserTtsEnabled && result.source === "speech-synthesis") {
        setPronunciationStatus("fallback");
        return;
      }

      if (trigger === "manual") {
        setPronunciationStatus("idle");
      }
    } catch {
      if (trigger === "manual") {
        setPronunciationStatus("error");
      }
    } finally {
      if (trigger === "manual") {
        isManualPronunciationPendingRef.current = false;
      }
    }
  }

  return {
    pronunciationStatus,
    resetAutoPronunciation() {
      lastAutoPronouncedWordRef.current = null;
    },
    speakCurrentWord() {
      void pronounceCurrentWord("manual");
    }
  };
}
