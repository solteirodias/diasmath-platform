import type {
  Orientation,
  QuadraticCoefficients,
  TileKind,
  TileSign,
  TileSnapshot
} from "../types";
import { createId } from "../core/Id";
import { tileSize } from "../engine/TileMetrics";

export function createTile(
  kind: TileKind,
  sign: TileSign,
  x: number,
  y: number,
  orientation: Orientation = 0
): TileSnapshot {
  const size = tileSize(kind, orientation);

  return {
    id: createId(kind),
    kind,
    sign,
    orientation,
    x,
    y,
    width: size.width,
    height: size.height,
    selected: false,
    locked: false
  };
}

export function coefficientsToTiles(
  coefficients: QuadraticCoefficients
): TileSnapshot[] {
  const tiles: TileSnapshot[] = [];

  append(tiles, "x2", coefficients.a);
  append(tiles, "x", coefficients.b);
  append(tiles, "unit", coefficients.c);

  return tiles;
}

function append(
  target: TileSnapshot[],
  kind: TileKind,
  coefficient: number
): void {
  const sign: TileSign = coefficient < 0 ? -1 : 1;

  for (let index = 0; index < Math.abs(coefficient); index += 1) {
    target.push(createTile(kind, sign, 0, 0));
  }
}
