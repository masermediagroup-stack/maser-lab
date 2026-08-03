import type { ProjectSnapshot } from "./types";

const MAX_HISTORY = 60;

export type HistoryStack = {
  past: ProjectSnapshot[];
  present: ProjectSnapshot;
  future: ProjectSnapshot[];
};

export function createHistory(present: ProjectSnapshot): HistoryStack {
  return { past: [], present, future: [] };
}

export function pushHistory(
  stack: HistoryStack,
  next: ProjectSnapshot,
): HistoryStack {
  // Skip no-ops (same JSON) to avoid flooding while dragging.
  if (JSON.stringify(stack.present) === JSON.stringify(next)) {
    return stack;
  }
  return {
    past: [...stack.past, stack.present].slice(-MAX_HISTORY),
    present: next,
    future: [],
  };
}

export function undoHistory(stack: HistoryStack): HistoryStack {
  if (stack.past.length === 0) return stack;
  const previous = stack.past[stack.past.length - 1]!;
  return {
    past: stack.past.slice(0, -1),
    present: previous,
    future: [stack.present, ...stack.future],
  };
}

export function redoHistory(stack: HistoryStack): HistoryStack {
  if (stack.future.length === 0) return stack;
  const [next, ...rest] = stack.future;
  return {
    past: [...stack.past, stack.present],
    present: next!,
    future: rest,
  };
}

export function canUndo(stack: HistoryStack): boolean {
  return stack.past.length > 0;
}

export function canRedo(stack: HistoryStack): boolean {
  return stack.future.length > 0;
}
