import { useEffect, useState } from "react";
import type { BuiltinWordOverrides, DisplayLanguage, SessionConfig, WordEntry, WordOrder } from "../../domain/types";
import { createWordEntry, dedupeWords, normalizeWord } from "../../domain/words";
import { clearBrowserTtsCache } from "../../infra/browserTts";
import {
  defaultDisplayLanguage,
  defaultSessionConfig,
  saveBuiltinWordOrder,
  sanitizeWordCount,
  saveBuiltinWordOverrides,
  saveDisplayLanguage,
  saveCustomWords,
  saveSessionConfig
} from "../../infra/storage";
import {
  buildActiveCustomWords,
  buildActiveWordsFromPreferences,
  buildAvailableWords,
  buildResolvedBuiltinWords,
  buildResolvedHiddenBuiltinWords,
  buildTrainerQueue,
  buildWordOrder,
  loadTrainerPreferences
} from "./trainerData";
import { deriveTrainerViewState } from "./trainerView";
import { useTrainerPronunciation } from "./useTrainerPronunciation";
import { useTrainerSession } from "./useTrainerSession";

interface WordMutationSnapshot {
  builtinWordOverrides: BuiltinWordOverrides;
  customWords: WordEntry[];
  wordOrder: WordOrder;
}

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
  const [reorderFeedbackToken, setReorderFeedbackToken] = useState(0);
  const [browserTtsCacheMessage, setBrowserTtsCacheMessage] = useState<"" | "cleared" | "failed">("");
  const [isClearingBrowserTtsCache, setIsClearingBrowserTtsCache] = useState(false);
  const sessionControls = useTrainerSession();
  const resolvedBuiltinWords = buildResolvedBuiltinWords(builtinWordOverrides);
  const activeCustomWords = buildActiveCustomWords(customWords, wordOrder);
  const inactiveCustomWords = customWords.filter((word) => !wordOrder.includes(word.id));
  const activeWords = buildAvailableWords([...resolvedBuiltinWords, ...activeCustomWords], wordOrder);
  const sanitizedWordOrder = buildWordOrder(activeWords, wordOrder);
  const builtinWords = activeWords.filter((word) => word.source === "builtin");
  const hiddenBuiltinWords = buildResolvedHiddenBuiltinWords(builtinWordOverrides, wordOrder);
  const managedWords = dedupeWords([...resolvedBuiltinWords, ...customWords]);
  const normalizedInputValue = normalizeWord(inputValue);
  const trimmedInputValue = inputValue.trim();
  const duplicateInputMatch = normalizedInputValue ? managedWords.find((word) => word.normalizedText === normalizedInputValue) ?? null : null;
  const addWordPreview = trimmedInputValue
    ? {
        normalizedValue: normalizedInputValue,
        willNormalize: normalizedInputValue.length > 0 && normalizedInputValue !== trimmedInputValue.toLowerCase(),
        isInvalid: normalizedInputValue.length === 0,
        duplicateMatch: duplicateInputMatch
      }
    : null;
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
      buildTrainerQueue(buildActiveWordsFromPreferences(loadedBuiltinWordOverrides, loadedCustomWords, loadedWordOrder), loadedConfig)
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

  function retryFocusedWords() {
    const completedWords = sessionControls.session.completedWords;
    const prioritizedResults = [...completedWords].sort((left, right) => right.mistakes - left.mistakes || right.elapsedMs - left.elapsedMs);
    const mistakeResults = prioritizedResults.filter((result) => result.mistakes > 0);
    const fallbackResults = [...completedWords].sort((left, right) => right.elapsedMs - left.elapsedMs).slice(0, 3);
    const sourceResults = mistakeResults.length > 0 ? mistakeResults : fallbackResults;
    const selectedWordIds = Array.from(new Set(sourceResults.map((result) => result.wordId)));
    const focusedWords = selectedWordIds
      .map((wordId) => activeWords.find((word) => word.id === wordId) ?? null)
      .filter((word): word is (typeof activeWords)[number] => word !== null);

    if (focusedWords.length === 0) {
      restartSession();
      return;
    }

    pronunciation.resetAutoPronunciation();
    sessionControls.restartSession(focusedWords, {
      ...config,
      shuffle: false,
      wordCount: focusedWords.length
    });
  }

  function syncSession(
    nextBuiltinWordOverrides = builtinWordOverrides,
    nextCustomWords = customWords,
    nextWordOrder = sanitizedWordOrder
  ) {
    pronunciation.resetAutoPronunciation();
    sessionControls.initializeSession(buildTrainerQueue(buildActiveWordsFromPreferences(nextBuiltinWordOverrides, nextCustomWords, nextWordOrder), config));
  }

  function commitWordMutation(
    buildNextSnapshot: (current: WordMutationSnapshot) => WordMutationSnapshot | null,
    options: {
      cancelEditing?: boolean;
      afterCommit?: () => void;
    } = {}
  ) {
    const currentSnapshot: WordMutationSnapshot = {
      builtinWordOverrides,
      customWords,
      wordOrder: sanitizedWordOrder
    };
    const nextSnapshot = buildNextSnapshot(currentSnapshot);

    if (!nextSnapshot) {
      return false;
    }

    if (nextSnapshot.builtinWordOverrides !== currentSnapshot.builtinWordOverrides) {
      setBuiltinWordOverrides(nextSnapshot.builtinWordOverrides);
      saveBuiltinWordOverrides(nextSnapshot.builtinWordOverrides);
    }

    if (nextSnapshot.customWords !== currentSnapshot.customWords) {
      setCustomWords(nextSnapshot.customWords);
      saveCustomWords(nextSnapshot.customWords);
    }

    if (nextSnapshot.wordOrder !== currentSnapshot.wordOrder) {
      setWordOrder(nextSnapshot.wordOrder);
      saveBuiltinWordOrder(nextSnapshot.wordOrder);
    }

    syncSession(nextSnapshot.builtinWordOverrides, nextSnapshot.customWords, nextSnapshot.wordOrder);

    if (options.cancelEditing) {
      cancelEditingWord();
    }

    options.afterCommit?.();
    return true;
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

    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        customWords: [...currentSnapshot.customWords, entry],
        wordOrder: [...currentSnapshot.wordOrder.filter((wordId) => wordId !== entry.id), entry.id]
      }),
      {
        afterCommit: () => {
          setInputValue("");
          setAddWordError("");
        }
      }
    );
  }

  function handleAddWordInputChange(value: string) {
    setInputValue(value);
    if (addWordError) {
      setAddWordError("");
    }
  }

  function handleRemoveWord(wordId: string) {
    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        customWords: currentSnapshot.customWords.filter((word) => word.id !== wordId),
        wordOrder: currentSnapshot.wordOrder.filter((currentWordId) => currentWordId !== wordId)
      }),
      {
        cancelEditing: editingWordId === wordId,
        afterCommit: editingWordId === wordId ? undefined : () => setAddWordError("")
      }
    );
  }

  function removeCustomWordFromPractice(wordId: string) {
    if (!customWords.some((word) => word.id === wordId)) {
      return;
    }

    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        wordOrder: currentSnapshot.wordOrder.filter((currentWordId) => currentWordId !== wordId)
      }),
      {
        cancelEditing: editingWordId === wordId && editingWordSource === "custom"
      }
    );
  }

  function removeCustomWordsFromPractice(wordIds: string[]) {
    const removableWordIds = new Set(wordIds.filter((wordId) => customWords.some((word) => word.id === wordId)));
    if (removableWordIds.size === 0) {
      return;
    }

    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        wordOrder: currentSnapshot.wordOrder.filter((currentWordId) => !removableWordIds.has(currentWordId))
      }),
      {
        cancelEditing: Boolean(editingWordId && editingWordSource === "custom" && removableWordIds.has(editingWordId))
      }
    );
  }

  function addCustomWordToPractice(wordId: string) {
    if (!inactiveCustomWords.some((word) => word.id === wordId)) {
      return;
    }

    commitWordMutation((currentSnapshot) => ({
      ...currentSnapshot,
      wordOrder: [...currentSnapshot.wordOrder.filter((currentWordId) => currentWordId !== wordId), wordId]
    }));
  }

  function addCustomWordsToPractice(wordIds: string[]) {
    const restorableWordIds = wordIds.filter((wordId) => inactiveCustomWords.some((word) => word.id === wordId));
    if (restorableWordIds.length === 0) {
      return;
    }

    commitWordMutation((currentSnapshot) => ({
      ...currentSnapshot,
      wordOrder: [...currentSnapshot.wordOrder.filter((currentWordId) => !restorableWordIds.includes(currentWordId)), ...restorableWordIds]
    }));
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
    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        wordOrder: nextWordOrder
      }),
      {
        afterCommit: () => setReorderFeedbackToken((current) => current + 1)
      }
    );
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
    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        wordOrder: nextWordOrder
      }),
      {
        afterCommit: () => setReorderFeedbackToken((current) => current + 1)
      }
    );
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
    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        wordOrder: nextWordOrder
      }),
      {
        afterCommit: () => setReorderFeedbackToken((current) => current + 1)
      }
    );
  }

  function clearReorderFeedback() {
    setReorderFeedbackToken(0);
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

    commitWordMutation((currentSnapshot) => ({
      ...currentSnapshot,
      customWords: nextWords,
      wordOrder: nextWordOrder
    }));
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

      commitWordMutation(
        (currentSnapshot) => ({
          ...currentSnapshot,
          builtinWordOverrides: nextBuiltinWordOverrides
        }),
        {
          cancelEditing: true
        }
      );
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

    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        customWords: nextWords,
        wordOrder: nextWordOrder
      }),
      {
        cancelEditing: true
      }
    );
  }

  function handleRemoveBuiltinWord(wordId: string) {
    const nextBuiltinWordOverrides: BuiltinWordOverrides = {
      ...builtinWordOverrides,
      [wordId]: {
        status: "deleted",
        updatedAt: new Date().toISOString()
      }
    };

    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        builtinWordOverrides: nextBuiltinWordOverrides
      }),
      {
        cancelEditing: editingWordId === wordId
      }
    );
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

    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        builtinWordOverrides: nextBuiltinWordOverrides
      }),
      {
        cancelEditing: Boolean(editingWordId && removableWordIds.includes(editingWordId))
      }
    );
  }

  function restoreBuiltinWord(wordId: string) {
    if (!(wordId in builtinWordOverrides)) {
      return;
    }

    const nextBuiltinWordOverrides = { ...builtinWordOverrides };
    delete nextBuiltinWordOverrides[wordId];
    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        builtinWordOverrides: nextBuiltinWordOverrides
      }),
      {
        cancelEditing: editingWordId === wordId
      }
    );
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

    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        builtinWordOverrides: nextBuiltinWordOverrides
      }),
      {
        cancelEditing: Boolean(editingWordId && wordIds.includes(editingWordId))
      }
    );
  }

  function handleRemoveWordsFromPractice(wordIds: string[]) {
    const builtinWordIds = wordIds.filter((wordId) => activeWords.some((word) => word.id === wordId && word.source === "builtin"));
    const removableCustomWordIds = new Set(wordIds.filter((wordId) => activeWords.some((word) => word.id === wordId && word.source === "custom")));
    if (builtinWordIds.length === 0 && removableCustomWordIds.size === 0) {
      return;
    }

    const nextBuiltinWordOverrides =
      builtinWordIds.length === 0
        ? builtinWordOverrides
        : builtinWordIds.reduce<BuiltinWordOverrides>(
            (overrides, wordId) => ({
              ...overrides,
              [wordId]: {
                status: "deleted",
                updatedAt: new Date().toISOString()
              }
            }),
            { ...builtinWordOverrides }
          );
    const nextWordOrder =
      removableCustomWordIds.size === 0
        ? sanitizedWordOrder
        : sanitizedWordOrder.filter((currentWordId) => !removableCustomWordIds.has(currentWordId));

    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        builtinWordOverrides: nextBuiltinWordOverrides,
        wordOrder: nextWordOrder
      }),
      {
        cancelEditing: Boolean(editingWordId && (builtinWordIds.includes(editingWordId) || removableCustomWordIds.has(editingWordId)))
      }
    );
  }

  function handleRemoveWords(wordIds: string[]) {
    const removableWordIds = new Set(wordIds.filter((wordId) => customWords.some((word) => word.id === wordId)));
    if (removableWordIds.size === 0) {
      return;
    }

    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        customWords: currentSnapshot.customWords.filter((word) => !removableWordIds.has(word.id)),
        wordOrder: currentSnapshot.wordOrder.filter((currentWordId) => !removableWordIds.has(currentWordId))
      }),
      {
        cancelEditing: Boolean(editingWordId && removableWordIds.has(editingWordId))
      }
    );
  }

  function resetBuiltinWords() {
    const nextBuiltinWords = buildResolvedBuiltinWords({});
    const orderedCustomWordIds = activeWords.filter((word) => word.source === "custom").map((word) => word.id);
    const nextWordOrder = [...nextBuiltinWords.map((word) => word.id), ...orderedCustomWordIds];
    commitWordMutation(
      (currentSnapshot) => ({
        ...currentSnapshot,
        builtinWordOverrides: {},
        wordOrder: nextWordOrder
      }),
      {
        cancelEditing: editingWordSource === "builtin"
      }
    );
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
    addWordPreview,
    reorderFeedbackToken,
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
    clearReorderFeedback,
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
    retryFocusedWords,
    skipCountdown() {
      sessionControls.skipCountdown();
    },
    speakCurrentWord() {
      pronunciation.speakCurrentWord();
    }
  };
}

export type TrainerState = ReturnType<typeof useTrainer>;
