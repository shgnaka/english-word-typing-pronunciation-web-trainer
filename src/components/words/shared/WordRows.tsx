import { Children, isValidElement, useEffect, useState, type DragEvent, type ReactNode } from "react";
import { IconButtonSpacer } from "./WordControls";

function useCompactWordRowActions() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const update = (matches: boolean) => setIsCompact(matches);

    update(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => update(event.matches);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, []);

  return isCompact;
}

function isSpacerAction(node: ReactNode) {
  return isValidElement(node) && node.type === IconButtonSpacer;
}

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
  moreActionsLabel,
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
  moreActionsLabel?: string;
  draggable?: boolean;
  dragStateClassName?: string;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
}) {
  const isCompact = useCompactWordRowActions();
  const normalizedActions = Children.toArray(actions).filter((action) => !isCompact || !isSpacerAction(action));
  const primaryActions = isCompact ? normalizedActions.slice(0, 2) : normalizedActions;
  const secondaryActions = isCompact ? normalizedActions.slice(2) : [];

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
      <div className="word-row-actions">
        <div className="word-row-actions-primary">{primaryActions}</div>
        {secondaryActions.length > 0 ? (
          <details className="word-row-actions-overflow">
            <summary
              className="secondary icon-button word-row-actions-overflow-toggle"
              data-testid={`more-row-actions-button-${wordId}`}
              aria-label={moreActionsLabel}
              title={moreActionsLabel}
            >
              <span aria-hidden="true" className="icon-glyph">
                ⋯
              </span>
            </summary>
            <div className="word-row-actions-overflow-menu">{secondaryActions}</div>
          </details>
        ) : null}
      </div>
    </div>
  );
}
