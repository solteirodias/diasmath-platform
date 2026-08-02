export type TileKind = "x2" | "x" | "unit";
export type TileSign = 1 | -1;
export type Orientation = 0 | 90;

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export interface TileSnapshot {
  id: string;
  kind: TileKind;
  sign: TileSign;
  orientation: Orientation;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
  locked: boolean;
}

export interface BoardSnapshot {
  tiles: TileSnapshot[];
  gridSize: number;
  snappingEnabled: boolean;
}

export interface QuadraticCoefficients {
  a: number;
  b: number;
  c: number;
}

export interface ParsedEquation {
  original: string;
  normalized: string;
  coefficients: QuadraticCoefficients;
}
