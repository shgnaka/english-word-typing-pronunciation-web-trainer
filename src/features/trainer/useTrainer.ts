import { useEffect, useState } from "react";
import type { BuiltinWordOverrides, DisplayLanguage, SessionConfig, WordEntry, WordOrder } from "../../domain/types";
import { createWordEntry, dedupeWords } from "../../domain/words";
import { clearBrowserTtsCache } from "../../infra/browserTts";
import {
  clearBuiltinWordOrder,
  clearBuiltinWordOverrides,
  defaultDisplayLanguage,
  defaultSessionConfig,
  saveBuiltinWordOrder,
  sanitizeWordCount,
  saveBuiltinWordOverrides,
  saveDisplayLanguage,
  saveCustomWords,
  saveSessionConfig
} from "../../infra/storage";
import { buildAvailableWords, buildResolvedBuiltinWords, buildResolvedHiddenBuiltinWords, buildTrainerQueue, buildWordOrder, loadTrainerPreferences } from "./trainerData";
import { deriveTrainerViewState } from "./trainerView";
import { useTrainerPronunciation } from "./useTrainerPronunciation";
import { useTrainerSession } from "./useTrainerSession";

export function useTrainer() {
  const [wordOrder, setWordOrder] = useState<WordOrder>([]);
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
  const resolvedBuiltinWords = buildResolvedBuiltinWords(builtinWordOverrides);
  const activeCustomWords = customWords.filter((word) => wordOrder.includes(word.id));
  const inactiveCustomWords = customWords.filter((word) => !wordOrder.includes(word.id));
  const activeWords = buildAvailableWords([...resolvedBuiltinWords, ...activeCustomWords], wordOrder);
  const sanitizedWordOrder = buildWordOrder(activeWords, wordOrder);
  const builtinWords = activeWords.filter((word) => word.source === "builtin");
  const hiddenBuiltinWords = buildResolvedHiddenBuiltinWords(builtinWordOverrides, wordOrder);
  const managedWords = dedupeWords([...resolvedBuiltinWords, ...customWords]);
  const editedBuiltinWordIds = Object.entries(builtinWordOverrides)
    .filter(([, override]) => override.status === "edited")
    .map(([wordId]) => wordId);
  const pronunciation = useTrainerPronunciation({
    screen: sessionControls.screen,
    countdown: sessionControls.countdown,
    session: sessionControls.session,
    config,
    availableWords: activeWords
  });

  useEffect(() => {
    const {
      wordOrder: loadedWordOrder,
      builtinWordOverrides: loadedBuiltinWordOverrides,
      customWords: loadedCustomWords,
      config: loadedConfig,
      displayLanguage: loadedDisplayLanguage
    } = loadTrainerPreferences();
    setWordOrder(loadedWordOrder);
    setBuiltinWordOverrides(loadedBuiltinWordOverrides);
    setCustomWords(loadedCustomWords);
    setConfig(loadedConfig);
    setDraftConfig(loadedConfig);
    setDisplayLanguage(loadedDisplayLanguage);
    pronunciation.resetAutoPronunciation();
    sessionControls.initializeSession(
      buildTrainerQueue(
        buildAvailableWords(
          [
            ...buildResolvedBuiltinWords(loadedBuiltinWordOverrides),
            ...loadedCustomWords.filter((word) => loadedWordOrder.includes(word.id))
          ],
          loadedWordOrder
        ),
        loadedConfig
      )
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
    sessionControls.restartSession(activeWords, nextConfig);
  }

  function syncSession(
    nextBuiltinWordOverrides = builtinWordOverrides,
    nextCustomWords = customWords,
    nextWordOrder = sanitizedWordOrder
  ) {
    pronunciation.resetAutoPronunciation();
    sessionControls.initializeSession(
      buildTrainerQueue(
        buildAvailableWords(
          [
            ...buildResolvedBuiltinWords(nextBuiltinWordOverrides),
            ...nextCustomWords.filter((word) => nextWordOrder.includes(word.id))
          ],
          nextWordOrder
        ),
        config
      )
    );
  }

  function handleAddWord() {
    const entry = createWordEntry(inputValue, "custom");
    if (!entry) {
      setAddWordError("words.error.invalid");
      return;
    }

    if (managedWords.some((word) => word.normalizedText === entry.normalizedText)) {
      setAddWordError("words.error.duplicate");
      return;
    }

    const nextWords = [...customWords, entry];
    const nextWordOrder = [...sanitizedWordOrder.filter((wordId) => wordId !== entry.id), entry.id];
    setCustomWords(nextWords);
    setWordOrder(nextWordOrder);
    saveCustomWords(nextWords);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, nextWords, nextWordOrder);
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
    const nextWordOrder = sanitizedWordOrder.filter((currentWordId) => currentWordId !== wordId);
    setCustomWords(nextWords);
    setWordOrder(nextWordOrder);
    saveCustomWords(nextWords);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, nextWords, nextWordOrder);

    if (editingWordId === wordId) {
      setEditingWordSource(null);
      setEditingWordId(null);
      setEditingWordValue("");
      setAddWordError("");
    }
  }

  function removeCustomWordFromPractice(wordId: string) {
    if (!customWords.some((word) => word.id === wordId)) {
      return;
    }

    const nextWordOrder = sanitizedWordOrder.filter((currentWordId) => currentWordId !== wordId);
    setWordOrder(nextWordOrder);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, customWords, nextWordOrder);

    if (editingWordId === wordId && editingWordSource === "custom") {
      cancelEditingWord();
    }
  }

  function removeCustomWordsFromPractice(wordIds: string[]) {
    const removableWordIds = new Set(wordIds.filter((wordId) => customWords.some((word) => word.id === wordId)));
    if (removableWordIds.size === 0) {
      return;
    }

    const nextWordOrder = sanitizedWordOrder.filter((currentWordId) => !removableWordIds.has(currentWordId));
    setWordOrder(nextWordOrder);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, customWords, nextWordOrder);

    if (editingWordId && editingWordSource === "custom" && removableWordIds.has(editingWordId)) {
      cancelEditingWord();
    }
  }

  function addCustomWordToPractice(wordId: string) {
    if (!inactiveCustomWords.some((word) => word.id === wordId)) {
      return;
    }

    const nextWordOrder = [...sanitizedWordOrder.filter((currentWordId) => currentWordId !== wordId), wordId];
    setWordOrder(nextWordOrder);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, customWords, nextWordOrder);
  }

  function addCustomWordsToPractice(wordIds: string[]) {
    const restorableWordIds = wordIds.filter((wordId) => inactiveCustomWords.some((word) => word.id === wordId));
    if (restorableWordIds.length === 0) {
      return;
    }

    const nextWordOrder = [
      ...sanitizedWordOrder.filter((currentWordId) => !restorableWordIds.includes(currentWordId)),
      ...restorableWordIds
    ];
    setWordOrder(nextWordOrder);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, customWords, nextWordOrder);
  }

  function moveWord(wordId: string, direction: "up" | "down") {
    const currentIndex = activeWords.findIndex((word) => word.id === wordId);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeWords.length) {
      return;
    }

    const nextWordOrder = [...sanitizedWordOrder];
    [nextWordOrder[currentIndex], nextWordOrder[targetIndex]] = [nextWordOrder[targetIndex], nextWordOrder[currentIndex]];
    setWordOrder(nextWordOrder);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, customWords, nextWordOrder);
  }

  function moveWordToIndex(wordId: string, targetIndex: number) {
    const currentIndex = activeWords.findIndex((word) => word.id === wordId);
    if (currentIndex === -1) {
      return;
    }

    const boundedTargetIndex = Math.max(0, Math.min(targetIndex, activeWords.length - 1));
    if (currentIndex === boundedTargetIndex) {
      return;
    }

    const nextWordOrder = [...sanitizedWordOrder];
    const [movedWordId] = nextWordOrder.splice(currentIndex, 1);
    nextWordOrder.splice(boundedTargetIndex, 0, movedWordId);
    setWordOrder(nextWordOrder);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, customWords, nextWordOrder);
  }

  function moveWordToEdge(wordId: string, edge: "top" | "bottom") {
    const currentIndex = activeWords.findIndex((word) => word.id === wordId);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = edge === "top" ? 0 : activeWords.length - 1;
    if (currentIndex === targetIndex) {
      return;
    }

    const nextWordOrder = [...sanitizedWordOrder];
    const [movedWordId] = nextWordOrder.splice(currentIndex, 1);
    nextWordOrder.splice(targetIndex, 0, movedWordId);
    setWordOrder(nextWordOrder);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, customWords, nextWordOrder);
  }

  function sortCustomWords(mode: "alphabetical" | "newest" | "oldest") {
    const nextWords = [...customWords].sort((left, right) => {
      if (mode === "alphabetical") {
        return left.normalizedText.localeCompare(right.normalizedText);
      }

      const leftCreatedAt = new Date(left.createdAt).getTime();
      const rightCreatedAt = new Date(right.createdAt).getTime();

      return mode === "newest" ? rightCreatedAt - leftCreatedAt : leftCreatedAt - rightCreatedAt;
    });
    const nextActiveCustomIds = nextWords.filter((word) => sanitizedWordOrder.includes(word.id)).map((word) => word.id);
    const nextActiveCustomIdSet = new Set(nextActiveCustomIds);
    let activeCustomCursor = 0;
    const nextWordOrder = sanitizedWordOrder.map((wordId) => {
      if (!nextActiveCustomIdSet.has(wordId)) {
        return wordId;
      }

      const nextWordId = nextActiveCustomIds[activeCustomCursor];
      activeCustomCursor += 1;
      return nextWordId;
    });

    setCustomWords(nextWords);
    setWordOrder(nextWordOrder);
    saveCustomWords(nextWords);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, nextWords, nextWordOrder);
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

    if (managedWords.some((word) => word.id !== editingWordId && word.normalizedText === entry.normalizedText)) {
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
      syncSession(nextBuiltinWordOverrides, customWords, sanitizedWordOrder);
      cancelEditingWord();
      return;
    }

    const nextEditingWord = {
      ...existingWord,
      id: entry.id,
      text: entry.text,
      normalizedText: entry.normalizedText
    };
    const nextWords = customWords.map((word) =>
      word.id === editingWordId
        ? nextEditingWord
        : word
    );
    const nextWordOrder = sanitizedWordOrder.map((wordId) => (wordId === editingWordId ? entry.id : wordId));

    setCustomWords(nextWords);
    setWordOrder(nextWordOrder);
    saveCustomWords(nextWords);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, nextWords, nextWordOrder);
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
    syncSession(nextBuiltinWordOverrides, customWords, sanitizedWordOrder);

    if (editingWordId === wordId) {
      cancelEditingWord();
    }
  }

  function handleRemoveBuiltinWords(wordIds: string[]) {
    const removableWordIds = wordIds.filter((wordId) => builtinWords.some((word) => word.id === wordId));
    if (removableWordIds.length === 0) {
      return;
    }

    const nextBuiltinWordOverrides: BuiltinWordOverrides = { ...builtinWordOverrides };
    for (const wordId of removableWordIds) {
      nextBuiltinWordOverrides[wordId] = {
        status: "deleted",
        updatedAt: new Date().toISOString()
      };
    }

    setBuiltinWordOverrides(nextBuiltinWordOverrides);
    saveBuiltinWordOverrides(nextBuiltinWordOverrides);
    syncSession(nextBuiltinWordOverrides, customWords, sanitizedWordOrder);

    if (editingWordId && removableWordIds.includes(editingWordId)) {
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
    syncSession(nextBuiltinWordOverrides, customWords, sanitizedWordOrder);

    if (editingWordId === wordId) {
      cancelEditingWord();
    }
  }

  function restoreBuiltinWords(wordIds: string[]) {
    const nextBuiltinWordOverrides = { ...builtinWordOverrides };
    let didChange = false;

    for (const wordId of wordIds) {
      if (wordId in nextBuiltinWordOverrides) {
        delete nextBuiltinWordOverrides[wordId];
        didChange = true;
      }
    }

    if (!didChange) {
      return;
    }

    setBuiltinWordOverrides(nextBuiltinWordOverrides);
    saveBuiltinWordOverrides(nextBuiltinWordOverrides);
    syncSession(nextBuiltinWordOverrides, customWords, sanitizedWordOrder);

    if (editingWordId && wordIds.includes(editingWordId)) {
      cancelEditingWord();
    }
  }

  function handleRemoveWordsFromPractice(wordIds: string[]) {
    const builtinWordIds = wordIds.filter((wordId) => activeWords.some((word) => word.id === wordId && word.source === "builtin"));
    const customWordIds = wordIds.filter((wordId) => activeWords.some((word) => word.id === wordId && word.source === "custom"));

    if (builtinWordIds.length > 0) {
      handleRemoveBuiltinWords(builtinWordIds);
    }

    if (customWordIds.length > 0) {
      removeCustomWordsFromPractice(customWordIds);
    }
  }

  function handleRemoveWords(wordIds: string[]) {
    const removableWordIds = new Set(wordIds.filter((wordId) => customWords.some((word) => word.id === wordId)));
    if (removableWordIds.size === 0) {
      return;
    }

    const nextWords = customWords.filter((word) => !removableWordIds.has(word.id));
    const nextWordOrder = sanitizedWordOrder.filter((currentWordId) => !removableWordIds.has(currentWordId));
    setCustomWords(nextWords);
    setWordOrder(nextWordOrder);
    saveCustomWords(nextWords);
    saveBuiltinWordOrder(nextWordOrder);
    syncSession(builtinWordOverrides, nextWords, nextWordOrder);

    if (editingWordId && removableWordIds.has(editingWordId)) {
      cancelEditingWord();
    }
  }

  function resetBuiltinWords() {
    const nextBuiltinWords = buildResolvedBuiltinWords({});
    const orderedCustomWordIds = activeWords.filter((word) => word.source === "custom").map((word) => word.id);
    const nextWordOrder = [...nextBuiltinWords.map((word) => word.id), ...orderedCustomWordIds];
    setWordOrder(nextWordOrder);
    setBuiltinWordOverrides({});
    clearBuiltinWordOrder();
    clearBuiltinWordOverrides();
    saveBuiltinWordOrder(nextWordOrder);
    syncSession({}, customWords, nextWordOrder);

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
    activeWords,
    hiddenBuiltinWords,
    editedBuiltinWordIds,
    customWords,
    inactiveCustomWords,
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
    handleRemoveWords,
    removeCustomWordFromPractice,
    removeCustomWordsFromPractice,
    addCustomWordToPractice,
    addCustomWordsToPractice,
    moveWord,
    moveWordToIndex,
    moveWordToEdge,
    sortCustomWords,
    handleRemoveBuiltinWord,
    handleRemoveBuiltinWords,
    restoreBuiltinWord,
    restoreBuiltinWords,
    handleRemoveWordsFromPractice,
    resetBuiltinWords,
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
