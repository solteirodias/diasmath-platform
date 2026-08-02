import type { Point, TileSnapshot } from "../types";
import type { BoardModel } from "./BoardModel";
import { FactorRectangleOverlay } from "./FactorRectangleOverlay";
import type { FactorableQuadratic } from "../math/QuadraticFactorization";

const PALETTE = {
  positive: {
    x2: ["#26c6da", "#0b7b8d"],
    x: ["#66bb6a", "#2d7d32"],
    unit: ["#ffd54f", "#a87900"]
  },
  negative: {
    x2: ["#ef5350", "#9d1d1a"],
    x: ["#ab47bc", "#6b1c78"],
    unit: ["#ff8a65", "#a33c1f"]
  }
} as const;

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private pointer: Point | null = null;
  private readonly factorOverlay = new FactorRectangleOverlay();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly board: BoardModel
  ) {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas 2D indisponível.");
    }

    this.context = context;
  }

  setPointer(pointer: Point | null): void {
    this.pointer = pointer;
  }

  setFactorization(factorization: FactorableQuadratic | null): void {
    this.factorOverlay.setFactorization(factorization);
  }

  resize(width: number, height: number, dpr = window.devicePixelRatio || 1): void {
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render(): void {
    const { context } = this;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    context.clearRect(0, 0, width, height);
    this.drawBackground(width, height);

    this.board.allTiles.forEach((tile) => {
      this.drawTile(tile);
    });

    this.factorOverlay.draw(context, width, height);

    if (this.pointer) {
      context.save();
      context.fillStyle = "rgba(255,255,255,.7)";
      context.beginPath();
      context.arc(this.pointer.x, this.pointer.y, 2, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }

  private drawBackground(width: number, height: number): void {
    const { context } = this;
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#0a1525");
    gradient.addColorStop(0.55, "#0b1b2f");
    gradient.addColorStop(1, "#101d35");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const grid = this.board.snap.gridSize;
    context.strokeStyle = "rgba(131, 184, 222, .08)";
    context.lineWidth = 1;

    for (let x = 0; x <= width; x += grid) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    for (let y = 0; y <= height; y += grid) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
  }

  private drawTile(tile: TileSnapshot): void {
    const { context } = this;
    const colors =
      tile.sign === 1 ? PALETTE.positive[tile.kind] : PALETTE.negative[tile.kind];

    context.save();
    context.translate(tile.x, tile.y);

    const gradient = context.createLinearGradient(0, 0, tile.width, tile.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    context.shadowColor = tile.selected
      ? "rgba(91, 220, 255, .95)"
      : "rgba(0,0,0,.35)";
    context.shadowBlur = tile.selected ? 22 : 12;
    context.shadowOffsetY = 7;

    roundedRect(context, 0, 0, tile.width, tile.height, 10);
    context.fillStyle = gradient;
    context.fill();

    context.shadowColor = "transparent";
    context.lineWidth = tile.selected ? 4 : 2;
    context.strokeStyle = tile.selected
      ? "#e7fbff"
      : "rgba(255,255,255,.35)";
    context.stroke();

    context.fillStyle = "rgba(255,255,255,.94)";
    context.font = `${tile.kind === "unit" ? 14 : 20}px ui-rounded, system-ui`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      `${tile.sign === -1 ? "−" : ""}${labelFor(tile)}`,
      tile.width / 2,
      tile.height / 2
    );

    if (tile.locked) {
      context.fillStyle = "rgba(0,0,0,.45)";
      context.beginPath();
      context.arc(tile.width - 14, 14, 9, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#fff";
      context.font = "11px system-ui";
      context.fillText("●", tile.width - 14, 14);
    }

    context.restore();
  }
}

function labelFor(tile: TileSnapshot): string {
  if (tile.kind === "x2") return "x²";
  if (tile.kind === "x") return "x";
  return "1";
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}
