import { useId, useRef } from "react";
import { t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";
import type { SessionConfig } from "../domain/types";
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

function formatPendingValue(language: TrainerState["displayLanguage"], value: SessionConfig["wordCount" | "shuffle"]) {
  return typeof value === "boolean" ? t(language, value ? "settings.valueOn" : "settings.valueOff") : String(value);
}

export function WordsPanel({ trainer }: WordsPanelProps) {
  const language = trainer.displayLanguage;
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
  const sessionPendingSummaryItems = ([
    { key: "wordCount" as const, label: t(language, "settings.wordsPerSession") },
    { key: "shuffle" as const, label: t(language, "settings.shuffle") }
  ]).filter(({ key }) => trainer.config[key] !== trainer.draftConfig[key]);

  return (
    <div className="words-page">
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "words.title")}</p>
          <h2>{t(language, "words.subtitle")}</h2>
        </div>
      </div>

      <div className="words-top-grid">
        <div className="words-primary-column">
          <AddWordSection trainer={trainer} inputRef={newWordInputRef} />

          <WordsSearchToolbar
            language={language}
            searchInputId={searchInputId}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            resultSummaries={searchResultSummaries}
          />

          <section className="settings-group words-session-config" data-testid="words-session-config">
            <div className="settings-group-header">
              <span className="label">{t(language, "words.sessionSetupTitle")}</span>
              <span className="settings-timing-pill">{t(language, "settings.appliesOnApply")}</span>
            </div>
            <div className="words-session-config-controls">
              <label className="words-session-config-field">
                <span>{t(language, "settings.wordsPerSession")}</span>
                <input
                  aria-label={t(language, "settings.wordsPerSession")}
                  data-testid="word-count-input"
                  type="number"
                  min={1}
                  max={20}
                  value={trainer.draftConfig.wordCount}
                  onChange={(event) => trainer.handleConfigChange("wordCount", Number(event.target.value))}
                />
              </label>
              <label className="toggle words-session-config-toggle">
                <input
                  data-testid="shuffle-toggle"
                  type="checkbox"
                  checked={trainer.draftConfig.shuffle}
                  onChange={(event) => trainer.handleConfigChange("shuffle", event.target.checked)}
                />
                <span>{t(language, "settings.shuffle")}</span>
              </label>
            </div>
            <div className="words-session-config-footer">
              <div className={`settings-status ${sessionPendingSummaryItems.length > 0 ? "pending" : ""}`} data-testid="words-session-config-status">
                {sessionPendingSummaryItems.length > 0 ? t(language, "settings.pending") : t(language, "words.sessionSetupSynced")}
                {sessionPendingSummaryItems.length > 0 ? (
                  <div className="settings-status-summary" data-testid="words-session-config-summary">
                    <strong>{t(language, "settings.pendingSummaryLabel")}</strong>
                    <ul>
                      {sessionPendingSummaryItems.map(({ key, label }) => (
                        <li key={key}>
                          {label}: {formatPendingValue(language, trainer.config[key])} {"->"} {formatPendingValue(language, trainer.draftConfig[key])}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              <button data-testid="apply-settings-button" onClick={trainer.applyConfigChanges} disabled={!trainer.hasPendingConfigChanges}>
                {t(language, "words.applySessionSettings")}
              </button>
            </div>
          </section>
        </div>

        <div className="words-secondary-column">
          <WordsHero trainer={trainer} onJumpToActive={() => scrollToSection(activeSectionRef.current)} />
        </div>
      </div>

      <ActiveWordsSection
        trainer={trainer}
        searchValue={searchValue}
        filteredActiveWords={filteredActiveWords}
        selection={activeSelection}
        bulkFocusRefs={createBulkFocusRefs("active")}
        dragControls={dragControls}
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
