import type { ReactNode, Ref } from "react";

export function IconButton({
  label,
  icon,
  testId,
  onClick,
  disabled = false
}: {
  label: string;
  icon: string;
  testId: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className="secondary icon-button" data-testid={testId} aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      <span aria-hidden="true" className="icon-glyph">
        {icon}
      </span>
    </button>
  );
}

export function IconButtonSpacer() {
  return <span aria-hidden="true" className="icon-button-spacer" />;
}

export function BulkActionBar({
  selectedCount,
  selectedCountLabel,
  selectVisibleLabel,
  clearSelectionLabel,
  helperText,
  hasVisibleItems,
  allVisibleSelected,
  selectVisibleTestId,
  clearSelectionTestId,
  selectedCountTestId,
  selectVisibleRef,
  containerRef,
  onSelectVisible,
  onClearSelection,
  children
}: {
  selectedCount: number;
  selectedCountLabel: string;
  selectVisibleLabel: string;
  clearSelectionLabel: string;
  helperText: string;
  hasVisibleItems: boolean;
  allVisibleSelected: boolean;
  selectVisibleTestId?: string;
  clearSelectionTestId?: string;
  selectedCountTestId?: string;
  selectVisibleRef?: Ref<HTMLButtonElement>;
  containerRef?: Ref<HTMLDivElement>;
  onSelectVisible: () => void;
  onClearSelection: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="bulk-action-bar" ref={containerRef} tabIndex={-1}>
      <div className="bulk-action-copy">
        <strong className="bulk-selection-pill" data-testid={selectedCountTestId}>
          {selectedCountLabel}
        </strong>
        <p>{helperText}</p>
      </div>
      <div className="section-inline-actions">
        <button
          type="button"
          className="secondary inline-action"
          ref={selectVisibleRef}
          data-testid={selectVisibleTestId}
          onClick={onSelectVisible}
          disabled={!hasVisibleItems}
          aria-pressed={allVisibleSelected}
        >
          {selectVisibleLabel}
        </button>
        <button
          type="button"
          className="secondary inline-action"
          data-testid={clearSelectionTestId}
          onClick={onClearSelection}
          disabled={selectedCount === 0}
        >
          {clearSelectionLabel}
        </button>
        {children}
      </div>
    </div>
  );
}

export function StatePill({ label, tone, testId }: { label: string; tone: "active" | "hidden" | "local" | "edited"; testId?: string }) {
  return (
    <span className={`state-pill state-pill-${tone}`} data-testid={testId}>
      {label}
    </span>
  );
}

export function SectionHeaderMeta({
  children,
  tools
}: {
  children: ReactNode;
  tools?: ReactNode;
}) {
  return (
    <div className="word-section-meta">
      <div className="word-section-status">{children}</div>
      {tools ? <div className="word-section-tools">{tools}</div> : null}
    </div>
  );
}
