import type { BoardModel } from "./BoardModel";

export class KeyboardController {
  constructor(private readonly board: BoardModel) {
    window.addEventListener("keydown", this.onKeyDown);
  }

  destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement | null;

    if (
      target?.tagName === "INPUT" ||
      target?.tagName === "TEXTAREA" ||
      target?.isContentEditable
    ) {
      return;
    }

    const modifier = event.ctrlKey || event.metaKey;

    if (modifier && event.key.toLowerCase() === "z") {
      event.preventDefault();
      event.shiftKey ? this.board.redo() : this.board.undo();
      return;
    }

    if (modifier && event.key.toLowerCase() === "y") {
      event.preventDefault();
      this.board.redo();
      return;
    }

    if (modifier && event.key.toLowerCase() === "d") {
      event.preventDefault();
      this.board.duplicateSelection();
      return;
    }

    switch (event.key) {
      case "Delete":
      case "Backspace":
        event.preventDefault();
        this.board.deleteSelection();
        break;
      case "r":
      case "R":
        this.board.rotateSelection();
        break;
      case "n":
      case "N":
        this.board.toggleSignSelection();
        break;
      case "Escape":
        this.board.clearSelection();
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.board.moveSelection({ x: -this.board.snap.gridSize, y: 0 });
        break;
      case "ArrowRight":
        event.preventDefault();
        this.board.moveSelection({ x: this.board.snap.gridSize, y: 0 });
        break;
      case "ArrowUp":
        event.preventDefault();
        this.board.moveSelection({ x: 0, y: -this.board.snap.gridSize });
        break;
      case "ArrowDown":
        event.preventDefault();
        this.board.moveSelection({ x: 0, y: this.board.snap.gridSize });
        break;
    }
  };
}
