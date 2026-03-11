import type { Ref } from "react";
import { formatMessage, t } from "../../../i18n";
import type { TrainerState } from "../../../features/trainer/useTrainer";
import { BulkActionBar, IconButton, ReadonlyWordRow, SectionHeaderMeta, StatePill, type BulkActionFocusRefs, type SectionSelectionControls } from "../shared";

export function HiddenBuiltinWordsSection({
  trainer,
  searchValue,
  filteredHiddenBuiltinWords,
  hiddenBuiltinMinimized,
  sectionRef,
  selection,
  bulkFocusRefs,
  onToggleSection,
  selectedCountLabel
}: {
  trainer: TrainerState;
  searchValue: string;
  filteredHiddenBuiltinWords: TrainerState["hiddenBuiltinWords"];
  hiddenBuiltinMinimized: boolean;
  sectionRef?: Ref<HTMLElement>;
  selection: SectionSelectionControls;
  bulkFocusRefs: BulkActionFocusRefs;
  onToggleSection: () => void;
  selectedCountLabel: (count: number) => string;
}) {
  const language = trainer.displayLanguage;
  const allHiddenVisibleSelected =
    selection.selectableWordIds.length > 0 && selection.selectableWordIds.every((wordId) => selection.selectedWordIds.includes(wordId));
  const minimizedSummary = formatMessage(language, "words.hiddenBuiltinMinimizedSummary", { count: trainer.hiddenBuiltinWords.length });

  return (
    <section ref={sectionRef} className={`word-section word-section-hidden ${hiddenBuiltinMinimized ? "word-section-minimized" : ""}`} data-testid="hidden-builtin-word-section">
      <div className="panel-header panel-header-compact">
        <div>
          <p className="label">{t(language, "words.hiddenBuiltinTitle")}</p>
        </div>
        <SectionHeaderMeta
          tools={
            <button
              type="button"
              className="secondary compact-toggle"
              data-testid="toggle-hidden-builtin-section-button"
              aria-expanded={!hiddenBuiltinMinimized}
              onClick={onToggleSection}
              aria-label={t(language, hiddenBuiltinMinimized ? "words.expandSection" : "words.minimizeSection")}
              title={t(language, hiddenBuiltinMinimized ? "words.expandSection" : "words.minimizeSection")}
            >
              <span aria-hidden="true" className="icon-glyph">
                {hiddenBuiltinMinimized ? "+" : "-"}
              </span>
            </button>
          }
        >
          <StatePill label={t(language, "words.stateHidden")} tone="hidden" testId="hidden-builtin-state-pill" />
          <span className="word-count-pill">{trainer.hiddenBuiltinWords.length}</span>
        </SectionHeaderMeta>
      </div>
      {hiddenBuiltinMinimized ? (
        <p className="word-section-summary" data-testid="hidden-builtin-section-summary">
          {minimizedSummary}
        </p>
      ) : (
        <>
          <BulkActionBar
            selectedCount={selection.selectedWordIds.length}
            selectedCountLabel={selectedCountLabel(selection.selectedWordIds.length)}
            selectVisibleLabel={allHiddenVisibleSelected ? t(language, "words.deselectVisible") : t(language, "words.selectVisible")}
            clearSelectionLabel={t(language, "words.clearSelection")}
            helperText={t(language, "words.bulkHint")}
            hasVisibleItems={selection.selectableWordIds.length > 0}
            allVisibleSelected={allHiddenVisibleSelected}
            selectedCountTestId="bulk-selected-count-hidden-builtin"
            selectVisibleTestId="bulk-select-visible-hidden-builtin-button"
            clearSelectionTestId="bulk-clear-selection-hidden-builtin-button"
            selectVisibleRef={bulkFocusRefs.selectVisibleRef}
            containerRef={bulkFocusRefs.containerRef}
            onSelectVisible={selection.toggleVisible}
            onClearSelection={selection.clear}
          >
            <button
              type="button"
              className="secondary inline-action"
              data-testid="bulk-restore-hidden-builtin-words-button"
              onClick={() => selection.runBulkAction(() => trainer.restoreBuiltinWords(selection.selectedWordIds))}
              disabled={selection.selectedWordIds.length === 0}
            >
              {t(language, "words.bulkRestore")}
            </button>
          </BulkActionBar>
          <div className="word-list" data-testid="hidden-builtin-word-list" aria-label={t(language, "words.hiddenBuiltinTitle")}>
            {filteredHiddenBuiltinWords.length === 0 ? (
              <p className="word-list-empty">{t(language, "words.noMatches")}</p>
            ) : (
              filteredHiddenBuiltinWords.map((word) => (
                <ReadonlyWordRow
                  key={word.id}
                  rowTestId="hidden-builtin-word-row"
                  chipTestId="hidden-builtin-word-chip"
                  wordId={word.id}
                  wordText={word.text}
                  searchValue={searchValue}
                  selectLabel={t(language, "words.selectWord")}
                  selectTestId={`select-hidden-builtin-word-checkbox-${word.id}`}
                  selected={selection.selectedWordIds.includes(word.id)}
                  onToggleSelected={() => selection.toggleWord(word.id)}
                  moreActionsLabel={t(language, "words.moreActions")}
                  actions={<IconButton label={t(language, "words.restore")} icon="↺" testId={`restore-word-button-${word.id}`} onClick={() => trainer.restoreBuiltinWord(word.id)} />}
                />
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
