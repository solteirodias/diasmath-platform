import type { FactorableQuadratic } from "./QuadraticFactorization";

export interface AreaCell {
  label: string;
  coefficient: number;
  term: "x2" | "x" | "unit";
  row: 0 | 1;
  column: 0 | 1;
}

export interface AreaDecomposition {
  widthLabel: string;
  heightLabel: string;
  cells: [AreaCell, AreaCell, AreaCell, AreaCell];
}

export function buildAreaDecomposition(
  factorization: FactorableQuadratic
): AreaDecomposition {
  const { left, right } = factorization;

  return {
    widthLabel: factorLabel(right.x, right.constant),
    heightLabel: factorLabel(left.x, left.constant),
    cells: [
      cell(left.x * right.x, "x2", 0, 0),
      cell(left.x * right.constant, "x", 0, 1),
      cell(left.constant * right.x, "x", 1, 0),
      cell(left.constant * right.constant, "unit", 1, 1)
    ]
  };
}

function cell(
  coefficient: number,
  term: AreaCell["term"],
  row: AreaCell["row"],
  column: AreaCell["column"]
): AreaCell {
  const variable = term === "x2" ? "x²" : term === "x" ? "x" : "";

  return {
    label: `${coefficient}${variable}`,
    coefficient,
    term,
    row,
    column
  };
}

function factorLabel(x: number, constant: number): string {
  const xLabel = x === 1 ? "x" : x === -1 ? "−x" : `${x}x`;

  if (constant === 0) return xLabel;

  return `${xLabel} ${constant > 0 ? "+" : "−"} ${Math.abs(constant)}`;
}
