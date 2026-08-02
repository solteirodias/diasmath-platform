import type { BoardSnapshot, Point, TileSnapshot } from "../types";

export interface BoardEvents {
  changed: BoardSnapshot;
  selectionChanged: TileSnapshot[];
  pointerMoved: Point;
  message: string;
}
