import type { DragEvent, ReactNode } from "react";

function renderHighlightedText(text: string, searchValue: string) {
  const normalizedSearchValue = searchValue.trim().toLowerCase();

  if (!normalizedSearchValue) {
    return text;
  }

  const normalizedText = text.toLowerCase();
  const parts: Array<JSX.Element | string> = [];
  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = normalizedText.indexOf(normalizedSearchValue, cursor);

    if (matchIndex === -1) {
      parts.push(text.slice(cursor));
      break;
    }

    if (matchIndex > cursor) {
      parts.push(text.slice(cursor, matchIndex));
    }

    const nextCursor = matchIndex + normalizedSearchValue.length;
    parts.push(
      <mark key={`${text}-${matchIndex}`} className="word-match-highlight">
        {text.slice(matchIndex, nextCursor)}
      </mark>
    );
    cursor = nextCursor;
  }

  return <>{parts}</>;
}

export function EditingWordRow({
  wordId,
  wordText,
  editingWordValue,
  setEditingWordValue,
  saveEditingWord,
  cancelEditingWord,
  editLabel,
  saveLabel,
  cancelLabel
}: {
  wordId: string;
  wordText: string;
  editingWordValue: string;
  setEditingWordValue: (value: string) => void;
  saveEditingWord: () => void;
  cancelEditingWord: () => void;
  editLabel: string;
  saveLabel: string;
  cancelLabel: string;
}) {
  return (
    <>
      <input
        data-testid={`edit-word-input-${wordId}`}
        value={editingWordValue}
        onChange={(event) => setEditingWordValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            saveEditingWord();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            cancelEditingWord();
          }
        }}
        aria-label={`${editLabel} ${wordText}`}
      />
      <button type="button" className="secondary" data-testid={`save-word-button-${wordId}`} onClick={saveEditingWord}>
        {saveLabel}
      </button>
      <button type="button" className="secondary" data-testid={`cancel-word-button-${wordId}`} onClick={cancelEditingWord}>
        {cancelLabel}
      </button>
    </>
  );
}

export function ReadonlyWordRow({
  rowTestId,
  chipTestId,
  wordId,
  wordText,
  searchValue,
  actions,
  selectLabel,
  selectTestId,
  selected = false,
  onToggleSelected,
  sourceTag,
  badge,
  draggable = false,
  dragStateClassName = "",
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}: {
  rowTestId: string;
  chipTestId: string;
  wordId: string;
  wordText: string;
  searchValue: string;
  actions: ReactNode;
  selectLabel?: string;
  selectTestId?: string;
  selected?: boolean;
  onToggleSelected?: () => void;
  sourceTag?: ReactNode;
  badge?: ReactNode;
  draggable?: boolean;
  dragStateClassName?: string;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
}) {
  return (
    <div
      className={`word-chip-row ${selected ? "word-chip-row-selected" : ""} ${draggable ? "word-chip-row-draggable" : ""} ${dragStateClassName}`.trim()}
      data-testid={rowTestId}
      draggable={draggable}
      aria-grabbed={draggable ? dragStateClassName.includes("dragging") : undefined}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {onToggleSelected ? (
        <label className="word-select-toggle">
          <input type="checkbox" data-testid={selectTestId ?? `select-word-checkbox-${wordId}`} checked={selected} onChange={onToggleSelected} aria-label={`${selectLabel} ${wordText}`} />
        </label>
      ) : null}
      <span className="word-chip" data-testid={chipTestId}>
        {renderHighlightedText(wordText, searchValue)}
      </span>
      {sourceTag ?? null}
      {badge ?? null}
      <div className="word-row-actions">{actions}</div>
    </div>
  );
}
