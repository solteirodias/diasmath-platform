import type { Orientation, Size, TileKind } from "../types";

export const TILE_UNIT = 36;
export const TILE_X = 126;

export function tileSize(
  kind: TileKind,
  orientation: Orientation
): Size {
  if (kind === "x2") {
    return { width: TILE_X, height: TILE_X };
  }

  if (kind === "unit") {
    return { width: TILE_UNIT, height: TILE_UNIT };
  }

  return orientation === 90
    ? { width: TILE_UNIT, height: TILE_X }
    : { width: TILE_X, height: TILE_UNIT };
}
