import { useEffect, useState } from "react";
import { defaultWords } from "../../data/defaultWords";
import { keyboardGuideMap } from "../../domain/keyboard";
import { calculateSessionScore } from "../../domain/scoring";
import { applyKeystroke, buildSessionQueue, createInitialSession, getTargetCharacter } from "../../domain/session";
import type { SessionConfig, TypingSessionState, WordEntry } from "../../domain/types";
import { createWordEntry, dedupeWords } from "../../domain/words";
import {
  defaultSessionConfig,
  loadCustomWords,
  loadSessionConfig,
  saveCustomWords,
  saveSessionConfig
} from "../../infra/storage";
import { speakWord } from "../../infra/speech";

type Screen = "practice" | "words" | "settings" | "results";

export function useTrainer() {
  const [screen, setScreen] = useState<Screen>("practice");
  const [customWords, setCustomWords] = useState<WordEntry[]>([]);
  const [config, setConfig] = useState<SessionConfig>(defaultSessionConfig);
  const [session, setSession] = useState<TypingSessionState>(() => createInitialSession([]));
  const [inputValue, setInputValue] = useState("");
  const [addWordError, setAddWordError] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const loadedCustomWords = loadCustomWords();
    const loadedConfig = loadSessionConfig();
    setCustomWords(loadedCustomWords);
    setConfig(loadedConfig);
    const queue = buildSessionQueue(dedupeWords([...defaultWords, ...loadedCustomWords]), loadedConfig.wordCount, loadedConfig.shuffle);
    setSession(createInitialSession(queue));
    setCountdown(queue.length > 0 ? 3 : 0);
  }, []);

  useEffect(() => {
    if (screen !== "practice" || countdown <= 0 || !session.currentWord || session.isComplete) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [countdown, screen, session.currentWord, session.isComplete]);

  const allWords = dedupeWords([...defaultWords, ...customWords]);
  const currentTarget = getTargetCharacter(session);
  const currentGuide = currentTarget ? keyboardGuideMap[currentTarget] : null;
  const score = calculateSessionScore(session.completedWords);
  const totalWords = session.completedWords.length + session.queue.length;
  const remainingWords = session.queue.length;
  const completedWordsCount = session.completedWords.length;
  const progressPercent = totalWords > 0 ? Math.round((completedWordsCount / totalWords) * 100) : 0;
  const isCountdownActive = screen === "practice" && countdown > 0 && !session.isComplete && Boolean(session.currentWord);

  function restartSession(nextConfig = config) {
    const queue = buildSessionQueue(allWords, nextConfig.wordCount, nextConfig.shuffle);
    setSession(createInitialSession(queue));
    setCountdown(queue.length > 0 ? 3 : 0);
    setScreen("practice");
  }

  function handleKeyInput(key: string) {
    if (isCountdownActive) {
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

  function handleAddWord() {
    const entry = createWordEntry(inputValue, "custom");
    if (!entry) {
      setAddWordError("Enter letters only.");
      return;
    }

    if (allWords.some((word) => word.normalizedText === entry.normalizedText)) {
      setAddWordError("That word already exists.");
      return;
    }

    const nextWords = [...customWords, entry];
    setCustomWords(nextWords);
    saveCustomWords(nextWords);
    setInputValue("");
    setAddWordError("");
  }

  function handleConfigChange<K extends keyof SessionConfig>(key: K, value: SessionConfig[K]) {
    const nextConfig = {
      ...config,
      [key]: value
    };
    setConfig(nextConfig);
    saveSessionConfig(nextConfig);
  }

  return {
    screen,
    setScreen,
    session,
    config,
    customWords,
    inputValue,
    setInputValue,
    addWordError,
    countdown,
    currentTarget,
    currentGuide,
    score,
    totalWords,
    remainingWords,
    completedWordsCount,
    progressPercent,
    isCountdownActive,
    handleKeyInput,
    handleAddWord,
    handleConfigChange,
    restartSession,
    speakCurrentWord() {
      if (session.currentWord && config.speechEnabled) {
        speakWord(session.currentWord.text);
      }
    }
  };
}
