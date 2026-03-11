import { useEffect, useRef, useState } from "react";
import type { SessionConfig, TypingSessionState, WordEntry } from "../../domain/types";
import { hasCachedWordAudio, preloadBrowserTtsWords } from "../../infra/browserTts";
import { speakWord } from "../../infra/speech";
import { PronunciationOrchestrator } from "./pronunciationOrchestrator";
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
  const orchestratorRef = useRef<PronunciationOrchestrator | null>(null);

  if (!orchestratorRef.current) {
    orchestratorRef.current = new PronunciationOrchestrator(
      {
        hasCachedWordAudio,
        preloadBrowserTtsWords,
        speakWord
      },
      setPronunciationStatus
    );
  }

  useEffect(() => {
    const pronunciationKey = session.currentWord ? `${session.currentWord.id}:${session.completedWords.length}` : null;
    orchestratorRef.current?.syncCurrentWord({
      screen,
      countdown,
      sessionKey: pronunciationKey,
      currentWord: session.currentWord?.text ?? null,
      speechEnabled: config.speechEnabled,
      browserTtsEnabled: config.browserTtsEnabled,
      isComplete: session.isComplete
    });
  }, [config.browserTtsEnabled, config.speechEnabled, countdown, screen, session.completedWords.length, session.currentWord, session.isComplete]);

  useEffect(() => {
    orchestratorRef.current?.preloadAvailableWords(availableWords, config);
  }, [availableWords, config.browserTtsEnabled, config.speechEnabled]);

  return {
    pronunciationStatus,
    resetAutoPronunciation() {
      orchestratorRef.current?.resetAutoPronunciation();
    },
    speakCurrentWord() {
      void orchestratorRef.current?.speakCurrentWord(session.currentWord?.text ?? null, config);
    }
  };
}
