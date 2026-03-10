import type { Ref } from "react";
import { t } from "../../../i18n";
import type { TrainerState } from "../../../features/trainer/useTrainer";
import { BulkActionBar, EditingWordRow, IconButton, ReadonlyWordRow, type NestedBulkActionFocusRefs, type NestedSectionSelectionControls, SectionHeaderMeta, StatePill, type WordsPanelState } from "../shared";
import { HiddenCustomWordsSection } from "./HiddenCustomWordsSection";

export function CustomWordsSection({
  trainer,
  searchValue,
  filteredCustomWords,
  filteredInactiveCustomWords,
  wordsPanelState,
  sectionRef,
  selection,
  bulkFocusRefs,
  onToggleSection,
  onToggleHiddenSection,
  selectedCountLabel,
  onFocusNewWordInput,
  onScrollToSelf
}: {
  trainer: TrainerState;
  searchValue: string;
  filteredCustomWords: TrainerState["customWords"];
  filteredInactiveCustomWords: TrainerState["inactiveCustomWords"];
  wordsPanelState: WordsPanelState;
  sectionRef: Ref<HTMLElement>;
  selection: NestedSectionSelectionControls;
  bulkFocusRefs: NestedBulkActionFocusRefs;
  onToggleSection: () => void;
  onToggleHiddenSection: () => void;
  selectedCountLabel: (count: number) => string;
  onFocusNewWordInput: () => void;
  onScrollToSelf: () => void;
}) {
  const language = trainer.displayLanguage;
  const allVisibleSelected =
    selection.active.selectableWordIds.length > 0 &&
    selection.active.selectableWordIds.every((wordId) => selection.active.selectedWordIds.includes(wordId));
  const activeCustomCount = trainer.customWords.length - trainer.inactiveCustomWords.length;

  return (
    <section ref={sectionRef} className={`word-section word-section-custom ${wordsPanelState.customMinimized ? "word-section-minimized" : ""}`} data-testid="custom-word-section">
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "words.customTitle")}</p>
          <p>{t(language, "words.customHint")}</p>
        </div>
        <SectionHeaderMeta
          tools={[
            <div key="sort" className="section-inline-actions word-section-sort" aria-label={t(language, "words.customTitle")}>
              <button type="button" className="secondary inline-action" data-testid="sort-custom-alpha-button" onClick={() => trainer.sortCustomWords("alphabetical")}>
                {t(language, "words.sortAlpha")}
              </button>
              <button type="button" className="secondary inline-action" data-testid="sort-custom-newest-button" onClick={() => trainer.sortCustomWords("newest")}>
                {t(language, "words.sortNewest")}
              </button>
              <button type="button" className="secondary inline-action" data-testid="sort-custom-oldest-button" onClick={() => trainer.sortCustomWords("oldest")}>
                {t(language, "words.sortOldest")}
              </button>
            </div>,
            <button
              key="toggle"
              type="button"
              className="secondary compact-toggle"
              data-testid="toggle-custom-section-button"
              aria-expanded={!wordsPanelState.customMinimized}
              onClick={onToggleSection}
              aria-label={t(language, wordsPanelState.customMinimized ? "words.expandSection" : "words.minimizeSection")}
              title={t(language, wordsPanelState.customMinimized ? "words.expandSection" : "words.minimizeSection")}
            >
              <span aria-hidden="true" className="icon-glyph">
                {wordsPanelState.customMinimized ? "+" : "-"}
              </span>
            </button>
          ]}
        >
          <StatePill label={t(language, "words.stateLocalOnly")} tone="local" testId="custom-state-pill" />
          <span className="word-count-pill">{activeCustomCount}</span>
        </SectionHeaderMeta>
      </div>
      {wordsPanelState.customMinimized ? (
        <p className="word-section-summary" data-testid="custom-section-summary">
          {t(language, "words.minimizedSummary")}
        </p>
      ) : (
        <>
          <BulkActionBar
            selectedCount={selection.active.selectedWordIds.length}
            selectedCountLabel={selectedCountLabel(selection.active.selectedWordIds.length)}
            selectVisibleLabel={allVisibleSelected ? t(language, "words.deselectVisible") : t(language, "words.selectVisible")}
            clearSelectionLabel={t(language, "words.clearSelection")}
            helperText={t(language, "words.bulkHint")}
            hasVisibleItems={selection.active.selectableWordIds.length > 0}
            allVisibleSelected={allVisibleSelected}
            selectedCountTestId="bulk-selected-count-custom"
            selectVisibleTestId="bulk-select-visible-custom-button"
            clearSelectionTestId="bulk-clear-selection-custom-button"
            selectVisibleRef={bulkFocusRefs.active.selectVisibleRef}
            containerRef={bulkFocusRefs.active.containerRef}
            onSelectVisible={selection.active.toggleVisible}
            onClearSelection={selection.active.clear}
          >
            <>
              <button
                type="button"
                className="secondary inline-action"
                data-testid="bulk-remove-custom-words-button"
                onClick={() => selection.active.runBulkAction(() => trainer.removeCustomWordsFromPractice(selection.active.selectedWordIds))}
                disabled={selection.active.selectedWordIds.length === 0}
              >
                {t(language, "words.bulkRemoveFromPractice")}
              </button>
              <button
                type="button"
                className="secondary inline-action"
                data-testid="bulk-delete-custom-words-button"
                onClick={() => selection.active.runBulkAction(() => trainer.handleRemoveWords(selection.active.selectedWordIds))}
                disabled={selection.active.selectedWordIds.length === 0}
              >
                {t(language, "words.bulkDelete")}
              </button>
            </>
          </BulkActionBar>
          <div className="word-list" data-testid="custom-word-list" aria-label={t(language, "words.customTitle")}>
            {activeCustomCount === 0 ? (
              <div className="empty-state">
                <strong>{t(language, "words.empty")}</strong>
                <p>{t(language, "words.emptyCustomAction")}</p>
                <button type="button" className="secondary inline-action" data-testid="empty-custom-cta" onClick={onFocusNewWordInput}>
                  {t(language, "words.emptyCustomCta")}
                </button>
              </div>
            ) : filteredCustomWords.length === 0 ? (
              <p className="word-list-empty">{t(language, "words.noMatches")}</p>
            ) : (
              filteredCustomWords.map((word) => (
                <div key={word.id} className="word-chip-row" data-testid="word-chip-row">
                  {trainer.editingWordId === word.id && trainer.editingWordSource === "custom" ? (
                    <EditingWordRow
                      wordId={word.id}
                      wordText={word.text}
                      editingWordValue={trainer.editingWordValue}
                      setEditingWordValue={trainer.setEditingWordValue}
                      saveEditingWord={trainer.saveEditingWord}
                      cancelEditingWord={trainer.cancelEditingWord}
                      editLabel={t(language, "words.edit")}
                      saveLabel={t(language, "words.save")}
                      cancelLabel={t(language, "words.cancel")}
                    />
                  ) : (
                    <ReadonlyWordRow
                      rowTestId="word-chip-row"
                      chipTestId="word-chip"
                      wordId={word.id}
                      wordText={word.text}
                      searchValue={searchValue}
                      selectLabel={t(language, "words.selectWord")}
                      selectTestId={`select-custom-word-checkbox-${word.id}`}
                      selected={selection.active.selectedWordIds.includes(word.id)}
                      onToggleSelected={() => selection.active.toggleWord(word.id)}
                      actions={[
                        <IconButton key="edit" label={t(language, "words.edit")} icon="✎" testId={`edit-word-button-${word.id}`} onClick={() => trainer.startEditingWord(word.id, "custom")} />,
                        <IconButton key="delete" label={t(language, "words.delete")} icon="🗑" testId={`delete-word-button-${word.id}`} onClick={() => trainer.handleRemoveWord(word.id)} />,
                        <IconButton
                          key="remove"
                          label={t(language, "words.removeFromPractice")}
                          icon="−"
                          testId={`remove-from-practice-manage-button-${word.id}`}
                          onClick={() => trainer.removeCustomWordFromPractice(word.id)}
                        />
                      ]}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          <HiddenCustomWordsSection
            trainer={trainer}
            searchValue={searchValue}
            filteredInactiveCustomWords={filteredInactiveCustomWords}
            inactiveCustomMinimized={wordsPanelState.inactiveCustomMinimized}
            selection={selection.hidden}
            bulkFocusRefs={bulkFocusRefs.hidden}
            onToggleSection={onToggleHiddenSection}
            selectedCountLabel={selectedCountLabel}
            onScrollToSelf={onScrollToSelf}
          />
        </>
      )}
    </section>
  );
}
