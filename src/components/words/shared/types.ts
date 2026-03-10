import type { Ref } from "react";

export type WordSectionKey = "active" | "builtin" | "hiddenBuiltin" | "custom" | "hiddenCustom";

export interface WordsPanelState {
  builtinMinimized: boolean;
  hiddenBuiltinMinimized: boolean;
  customMinimized: boolean;
  inactiveCustomMinimized: boolean;
}

export interface SectionSelectionControls {
  selectedWordIds: string[];
  selectableWordIds: string[];
  toggleWord: (wordId: string) => void;
  toggleVisible: () => void;
  clear: () => void;
  runBulkAction: (action: () => void) => void;
}

export interface BulkActionFocusRefs {
  selectVisibleRef: Ref<HTMLButtonElement>;
  containerRef: Ref<HTMLDivElement>;
}

export interface NestedSectionSelectionControls {
  active: SectionSelectionControls;
  hidden: SectionSelectionControls;
}

export interface NestedBulkActionFocusRefs {
  active: BulkActionFocusRefs;
  hidden: BulkActionFocusRefs;
}

export interface ActiveDragControls {
  draggedWordId: string | null;
  dropTargetWordId: string | null;
  startWordDrag: (wordId: string) => void;
  dropWord: (wordId: string) => void;
  setDragTarget: (wordId: string | null) => void;
  clear: () => void;
}
