import { useId, useRef } from "react";
import { t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";
import { ActiveWordsSection } from "./words/sections/ActiveWordsSection";
import { BuiltinWordsSection } from "./words/sections/BuiltinWordsSection";
import { CustomWordsSection } from "./words/sections/CustomWordsSection";
import { AddWordSection } from "./words/layout/AddWordSection";
import { useWordsPanelController } from "./words/hooks/useWordsPanelController";
import { WordsHero } from "./words/layout/WordsHero";
import { WordsSearchToolbar } from "./words/layout/WordsSearchToolbar";

interface WordsPanelProps {
  trainer: TrainerState;
}

export function WordsPanel({ trainer }: WordsPanelProps) {
  const language = trainer.displayLanguage;
  const lastActiveWordIndex = trainer.activeWords.length - 1;
  const editedBuiltinWordIds = new Set(trainer.editedBuiltinWordIds);
  const searchInputId = useId();
  const newWordInputRef = useRef<HTMLInputElement | null>(null);
  const activeSectionRef = useRef<HTMLElement | null>(null);
  const builtinSectionRef = useRef<HTMLElement | null>(null);
  const hiddenBuiltinSectionRef = useRef<HTMLElement | null>(null);
  const customSectionRef = useRef<HTMLElement | null>(null);
  const hiddenCustomSectionRef = useRef<HTMLElement | null>(null);
  const {
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
    createSectionSelection,
    createBulkFocusRefs,
    dragControls
  } = useWordsPanelController(trainer);

  function focusNewWordInput() {
    newWordInputRef.current?.focus();
  }

  function scrollToSection(section: HTMLElement | null) {
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const activeSelection = createSectionSelection("active");
  const builtinSelection = createSectionSelection("builtin");
  const hiddenBuiltinSelection = createSectionSelection("hiddenBuiltin");
  const customSelection = createSectionSelection("custom");
  const hiddenCustomSelection = createSectionSelection("hiddenCustom");
  const searchResultSummaries = [
    { id: "active", label: t(language, "words.activeTitle"), count: filteredActiveWords.length, onClick: () => scrollToSection(activeSectionRef.current) },
    { id: "builtin", label: t(language, "words.builtinTitle"), count: filteredBuiltinWords.length, onClick: () => scrollToSection(builtinSectionRef.current) },
    {
      id: "hidden-builtin",
      label: t(language, "words.hiddenBuiltinTitle"),
      count: filteredHiddenBuiltinWords.length,
      onClick: () => scrollToSection(hiddenBuiltinSectionRef.current)
    },
    { id: "custom", label: t(language, "words.customTitle"), count: filteredCustomWords.length, onClick: () => scrollToSection(customSectionRef.current) },
    {
      id: "hidden-custom",
      label: t(language, "words.inactiveCustomTitle"),
      count: filteredInactiveCustomWords.length,
      onClick: () => scrollToSection(hiddenCustomSectionRef.current)
    }
  ].filter((summary) => summary.count > 0);

  return (
    <div className="words-page">
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "words.title")}</p>
          <h2>{t(language, "words.subtitle")}</h2>
        </div>
      </div>

      <div className="words-workspace">
        <div className="words-primary-column">
          <AddWordSection trainer={trainer} inputRef={newWordInputRef} />

          <WordsSearchToolbar
            language={language}
            searchInputId={searchInputId}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            resultSummaries={searchResultSummaries}
          />
        </div>

        <WordsHero trainer={trainer} onJumpToActive={() => scrollToSection(activeSectionRef.current)} />
      </div>

      <ActiveWordsSection
        trainer={trainer}
        searchValue={searchValue}
        filteredActiveWords={filteredActiveWords}
        selection={activeSelection}
        bulkFocusRefs={createBulkFocusRefs("active")}
        dragControls={{
          lastActiveWordIndex,
          ...dragControls
        }}
        selectedCountLabel={selectedCountLabel(activeSelection.selectedWordIds.length)}
        sectionRef={activeSectionRef}
      />

      <BuiltinWordsSection
        trainer={trainer}
        searchValue={searchValue}
        filteredBuiltinWords={filteredBuiltinWords}
        filteredHiddenBuiltinWords={filteredHiddenBuiltinWords}
        editedBuiltinWordIds={editedBuiltinWordIds}
        wordsPanelState={wordsPanelState}
        sectionRef={builtinSectionRef}
        hiddenSectionRef={hiddenBuiltinSectionRef}
        selection={{
          active: builtinSelection,
          hidden: hiddenBuiltinSelection
        }}
        bulkFocusRefs={{
          active: createBulkFocusRefs("builtin"),
          hidden: createBulkFocusRefs("hiddenBuiltin")
        }}
        onToggleSection={() => updateWordsPanelState({ builtinMinimized: !wordsPanelState.builtinMinimized })}
        onToggleHiddenSection={() => updateWordsPanelState({ hiddenBuiltinMinimized: !wordsPanelState.hiddenBuiltinMinimized })}
        selectedCountLabel={selectedCountLabel}
        onScrollToSelf={() => scrollToSection(builtinSectionRef.current)}
      />

      <CustomWordsSection
        trainer={trainer}
        searchValue={searchValue}
        filteredCustomWords={filteredCustomWords}
        filteredInactiveCustomWords={filteredInactiveCustomWords}
        wordsPanelState={wordsPanelState}
        sectionRef={customSectionRef}
        hiddenSectionRef={hiddenCustomSectionRef}
        selection={{
          active: customSelection,
          hidden: hiddenCustomSelection
        }}
        bulkFocusRefs={{
          active: createBulkFocusRefs("custom"),
          hidden: createBulkFocusRefs("hiddenCustom")
        }}
        onToggleSection={() => updateWordsPanelState({ customMinimized: !wordsPanelState.customMinimized })}
        onToggleHiddenSection={() => updateWordsPanelState({ inactiveCustomMinimized: !wordsPanelState.inactiveCustomMinimized })}
        selectedCountLabel={selectedCountLabel}
        onFocusNewWordInput={focusNewWordInput}
        onScrollToSelf={() => scrollToSection(customSectionRef.current)}
      />

      {normalizedSearchValue && !hasSearchResults ? (
        <div className="empty-state word-search-empty">
          <strong>{t(language, "words.noMatches")}</strong>
          <p>{t(language, "words.searchEmptyAction")}</p>
          <button type="button" className="secondary inline-action" data-testid="clear-word-search-button" onClick={() => setSearchValue("")}>
            {t(language, "words.clearSearch")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
