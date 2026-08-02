import type { Point } from "../types";
import type { BoardModel } from "./BoardModel";
import type { CanvasRenderer } from "./CanvasRenderer";
import { topTileAt } from "./HitTest";

export class InteractionController {
  private dragging = false;
  private lastPoint: Point | null = null;
  private moved = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly board: BoardModel,
    private readonly renderer: CanvasRenderer
  ) {
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerUp);
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  destroy(): void {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    const point = this.toLocalPoint(event);
    const hit = topTileAt(point, [...this.board.allTiles]);

    this.canvas.setPointerCapture(event.pointerId);
    this.lastPoint = point;
    this.moved = false;

    if (!hit) {
      if (!event.shiftKey) this.board.clearSelection();
      return;
    }

    if (event.shiftKey) {
      this.board.toggleSelection(hit.id);
    } else if (!hit.selected) {
      this.board.selectOnly(hit.id);
    }

    this.board.bringToFront(hit.id);

    if (!hit.locked) {
      this.board.commit();
      this.dragging = true;
    }
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const point = this.toLocalPoint(event);
    this.renderer.setPointer(point);

    if (!this.dragging || !this.lastPoint) return;

    const delta = {
      x: point.x - this.lastPoint.x,
      y: point.y - this.lastPoint.y
    };

    if (Math.abs(delta.x) + Math.abs(delta.y) > 1) {
      this.moved = true;
    }

    this.board.moveSelection(delta);
    this.lastPoint = point;
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }

    this.dragging = false;
    this.lastPoint = null;

    if (!this.moved) {
      this.renderer.setPointer(this.toLocalPoint(event));
    }
  };

  private toLocalPoint(event: PointerEvent): Point {
    const bounds = this.canvas.getBoundingClientRect();

    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    };
  }
}
