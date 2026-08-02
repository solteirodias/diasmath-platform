import { describe, expect, it } from "vitest";
import { factorQuadratic } from "../src/math/QuadraticFactorization";
import { buildAreaDecomposition } from "../src/math/AreaDecomposition";

describe("buildAreaDecomposition", () => {
  it("gera quatro áreas que recompõem o trinômio", () => {
    const factorization = factorQuadratic({ a: 2, b: 7, c: 3 });

    if (factorization.kind !== "factorable") {
      throw new Error("A equação deveria ser fatorável.");
    }

    const decomposition = buildAreaDecomposition(factorization);
    const sumX = decomposition.cells
      .filter((cell) => cell.term === "x")
      .reduce((total, cell) => total + cell.coefficient, 0);

    expect(decomposition.cells[0].coefficient).toBe(2);
    expect(sumX).toBe(7);
    expect(decomposition.cells[3].coefficient).toBe(3);
  });
});
