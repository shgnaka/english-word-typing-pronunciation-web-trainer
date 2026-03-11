import { useState } from "react";
import type { TrainerState } from "../../../features/trainer/useTrainer";
import type { ActiveDragControls } from "../shared";

export function useWordsPanelDrag(trainer: TrainerState): ActiveDragControls {
  const [draggedWordId, setDraggedWordId] = useState<string | null>(null);
  const [dropTargetWordId, setDropTargetWordId] = useState<string | null>(null);
  const lastActiveWordIndex = trainer.activeWords.length - 1;

  function startWordDrag(wordId: string) {
    setDraggedWordId(wordId);
    setDropTargetWordId(wordId);
  }

  function dropWord(targetWordId: string) {
    if (!draggedWordId || draggedWordId === targetWordId) {
      setDraggedWordId(null);
      setDropTargetWordId(null);
      return;
    }

    const targetIndex = trainer.activeWords.findIndex((word) => word.id === targetWordId);
    if (targetIndex !== -1) {
      trainer.moveWordToIndex(draggedWordId, targetIndex);
    }

    setDraggedWordId(null);
    setDropTargetWordId(null);
  }

  function clear() {
    setDraggedWordId(null);
    setDropTargetWordId(null);
  }

  function handleTouchMove(clientX: number, clientY: number) {
    if (!draggedWordId) {
      return;
    }

    const target = document.elementFromPoint(clientX, clientY);
    const row = target instanceof Element ? target.closest<HTMLElement>("[data-testid='active-word-row']") : null;
    const targetWordId = row?.dataset.wordId ?? null;

    if (targetWordId && targetWordId !== draggedWordId) {
      setDropTargetWordId(targetWordId);
    }
  }

  return {
    lastActiveWordIndex,
    draggedWordId,
    dropTargetWordId,
    startWordDrag,
    dropWord,
    setDragTarget: setDropTargetWordId,
    handleTouchMove,
    clear
  };
}
