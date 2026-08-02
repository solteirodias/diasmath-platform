import type { Point, TileSnapshot } from "../types";
import { pointInRect } from "./Geometry";

export function topTileAt(
  point: Point,
  tiles: TileSnapshot[]
): TileSnapshot | null {
  for (let index = tiles.length - 1; index >= 0; index -= 1) {
    const tile = tiles[index];
    if (pointInRect(point, tile)) return tile;
  }

  return null;
}
