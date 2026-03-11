import { useMemo, useState } from "react";
import { formatMessage } from "../../../i18n";
import type { TrainerState } from "../../../features/trainer/useTrainer";
import { loadWordsPanelState, saveWordsPanelState } from "../../../infra/storage";
import { useWordsPanelDrag } from "./useWordsPanelDrag";
import { useWordsPanelSelection } from "./useWordsPanelSelection";

export function useWordsPanelController(trainer: TrainerState) {
  const language = trainer.displayLanguage;
  const [searchValue, setSearchValue] = useState("");
  const [wordsPanelState, setWordsPanelState] = useState(() => loadWordsPanelState());

  const normalizedSearchValue = searchValue.trim().toLowerCase();
  const inactiveCustomWordIds = useMemo(() => new Set(trainer.inactiveCustomWords.map((word) => word.id)), [trainer.inactiveCustomWords]);
  const filteredActiveWords = useMemo(
    () => trainer.activeWords.filter((word) => word.normalizedText.includes(normalizedSearchValue)),
    [trainer.activeWords, normalizedSearchValue]
  );
  const filteredBuiltinWords = useMemo(
    () => trainer.builtinWords.filter((word) => word.normalizedText.includes(normalizedSearchValue)),
    [trainer.builtinWords, normalizedSearchValue]
  );
  const filteredHiddenBuiltinWords = useMemo(
    () => trainer.hiddenBuiltinWords.filter((word) => word.normalizedText.includes(normalizedSearchValue)),
    [trainer.hiddenBuiltinWords, normalizedSearchValue]
  );
  const filteredCustomWords = useMemo(
    () => trainer.customWords.filter((word) => word.normalizedText.includes(normalizedSearchValue) && !inactiveCustomWordIds.has(word.id)),
    [trainer.customWords, inactiveCustomWordIds, normalizedSearchValue]
  );
  const filteredInactiveCustomWords = useMemo(
    () => trainer.inactiveCustomWords.filter((word) => word.normalizedText.includes(normalizedSearchValue)),
    [trainer.inactiveCustomWords, normalizedSearchValue]
  );
  const activeWordIds = useMemo(() => filteredActiveWords.map((word) => word.id), [filteredActiveWords]);
  const builtinWordIds = useMemo(() => filteredBuiltinWords.map((word) => word.id), [filteredBuiltinWords]);
  const hiddenBuiltinWordIds = useMemo(() => filteredHiddenBuiltinWords.map((word) => word.id), [filteredHiddenBuiltinWords]);
  const customWordIds = useMemo(() => filteredCustomWords.map((word) => word.id), [filteredCustomWords]);
  const hiddenCustomWordIds = useMemo(() => filteredInactiveCustomWords.map((word) => word.id), [filteredInactiveCustomWords]);
  const hasSearchResults =
    filteredActiveWords.length > 0 ||
    filteredBuiltinWords.length > 0 ||
    filteredHiddenBuiltinWords.length > 0 ||
    filteredCustomWords.length > 0 ||
    filteredInactiveCustomWords.length > 0;
  const selection = useWordsPanelSelection({
    activeWordIds,
    builtinWordIds,
    hiddenBuiltinWordIds,
    customWordIds,
    hiddenCustomWordIds
  });
  const dragControls = useWordsPanelDrag(trainer);

  function updateWordsPanelState(nextPartialState: Partial<typeof wordsPanelState>) {
    setWordsPanelState((current) => {
      const nextState = {
        ...current,
        ...nextPartialState
      };
      saveWordsPanelState(nextState);
      return nextState;
    });
  }

  function selectedCountLabel(count: number) {
    return formatMessage(language, "words.selectedCount", { count });
  }

  return {
    searchValue,
    setSearchValue,
    normalizedSearchValue,
    wordsPanelState,
    updateWordsPanelState,
    filteredActiveWords,
    filteredBuiltinWords,
    filteredHiddenBuiltinWords,
    filteredCustomWords,
    filteredInactiveCustomWords,
    hasSearchResults,
    selectedCountLabel,
    createSectionSelection: selection.createSectionSelection,
    createBulkFocusRefs: selection.createBulkFocusRefs,
    dragControls
  };
}
