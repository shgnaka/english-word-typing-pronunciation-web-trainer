import { useEffect, useState } from "react";
import { defaultWords } from "../../data/defaultWords";
import type { BuiltinWordOverrides, DisplayLanguage, SessionConfig, WordEntry } from "../../domain/types";
import { createWordEntry } from "../../domain/words";
import { clearBrowserTtsCache } from "../../infra/browserTts";
import {
  clearBuiltinWordOverrides,
  defaultDisplayLanguage,
  defaultSessionConfig,
  sanitizeWordCount,
  saveBuiltinWordOverrides,
  saveDisplayLanguage,
  saveCustomWords,
  saveSessionConfig
} from "../../infra/storage";
import { buildAvailableWords, buildResolvedBuiltinWords, buildTrainerQueue, loadTrainerPreferences } from "./trainerData";
import { deriveTrainerViewState } from "./trainerView";
import { useTrainerPronunciation } from "./useTrainerPronunciation";
import { useTrainerSession } from "./useTrainerSession";

export function useTrainer() {
  const [builtinWordOverrides, setBuiltinWordOverrides] = useState<BuiltinWordOverrides>({});
  const [customWords, setCustomWords] = useState<WordEntry[]>([]);
  const [config, setConfig] = useState<SessionConfig>(defaultSessionConfig);
  const [draftConfig, setDraftConfig] = useState<SessionConfig>(defaultSessionConfig);
  const [displayLanguage, setDisplayLanguage] = useState<DisplayLanguage>(defaultDisplayLanguage);
  const [inputValue, setInputValue] = useState("");
  const [addWordError, setAddWordError] = useState("");
  const [editingWordSource, setEditingWordSource] = useState<WordEntry["source"] | null>(null);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingWordValue, setEditingWordValue] = useState("");
  const [browserTtsCacheMessage, setBrowserTtsCacheMessage] = useState<"" | "cleared" | "failed">("");
  const [isClearingBrowserTtsCache, setIsClearingBrowserTtsCache] = useState(false);
  const sessionControls = useTrainerSession();
  const builtinWords = buildResolvedBuiltinWords(builtinWordOverrides);
  const hiddenBuiltinWords = defaultWords.filter((word) => builtinWordOverrides[word.id]?.status === "deleted");
  const editedBuiltinWordIds = Object.entries(builtinWordOverrides)
    .filter(([, override]) => override.status === "edited")
    .map(([wordId]) => wordId);
  const allWords = buildAvailableWords(builtinWords, customWords);
  const pronunciation = useTrainerPronunciation({
    screen: sessionControls.screen,
    countdown: sessionControls.countdown,
    session: sessionControls.session,
    config,
    availableWords: allWords
  });

  useEffect(() => {
    const {
      builtinWordOverrides: loadedBuiltinWordOverrides,
      customWords: loadedCustomWords,
      config: loadedConfig,
      displayLanguage: loadedDisplayLanguage
    } = loadTrainerPreferences();
    setBuiltinWordOverrides(loadedBuiltinWordOverrides);
    setCustomWords(loadedCustomWords);
    setConfig(loadedConfig);
    setDraftConfig(loadedConfig);
    setDisplayLanguage(loadedDisplayLanguage);
    pronunciation.resetAutoPronunciation();
    sessionControls.initializeSession(
      buildTrainerQueue(buildAvailableWords(buildResolvedBuiltinWords(loadedBuiltinWordOverrides), loadedCustomWords), loadedConfig)
    );
  }, []);
  const { currentTarget, currentGuide, score, totalWords, remainingWords, completedWordsCount, progressPercent, isCountdownActive, isTypingActiveLayout, hasPendingConfigChanges } =
    deriveTrainerViewState({
      session: sessionControls.session,
      screen: sessionControls.screen,
      countdown: sessionControls.countdown,
      config,
      draftConfig
    });

  function restartSession(nextConfig = config) {
    pronunciation.resetAutoPronunciation();
    sessionControls.restartSession(allWords, nextConfig);
  }

  function syncSession(nextBuiltinWordOverrides = builtinWordOverrides, nextCustomWords = customWords) {
    pronunciation.resetAutoPronunciation();
    sessionControls.initializeSession(buildTrainerQueue(buildAvailableWords(buildResolvedBuiltinWords(nextBuiltinWordOverrides), nextCustomWords), config));
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
    syncSession(builtinWordOverrides, nextWords);
    setInputValue("");
    setAddWordError("");
  }

  function handleAddWordInputChange(value: string) {
    setInputValue(value);
    if (addWordError) {
      setAddWordError("");
    }
  }

  function handleRemoveWord(wordId: string) {
    const nextWords = customWords.filter((word) => word.id !== wordId);
    setCustomWords(nextWords);
    saveCustomWords(nextWords);
    syncSession(builtinWordOverrides, nextWords);

    if (editingWordId === wordId) {
      setEditingWordSource(null);
      setEditingWordId(null);
      setEditingWordValue("");
      setAddWordError("");
    }
  }

  function moveCustomWord(wordId: string, direction: "up" | "down") {
    const currentIndex = customWords.findIndex((word) => word.id === wordId);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= customWords.length) {
      return;
    }

    const nextWords = [...customWords];
    [nextWords[currentIndex], nextWords[targetIndex]] = [nextWords[targetIndex], nextWords[currentIndex]];
    setCustomWords(nextWords);
    saveCustomWords(nextWords);
    syncSession(builtinWordOverrides, nextWords);
  }

  function startEditingWord(wordId: string, source: WordEntry["source"]) {
    const targetWords = source === "builtin" ? builtinWords : customWords;
    const targetWord = targetWords.find((word) => word.id === wordId);
    if (!targetWord) {
      return;
    }

    setEditingWordSource(source);
    setEditingWordId(wordId);
    setEditingWordValue(targetWord.text);
    setAddWordError("");
  }

  function cancelEditingWord() {
    setEditingWordSource(null);
    setEditingWordId(null);
    setEditingWordValue("");
    setAddWordError("");
  }

  function updateEditingWordValue(value: string) {
    setEditingWordValue(value);
    if (addWordError) {
      setAddWordError("");
    }
  }

  function saveEditingWord() {
    if (!editingWordId || !editingWordSource) {
      return;
    }

    const existingWord = (editingWordSource === "builtin" ? builtinWords : customWords).find((word) => word.id === editingWordId);
    if (!existingWord) {
      cancelEditingWord();
      return;
    }

    const entry = createWordEntry(editingWordValue, "custom");
    if (!entry) {
      setAddWordError("words.error.invalid");
      return;
    }

    if (allWords.some((word) => word.id !== editingWordId && word.normalizedText === entry.normalizedText)) {
      setAddWordError("words.error.duplicate");
      return;
    }

    if (editingWordSource === "builtin") {
      const nextBuiltinWordOverrides: BuiltinWordOverrides = {
        ...builtinWordOverrides,
        [editingWordId]: {
          status: "edited",
          text: entry.text,
          normalizedText: entry.normalizedText,
          updatedAt: new Date().toISOString()
        }
      };

      setBuiltinWordOverrides(nextBuiltinWordOverrides);
      saveBuiltinWordOverrides(nextBuiltinWordOverrides);
      syncSession(nextBuiltinWordOverrides, customWords);
      cancelEditingWord();
      return;
    }

    const nextWords = customWords.map((word) =>
      word.id === editingWordId
        ? {
            ...word,
            id: entry.id,
            text: entry.text,
            normalizedText: entry.normalizedText
          }
        : word
    );

    setCustomWords(nextWords);
    saveCustomWords(nextWords);
    syncSession(builtinWordOverrides, nextWords);
    cancelEditingWord();
  }

  function handleRemoveBuiltinWord(wordId: string) {
    const nextBuiltinWordOverrides: BuiltinWordOverrides = {
      ...builtinWordOverrides,
      [wordId]: {
        status: "deleted",
        updatedAt: new Date().toISOString()
      }
    };

    setBuiltinWordOverrides(nextBuiltinWordOverrides);
    saveBuiltinWordOverrides(nextBuiltinWordOverrides);
    syncSession(nextBuiltinWordOverrides, customWords);

    if (editingWordId === wordId) {
      cancelEditingWord();
    }
  }

  function restoreBuiltinWord(wordId: string) {
    if (!(wordId in builtinWordOverrides)) {
      return;
    }

    const nextBuiltinWordOverrides = { ...builtinWordOverrides };
    delete nextBuiltinWordOverrides[wordId];
    setBuiltinWordOverrides(nextBuiltinWordOverrides);
    saveBuiltinWordOverrides(nextBuiltinWordOverrides);
    syncSession(nextBuiltinWordOverrides, customWords);

    if (editingWordId === wordId) {
      cancelEditingWord();
    }
  }

  function resetBuiltinWords() {
    setBuiltinWordOverrides({});
    clearBuiltinWordOverrides();
    syncSession({}, customWords);

    if (editingWordSource === "builtin") {
      cancelEditingWord();
    }
  }

  function handleConfigChange<K extends keyof SessionConfig>(key: K, value: SessionConfig[K]) {
    if (key === "showKeyboardHint" || key === "showFingerGuide") {
      const nextValue = Boolean(value) as SessionConfig[K];
      setConfig((current) => {
        const nextConfig = {
          ...current,
          [key]: nextValue
        };
        saveSessionConfig(nextConfig);
        return nextConfig;
      });
      setDraftConfig((current) => ({
        ...current,
        [key]: nextValue
      }));
      return;
    }

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

  async function handleClearBrowserTtsCache() {
    setIsClearingBrowserTtsCache(true);
    try {
      await clearBrowserTtsCache();
      setBrowserTtsCacheMessage("cleared");
    } catch {
      setBrowserTtsCacheMessage("failed");
    } finally {
      setIsClearingBrowserTtsCache(false);
    }
  }

  return {
    screen: sessionControls.screen,
    setScreen: sessionControls.setScreen,
    session: sessionControls.session,
    config,
    draftConfig,
    displayLanguage,
    builtinWords,
    hiddenBuiltinWords,
    editedBuiltinWordIds,
    customWords,
    editingWordSource,
    editingWordId,
    editingWordValue,
    inputValue,
    setInputValue: handleAddWordInputChange,
    addWordError,
    browserTtsCacheMessage,
    isClearingBrowserTtsCache,
    countdown: sessionControls.countdown,
    pronunciationStatus: pronunciation.pronunciationStatus,
    currentTarget,
    currentGuide,
    score,
    totalWords,
    remainingWords,
    completedWordsCount,
    progressPercent,
    isCountdownActive,
    isTypingActiveLayout,
    hasPendingConfigChanges,
    handleKeyInput: sessionControls.handleKeyInput,
    handleAddWord,
    handleRemoveWord,
    handleRemoveBuiltinWord,
    restoreBuiltinWord,
    resetBuiltinWords,
    moveCustomWord,
    startEditingWord,
    cancelEditingWord,
    setEditingWordValue: updateEditingWordValue,
    saveEditingWord,
    handleConfigChange,
    applyConfigChanges,
    discardConfigChanges,
    clearBrowserTtsCache: handleClearBrowserTtsCache,
    setDisplayLanguage: handleDisplayLanguageChange,
    restartSession,
    skipCountdown() {
      sessionControls.skipCountdown();
    },
    speakCurrentWord() {
      pronunciation.speakCurrentWord();
    }
  };
}

export type TrainerState = ReturnType<typeof useTrainer>;
