import type { Point } from "../types";

export class SnapEngine {
  constructor(
    public gridSize = 18,
    public enabled = true
  ) {}

  snap(point: Point): Point {
    if (!this.enabled) return point;

    return {
      x: Math.round(point.x / this.gridSize) * this.gridSize,
      y: Math.round(point.y / this.gridSize) * this.gridSize
    };
  }
}
