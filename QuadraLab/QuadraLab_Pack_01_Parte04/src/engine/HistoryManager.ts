import type { BoardSnapshot } from "../types";

export class HistoryManager {
  private undoStack: BoardSnapshot[] = [];
  private redoStack: BoardSnapshot[] = [];

  constructor(private readonly limit = 60) {}

  push(snapshot: BoardSnapshot): void {
    this.undoStack.push(structuredClone(snapshot));

    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }

    this.redoStack = [];
  }

  undo(current: BoardSnapshot): BoardSnapshot | null {
    const previous = this.undoStack.pop();
    if (!previous) return null;

    this.redoStack.push(structuredClone(current));
    return structuredClone(previous);
  }

  redo(current: BoardSnapshot): BoardSnapshot | null {
    const next = this.redoStack.pop();
    if (!next) return null;

    this.undoStack.push(structuredClone(current));
    return structuredClone(next);
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
