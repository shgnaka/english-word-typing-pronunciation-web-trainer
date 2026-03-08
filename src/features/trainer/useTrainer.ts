import { useEffect, useRef, useState } from "react";
import { defaultWords } from "../../data/defaultWords";
import { applyKeystroke, buildSessionQueue, createInitialSession } from "../../domain/session";
import type { DisplayLanguage, SessionConfig, TypingSessionState, WordEntry } from "../../domain/types";
import { createWordEntry, dedupeWords } from "../../domain/words";
import { hasCachedWordAudio, preloadBrowserTtsWords } from "../../infra/browserTts";
import {
  defaultDisplayLanguage,
  defaultSessionConfig,
  loadDisplayLanguage,
  loadCustomWords,
  loadSessionConfig,
  sanitizeWordCount,
  saveDisplayLanguage,
  saveCustomWords,
  saveSessionConfig
} from "../../infra/storage";
import { speakWord } from "../../infra/speech";
import { deriveTrainerViewState } from "./trainerView";

type Screen = "practice" | "words" | "settings" | "results";
type PronunciationStatus = "idle" | "generating" | "fallback";

export function useTrainer() {
  const [screen, setScreen] = useState<Screen>("practice");
  const [customWords, setCustomWords] = useState<WordEntry[]>([]);
  const [config, setConfig] = useState<SessionConfig>(defaultSessionConfig);
  const [draftConfig, setDraftConfig] = useState<SessionConfig>(defaultSessionConfig);
  const [displayLanguage, setDisplayLanguage] = useState<DisplayLanguage>(defaultDisplayLanguage);
  const [session, setSession] = useState<TypingSessionState>(() => createInitialSession([]));
  const [inputValue, setInputValue] = useState("");
  const [addWordError, setAddWordError] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [pronunciationStatus, setPronunciationStatus] = useState<PronunciationStatus>("idle");
  const lastAutoPronouncedWordRef = useRef<string | null>(null);

  useEffect(() => {
    const loadedCustomWords = loadCustomWords();
    const loadedConfig = loadSessionConfig();
    const loadedDisplayLanguage = loadDisplayLanguage();
    setCustomWords(loadedCustomWords);
    setConfig(loadedConfig);
    setDraftConfig(loadedConfig);
    setDisplayLanguage(loadedDisplayLanguage);
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

    preloadBrowserTtsWords(dedupeWords([...defaultWords, ...customWords]).map((word) => word.text));
  }, [config.browserTtsEnabled, config.speechEnabled, customWords]);

  const allWords = dedupeWords([...defaultWords, ...customWords]);
  const { currentTarget, currentGuide, score, totalWords, remainingWords, completedWordsCount, progressPercent, isCountdownActive, hasPendingConfigChanges } =
    deriveTrainerViewState({
      session,
      screen,
      countdown,
      config,
      draftConfig
    });

  function restartSession(nextConfig = config) {
    const queue = buildSessionQueue(allWords, nextConfig.wordCount, nextConfig.shuffle);
    lastAutoPronouncedWordRef.current = null;
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
      setAddWordError("words.error.invalid");
      return;
    }

    if (allWords.some((word) => word.normalizedText === entry.normalizedText)) {
      setAddWordError("words.error.duplicate");
      return;
    }

    const nextWords = [...customWords, entry];
    setCustomWords(nextWords);
    saveCustomWords(nextWords);
    setInputValue("");
    setAddWordError("");
  }

  function handleAddWordInputChange(value: string) {
    setInputValue(value);
    if (addWordError) {
      setAddWordError("");
    }
  }

  function handleConfigChange<K extends keyof SessionConfig>(key: K, value: SessionConfig[K]) {
    setDraftConfig((current) => ({
      ...current,
      [key]: key === "wordCount" ? sanitizeWordCount(value as number) : value
    }));
  }

  function applyConfigChanges() {
    setConfig(draftConfig);
    saveSessionConfig(draftConfig);
    restartSession(draftConfig);
  }

  function discardConfigChanges() {
    setDraftConfig(config);
  }

  function handleDisplayLanguageChange(language: DisplayLanguage) {
    setDisplayLanguage(language);
    saveDisplayLanguage(language);
  }

  async function pronounceCurrentWord(trigger: "auto" | "manual") {
    if (!session.currentWord || !config.speechEnabled) {
      return;
    }

    const word = session.currentWord.text;

    if (trigger === "manual" && config.browserTtsEnabled) {
      const hasCachedAudio = await hasCachedWordAudio(word).catch(() => false);
      if (!hasCachedAudio) {
        setPronunciationStatus("generating");
      }
    }

    const result = await speakWord(word, {
      browserTtsEnabled: config.browserTtsEnabled,
      trigger
    });

    if (trigger === "manual" && config.browserTtsEnabled && result.source === "speech-synthesis") {
      setPronunciationStatus("fallback");
      return;
    }

    if (trigger === "manual") {
      setPronunciationStatus("idle");
    }
  }

  return {
    screen,
    setScreen,
    session,
    config,
    draftConfig,
    displayLanguage,
    customWords,
    inputValue,
    setInputValue: handleAddWordInputChange,
    addWordError,
    countdown,
    pronunciationStatus,
    currentTarget,
    currentGuide,
    score,
    totalWords,
    remainingWords,
    completedWordsCount,
    progressPercent,
    isCountdownActive,
    hasPendingConfigChanges,
    handleKeyInput,
    handleAddWord,
    handleConfigChange,
    applyConfigChanges,
    discardConfigChanges,
    setDisplayLanguage: handleDisplayLanguageChange,
    restartSession,
    skipCountdown() {
      setCountdown(0);
    },
    speakCurrentWord() {
      void pronounceCurrentWord("manual");
    }
  };
}

export type TrainerState = ReturnType<typeof useTrainer>;
