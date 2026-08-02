import type { Rect, TileSnapshot } from "../types";
import { rectsOverlap } from "./Geometry";

export class CollisionEngine {
  collides(
    candidate: Rect,
    tiles: TileSnapshot[],
    ignoredIds: ReadonlySet<string>
  ): boolean {
    return tiles.some((tile) => {
      if (ignoredIds.has(tile.id)) return false;
      return rectsOverlap(candidate, tile);
    });
  }
}
