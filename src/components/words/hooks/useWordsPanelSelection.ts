import { useEffect, useRef, useState } from "react";
import type { BulkActionFocusRefs, SectionSelectionControls, WordSectionKey } from "../shared";

interface SelectionSource {
  activeWordIds: string[];
  builtinWordIds: string[];
  hiddenBuiltinWordIds: string[];
  customWordIds: string[];
  hiddenCustomWordIds: string[];
}

export function useWordsPanelSelection({
  activeWordIds,
  builtinWordIds,
  hiddenBuiltinWordIds,
  customWordIds,
  hiddenCustomWordIds
}: SelectionSource) {
  const [selectedWordIdsBySection, setSelectedWordIdsBySection] = useState<Record<WordSectionKey, string[]>>({
    active: [],
    builtin: [],
    hiddenBuiltin: [],
    custom: [],
    hiddenCustom: []
  });
  const bulkSelectVisibleButtonRefs = useRef<Record<WordSectionKey, HTMLButtonElement | null>>({
    active: null,
    builtin: null,
    hiddenBuiltin: null,
    custom: null,
    hiddenCustom: null
  });
  const bulkActionBarRefs = useRef<Record<WordSectionKey, HTMLDivElement | null>>({
    active: null,
    builtin: null,
    hiddenBuiltin: null,
    custom: null,
    hiddenCustom: null
  });

  const selectableWordIdsBySection = {
    active: activeWordIds,
    builtin: builtinWordIds,
    hiddenBuiltin: hiddenBuiltinWordIds,
    custom: customWordIds,
    hiddenCustom: hiddenCustomWordIds
  } satisfies Record<WordSectionKey, string[]>;

  useEffect(() => {
    setSelectedWordIdsBySection((current) => ({
      active: current.active.filter((wordId) => activeWordIds.includes(wordId)),
      builtin: current.builtin.filter((wordId) => builtinWordIds.includes(wordId)),
      hiddenBuiltin: current.hiddenBuiltin.filter((wordId) => hiddenBuiltinWordIds.includes(wordId)),
      custom: current.custom.filter((wordId) => customWordIds.includes(wordId)),
      hiddenCustom: current.hiddenCustom.filter((wordId) => hiddenCustomWordIds.includes(wordId))
    }));
  }, [activeWordIds, builtinWordIds, hiddenBuiltinWordIds, customWordIds, hiddenCustomWordIds]);

  function toggleSelectedWord(section: WordSectionKey, wordId: string) {
    setSelectedWordIdsBySection((current) => ({
      ...current,
      [section]: current[section].includes(wordId) ? current[section].filter((currentWordId) => currentWordId !== wordId) : [...current[section], wordId]
    }));
  }

  function selectVisibleWords(section: WordSectionKey, wordIds: string[]) {
    setSelectedWordIdsBySection((current) => ({
      ...current,
      [section]: wordIds
    }));
  }

  function toggleVisibleSelection(section: WordSectionKey) {
    const wordIds = selectableWordIdsBySection[section];
    const currentSelectedWordIds = selectedWordIdsBySection[section];
    const allVisibleSelected = wordIds.length > 0 && wordIds.every((wordId) => currentSelectedWordIds.includes(wordId));

    if (allVisibleSelected) {
      setSelectedWordIdsBySection((current) => ({
        ...current,
        [section]: current[section].filter((wordId) => !wordIds.includes(wordId))
      }));
      return;
    }

    selectVisibleWords(section, Array.from(new Set([...currentSelectedWordIds, ...wordIds])));
  }

  function clearSelectedWords(section: WordSectionKey) {
    setSelectedWordIdsBySection((current) => ({
      ...current,
      [section]: []
    }));
  }

  function focusBulkSection(section: WordSectionKey) {
    window.setTimeout(() => {
      const selectVisibleButton = bulkSelectVisibleButtonRefs.current[section];
      if (selectVisibleButton && !selectVisibleButton.disabled) {
        selectVisibleButton.focus();
        return;
      }

      bulkActionBarRefs.current[section]?.focus();
    }, 0);
  }

  function runBulkAction(section: WordSectionKey, action: () => void) {
    action();
    clearSelectedWords(section);
    focusBulkSection(section);
  }

  function createSectionSelection(section: WordSectionKey): SectionSelectionControls {
    return {
      selectedWordIds: selectedWordIdsBySection[section],
      selectableWordIds: selectableWordIdsBySection[section],
      toggleWord: (wordId) => toggleSelectedWord(section, wordId),
      toggleVisible: () => toggleVisibleSelection(section),
      clear: () => clearSelectedWords(section),
      runBulkAction: (action) => runBulkAction(section, action)
    };
  }

  function createBulkFocusRefs(section: WordSectionKey): BulkActionFocusRefs {
    return {
      selectVisibleRef: (node) => {
        bulkSelectVisibleButtonRefs.current[section] = node;
      },
      containerRef: (node) => {
        bulkActionBarRefs.current[section] = node;
      }
    };
  }

  return {
    selectableWordIdsBySection,
    createSectionSelection,
    createBulkFocusRefs
  };
}
