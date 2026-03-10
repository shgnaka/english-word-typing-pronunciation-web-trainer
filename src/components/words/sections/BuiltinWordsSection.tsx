import type { Ref } from "react";
import { t } from "../../../i18n";
import type { TrainerState } from "../../../features/trainer/useTrainer";
import { BulkActionBar, EditingWordRow, IconButton, ReadonlyWordRow, type NestedBulkActionFocusRefs, type NestedSectionSelectionControls, SectionHeaderMeta, StatePill, type WordsPanelState } from "../shared";
import { HiddenBuiltinWordsSection } from "./HiddenBuiltinWordsSection";

export function BuiltinWordsSection({
  trainer,
  searchValue,
  filteredBuiltinWords,
  filteredHiddenBuiltinWords,
  editedBuiltinWordIds,
  wordsPanelState,
  sectionRef,
  selection,
  bulkFocusRefs,
  onToggleSection,
  onToggleHiddenSection,
  selectedCountLabel,
  onScrollToSelf
}: {
  trainer: TrainerState;
  searchValue: string;
  filteredBuiltinWords: TrainerState["builtinWords"];
  filteredHiddenBuiltinWords: TrainerState["hiddenBuiltinWords"];
  editedBuiltinWordIds: Set<string>;
  wordsPanelState: WordsPanelState;
  sectionRef: Ref<HTMLElement>;
  selection: NestedSectionSelectionControls;
  bulkFocusRefs: NestedBulkActionFocusRefs;
  onToggleSection: () => void;
  onToggleHiddenSection: () => void;
  selectedCountLabel: (count: number) => string;
  onScrollToSelf: () => void;
}) {
  const language = trainer.displayLanguage;
  const allVisibleSelected =
    selection.active.selectableWordIds.length > 0 &&
    selection.active.selectableWordIds.every((wordId) => selection.active.selectedWordIds.includes(wordId));
  return (
    <section ref={sectionRef} className={`word-section word-section-builtin ${wordsPanelState.builtinMinimized ? "word-section-minimized" : ""}`} data-testid="builtin-word-section">
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "words.builtinTitle")}</p>
          <p>{t(language, "words.builtinHint")}</p>
        </div>
        <SectionHeaderMeta
          tools={[
            <button key="reset" className="secondary inline-action" type="button" data-testid="reset-builtin-words-button" onClick={trainer.resetBuiltinWords}>
              {t(language, "words.resetBuiltin")}
            </button>,
            <button
              key="toggle"
              type="button"
              className="secondary compact-toggle"
              data-testid="toggle-builtin-section-button"
              aria-expanded={!wordsPanelState.builtinMinimized}
              onClick={onToggleSection}
              aria-label={t(language, wordsPanelState.builtinMinimized ? "words.expandSection" : "words.minimizeSection")}
              title={t(language, wordsPanelState.builtinMinimized ? "words.expandSection" : "words.minimizeSection")}
            >
              <span aria-hidden="true" className="icon-glyph">
                {wordsPanelState.builtinMinimized ? "+" : "-"}
              </span>
            </button>
          ]}
        >
          <StatePill label={t(language, "words.stateActive")} tone="active" testId="builtin-state-pill" />
          <span className="word-count-pill">{trainer.builtinWords.length}</span>
        </SectionHeaderMeta>
      </div>
      {wordsPanelState.builtinMinimized ? (
        <p className="word-section-summary" data-testid="builtin-section-summary">
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
            selectedCountTestId="bulk-selected-count-builtin"
            selectVisibleTestId="bulk-select-visible-builtin-button"
            clearSelectionTestId="bulk-clear-selection-builtin-button"
            selectVisibleRef={bulkFocusRefs.active.selectVisibleRef}
            containerRef={bulkFocusRefs.active.containerRef}
            onSelectVisible={selection.active.toggleVisible}
            onClearSelection={selection.active.clear}
          >
            <button
              type="button"
              className="secondary inline-action"
              data-testid="bulk-remove-builtin-words-button"
              onClick={() => selection.active.runBulkAction(() => trainer.handleRemoveBuiltinWords(selection.active.selectedWordIds))}
              disabled={selection.active.selectedWordIds.length === 0}
            >
              {t(language, "words.bulkRemoveFromPractice")}
            </button>
          </BulkActionBar>
          <div className="word-list" data-testid="builtin-word-list" aria-label={t(language, "words.builtinTitle")}>
            {filteredBuiltinWords.length === 0 ? (
              <p className="word-list-empty">{t(language, "words.noMatches")}</p>
            ) : (
              filteredBuiltinWords.map((word) => (
                <div key={word.id} className="word-chip-row" data-testid="builtin-word-row">
                  {trainer.editingWordId === word.id && trainer.editingWordSource === "builtin" ? (
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
                      rowTestId="builtin-word-row"
                      chipTestId="builtin-word-chip"
                      wordId={word.id}
                      wordText={word.text}
                      searchValue={searchValue}
                      selectLabel={t(language, "words.selectWord")}
                      selectTestId={`select-builtin-word-checkbox-${word.id}`}
                      selected={selection.active.selectedWordIds.includes(word.id)}
                      onToggleSelected={() => selection.active.toggleWord(word.id)}
                      badge={editedBuiltinWordIds.has(word.id) ? <StatePill label={t(language, "words.builtinEdited")} tone="edited" testId={`builtin-word-state-${word.id}`} /> : null}
                      actions={[
                        editedBuiltinWordIds.has(word.id) ? (
                          <IconButton key="restore" label={t(language, "words.restore")} icon="↺" testId={`restore-word-button-${word.id}`} onClick={() => trainer.restoreBuiltinWord(word.id)} />
                        ) : null,
                        <IconButton key="edit" label={t(language, "words.edit")} icon="✎" testId={`edit-word-button-${word.id}`} onClick={() => trainer.startEditingWord(word.id, "builtin")} />,
                        <IconButton key="remove" label={t(language, "words.removeFromPractice")} icon="−" testId={`delete-word-button-${word.id}`} onClick={() => trainer.handleRemoveBuiltinWord(word.id)} />
                      ].filter(Boolean)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
          {trainer.hiddenBuiltinWords.length > 0 ? (
            <HiddenBuiltinWordsSection
              trainer={trainer}
              searchValue={searchValue}
              filteredHiddenBuiltinWords={filteredHiddenBuiltinWords}
              hiddenBuiltinMinimized={wordsPanelState.hiddenBuiltinMinimized}
              selection={selection.hidden}
              bulkFocusRefs={bulkFocusRefs.hidden}
              onToggleSection={onToggleHiddenSection}
              selectedCountLabel={selectedCountLabel}
            />
          ) : (
            <div className="empty-state" data-testid="hidden-builtin-empty">
              <strong>{t(language, "words.hiddenBuiltinEmpty")}</strong>
              <p>{t(language, "words.hiddenBuiltinAction")}</p>
              <button type="button" className="secondary inline-action" data-testid="hidden-builtin-empty-cta" onClick={onScrollToSelf}>
                {t(language, "words.hiddenBuiltinCta")}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
