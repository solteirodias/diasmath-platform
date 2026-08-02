import { describe, expect, it } from "vitest";
import { formatQuadratic } from "../src/math/EquationFormatter";

describe("formatQuadratic", () => {
  it("formata sinais e coeficientes unitários", () => {
    expect(formatQuadratic({ a: 1, b: -5, c: 6 })).toBe(
      "x² − 5x + 6 = 0"
    );
  });

  it("formata coeficiente principal negativo", () => {
    expect(formatQuadratic({ a: -1, b: 0, c: 4 })).toBe("-x² + 4 = 0");
  });
});
