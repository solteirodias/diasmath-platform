import { describe, expect, it } from "vitest";
import { parseQuadraticEquation } from "../src/math/QuadraticEquationParser";

describe("parseQuadraticEquation", () => {
  it("interpreta coeficiente a implícito", () => {
    expect(parseQuadraticEquation("x² + 5x + 6 = 0").coefficients).toEqual({
      a: 1,
      b: 5,
      c: 6
    });
  });

  it("interpreta a diferente de 1", () => {
    expect(parseQuadraticEquation("2x^2 + 7x + 3 = 0").coefficients).toEqual({
      a: 2,
      b: 7,
      c: 3
    });
  });

  it("move os termos da direita para a esquerda", () => {
    expect(parseQuadraticEquation("x² = 4").coefficients).toEqual({
      a: 1,
      b: 0,
      c: -4
    });
  });
});
