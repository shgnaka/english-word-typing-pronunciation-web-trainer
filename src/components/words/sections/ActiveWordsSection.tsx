import type { DragEvent, Ref } from "react";
import { t } from "../../../i18n";
import type { TrainerState } from "../../../features/trainer/useTrainer";
import { BulkActionBar, IconButton, IconButtonSpacer, ReadonlyWordRow, SectionHeaderMeta, StatePill, type ActiveDragControls, type BulkActionFocusRefs, type SectionSelectionControls } from "../shared";

export function ActiveWordsSection({
  trainer,
  searchValue,
  filteredActiveWords,
  selection,
  bulkFocusRefs,
  dragControls,
  selectedCountLabel,
  sectionRef
}: {
  trainer: TrainerState;
  searchValue: string;
  filteredActiveWords: TrainerState["activeWords"];
  selection: SectionSelectionControls;
  bulkFocusRefs: BulkActionFocusRefs;
  dragControls: ActiveDragControls;
  selectedCountLabel: string;
  sectionRef?: Ref<HTMLElement>;
}) {
  const language = trainer.displayLanguage;
  const allVisibleSelected =
    selection.selectableWordIds.length > 0 && selection.selectableWordIds.every((wordId) => selection.selectedWordIds.includes(wordId));

  return (
    <section ref={sectionRef} className="word-section word-section-active" data-testid="active-word-section">
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "words.activeTitle")}</p>
          <p>{t(language, "words.activeHint")}</p>
        </div>
        <SectionHeaderMeta>
          <StatePill label={t(language, "words.stateActive")} tone="active" testId="active-state-pill" />
          <span className="word-count-pill">{trainer.activeWords.length}</span>
        </SectionHeaderMeta>
      </div>
      <BulkActionBar
        selectedCount={selection.selectedWordIds.length}
        selectedCountLabel={selectedCountLabel}
        selectVisibleLabel={allVisibleSelected ? t(language, "words.deselectVisible") : t(language, "words.selectVisible")}
        clearSelectionLabel={t(language, "words.clearSelection")}
        helperText={t(language, "words.bulkHint")}
        hasVisibleItems={selection.selectableWordIds.length > 0}
        allVisibleSelected={allVisibleSelected}
        selectedCountTestId="bulk-selected-count-active"
        selectVisibleTestId="bulk-select-visible-active-button"
        clearSelectionTestId="bulk-clear-selection-active-button"
        selectVisibleRef={bulkFocusRefs.selectVisibleRef}
        containerRef={bulkFocusRefs.containerRef}
        onSelectVisible={selection.toggleVisible}
        onClearSelection={selection.clear}
      >
        <button
          type="button"
          className="secondary inline-action"
          data-testid="bulk-remove-active-words-button"
          onClick={() => selection.runBulkAction(() => trainer.handleRemoveWordsFromPractice(selection.selectedWordIds))}
          disabled={selection.selectedWordIds.length === 0}
        >
          {t(language, "words.bulkRemoveFromPractice")}
        </button>
      </BulkActionBar>
      <div className="word-list" data-testid="active-word-list" aria-label={t(language, "words.activeTitle")}>
        {filteredActiveWords.length === 0 ? (
          <p className="word-list-empty">{t(language, "words.noMatches")}</p>
        ) : (
          filteredActiveWords.map((word) => {
            const activeWordIndex = trainer.activeWords.findIndex((entry) => entry.id === word.id);

            return (
              <ReadonlyWordRow
                key={word.id}
                rowTestId="active-word-row"
                chipTestId="active-word-chip"
                wordId={word.id}
                wordText={word.text}
                searchValue={searchValue}
                selectLabel={t(language, "words.selectWord")}
                selectTestId={`select-active-word-checkbox-${word.id}`}
                selected={selection.selectedWordIds.includes(word.id)}
                onToggleSelected={() => selection.toggleWord(word.id)}
                moreActionsLabel={t(language, "words.moreActions")}
                sourceTag={
                  <span className={`word-source-tag ${word.source === "builtin" ? "word-source-tag-builtin" : "word-source-tag-custom"}`}>
                    {t(language, word.source === "builtin" ? "words.sourceBuiltin" : "words.sourceCustom")}
                  </span>
                }
                actions={[
                  <IconButton
                    key="remove"
                    label={t(language, "words.removeFromPractice")}
                    icon="−"
                    testId={`remove-from-practice-button-${word.id}`}
                    onClick={() => (word.source === "builtin" ? trainer.handleRemoveBuiltinWord(word.id) : trainer.removeCustomWordFromPractice(word.id))}
                  />,
                  activeWordIndex > 0 ? (
                    <IconButton key="up" label={t(language, "words.moveUp")} icon="↑" testId={`move-word-up-button-${word.id}`} onClick={() => trainer.moveWord(word.id, "up")} />
                  ) : (
                    <IconButtonSpacer key="up-spacer" />
                  ),
                  activeWordIndex < dragControls.lastActiveWordIndex ? (
                    <IconButton key="down" label={t(language, "words.moveDown")} icon="↓" testId={`move-word-down-button-${word.id}`} onClick={() => trainer.moveWord(word.id, "down")} />
                  ) : (
                    <IconButtonSpacer key="down-spacer" />
                  ),
                  activeWordIndex > 0 ? (
                    <IconButton key="top" label={t(language, "words.moveToTop")} icon="⇡" testId={`move-word-top-button-${word.id}`} onClick={() => trainer.moveWordToEdge(word.id, "top")} />
                  ) : (
                    <IconButtonSpacer key="top-spacer" />
                  ),
                  activeWordIndex < dragControls.lastActiveWordIndex ? (
                    <IconButton key="bottom" label={t(language, "words.moveToBottom")} icon="⇣" testId={`move-word-bottom-button-${word.id}`} onClick={() => trainer.moveWordToEdge(word.id, "bottom")} />
                  ) : (
                    <IconButtonSpacer key="bottom-spacer" />
                  )
                ]}
                draggable
                dragStateClassName={`${dragControls.draggedWordId === word.id ? "word-chip-row-dragging" : ""} ${dragControls.dropTargetWordId === word.id && dragControls.draggedWordId !== word.id ? "word-chip-row-drop-target" : ""}`.trim()}
                onDragStart={(event: DragEvent<HTMLDivElement>) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", word.id);
                  dragControls.startWordDrag(word.id);
                }}
                onDragOver={(event: DragEvent<HTMLDivElement>) => {
                  event.preventDefault();
                  if (dragControls.draggedWordId && dragControls.draggedWordId !== word.id) {
                    event.dataTransfer.dropEffect = "move";
                    dragControls.setDragTarget(word.id);
                  }
                }}
                onDrop={(event: DragEvent<HTMLDivElement>) => {
                  event.preventDefault();
                  dragControls.dropWord(word.id);
                }}
                onDragEnd={dragControls.clear}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
