import type { TileSnapshot } from "../types";

export function autoLayoutTiles(
  tiles: TileSnapshot[],
  startX = 48,
  startY = 48,
  gap = 14,
  maxWidth = 760
): TileSnapshot[] {
  let x = startX;
  let y = startY;
  let rowHeight = 0;

  return tiles.map((tile) => {
    if (x + tile.width > maxWidth && x > startX) {
      x = startX;
      y += rowHeight + gap;
      rowHeight = 0;
    }

    const positioned = { ...tile, x, y };
    x += tile.width + gap;
    rowHeight = Math.max(rowHeight, tile.height);

    return positioned;
  });
}
