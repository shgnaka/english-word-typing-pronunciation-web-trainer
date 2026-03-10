import { t } from "../../../i18n";
import type { TrainerState } from "../../../features/trainer/useTrainer";
import { BulkActionBar, EditingWordRow, IconButton, ReadonlyWordRow, SectionHeaderMeta, StatePill, type BulkActionFocusRefs, type SectionSelectionControls } from "../shared";

export function HiddenCustomWordsSection({
  trainer,
  searchValue,
  filteredInactiveCustomWords,
  inactiveCustomMinimized,
  selection,
  bulkFocusRefs,
  onToggleSection,
  selectedCountLabel,
  onScrollToSelf
}: {
  trainer: TrainerState;
  searchValue: string;
  filteredInactiveCustomWords: TrainerState["inactiveCustomWords"];
  inactiveCustomMinimized: boolean;
  selection: SectionSelectionControls;
  bulkFocusRefs: BulkActionFocusRefs;
  onToggleSection: () => void;
  selectedCountLabel: (count: number) => string;
  onScrollToSelf: () => void;
}) {
  const language = trainer.displayLanguage;
  const allHiddenVisibleSelected =
    selection.selectableWordIds.length > 0 && selection.selectableWordIds.every((wordId) => selection.selectedWordIds.includes(wordId));

  function confirmBulkDelete() {
    return window.confirm(t(language, "words.bulkDeleteConfirm"));
  }

  return (
    <section className={`word-section word-section-hidden word-section-hidden-custom ${inactiveCustomMinimized ? "word-section-minimized" : ""}`} data-testid="inactive-custom-word-section">
      <div className="panel-header panel-header-compact">
        <div>
          <p className="label">{t(language, "words.inactiveCustomTitle")}</p>
          <p>{t(language, "words.inactiveCustomHint")}</p>
        </div>
        <SectionHeaderMeta
          tools={
            <button
              type="button"
              className="secondary compact-toggle"
              data-testid="toggle-inactive-custom-section-button"
              aria-expanded={!inactiveCustomMinimized}
              onClick={onToggleSection}
              aria-label={t(language, inactiveCustomMinimized ? "words.expandSection" : "words.minimizeSection")}
              title={t(language, inactiveCustomMinimized ? "words.expandSection" : "words.minimizeSection")}
            >
              <span aria-hidden="true" className="icon-glyph">
                {inactiveCustomMinimized ? "+" : "-"}
              </span>
            </button>
          }
        >
          <StatePill label={t(language, "words.stateHidden")} tone="hidden" testId="hidden-custom-state-pill" />
          <StatePill label={t(language, "words.stateLocalOnly")} tone="local" testId="hidden-custom-local-state-pill" />
          <span className="word-count-pill">{trainer.inactiveCustomWords.length}</span>
        </SectionHeaderMeta>
      </div>
      {inactiveCustomMinimized ? (
        <p className="word-section-summary" data-testid="inactive-custom-section-summary">
          {t(language, "words.minimizedSummary")}
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
            selectedCountTestId="bulk-selected-count-hidden-custom"
            selectVisibleTestId="bulk-select-visible-hidden-custom-button"
            clearSelectionTestId="bulk-clear-selection-hidden-custom-button"
            selectVisibleRef={bulkFocusRefs.selectVisibleRef}
            containerRef={bulkFocusRefs.containerRef}
            onSelectVisible={selection.toggleVisible}
            onClearSelection={selection.clear}
          >
            <>
              <button
                type="button"
                className="secondary inline-action"
                data-testid="bulk-restore-hidden-custom-words-button"
                onClick={() => selection.runBulkAction(() => trainer.addCustomWordsToPractice(selection.selectedWordIds))}
                disabled={selection.selectedWordIds.length === 0}
              >
                {t(language, "words.bulkRestore")}
              </button>
              <button
                type="button"
                className="secondary inline-action inline-action-destructive"
                data-testid="bulk-delete-hidden-custom-words-button"
                onClick={() => {
                  if (!confirmBulkDelete()) {
                    return;
                  }

                  selection.runBulkAction(() => trainer.handleRemoveWords(selection.selectedWordIds));
                }}
                disabled={selection.selectedWordIds.length === 0}
              >
                {t(language, "words.bulkDelete")}
              </button>
            </>
          </BulkActionBar>
          <div className="word-list" data-testid="inactive-custom-word-list" aria-label={t(language, "words.inactiveCustomTitle")}>
            {trainer.inactiveCustomWords.length === 0 ? (
              <div className="empty-state">
                <strong>{t(language, "words.inactiveCustomEmpty")}</strong>
                <p>{t(language, "words.hiddenCustomAction")}</p>
                <button type="button" className="secondary inline-action" data-testid="hidden-custom-empty-cta" onClick={onScrollToSelf}>
                  {t(language, "words.hiddenCustomCta")}
                </button>
              </div>
            ) : filteredInactiveCustomWords.length === 0 ? (
              <p className="word-list-empty">{t(language, "words.noMatches")}</p>
            ) : (
              filteredInactiveCustomWords.map((word) => (
                <div key={word.id} className="word-chip-row" data-testid="inactive-custom-word-row">
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
                      rowTestId="inactive-custom-word-row"
                      chipTestId="inactive-custom-word-chip"
                      wordId={word.id}
                      wordText={word.text}
                      searchValue={searchValue}
                      selectLabel={t(language, "words.selectWord")}
                      selectTestId={`select-hidden-custom-word-checkbox-${word.id}`}
                      selected={selection.selectedWordIds.includes(word.id)}
                      onToggleSelected={() => selection.toggleWord(word.id)}
                      moreActionsLabel={t(language, "words.moreActions")}
                      badge={<StatePill label={t(language, "words.stateLocalOnly")} tone="local" />}
                      actions={[
                        <IconButton key="restore" label={t(language, "words.restore")} icon="+" testId={`add-to-practice-button-${word.id}`} onClick={() => trainer.addCustomWordToPractice(word.id)} />,
                        <IconButton key="edit" label={t(language, "words.edit")} icon="✎" testId={`edit-word-button-${word.id}`} onClick={() => trainer.startEditingWord(word.id, "custom")} />,
                        <IconButton key="delete" label={t(language, "words.delete")} icon="🗑" testId={`delete-word-button-${word.id}`} onClick={() => trainer.handleRemoveWord(word.id)} />
                      ]}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
