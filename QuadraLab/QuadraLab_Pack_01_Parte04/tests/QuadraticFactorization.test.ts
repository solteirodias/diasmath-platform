import { describe, expect, it } from "vitest";
import {
  factorQuadratic,
  formatFactorization
} from "../src/math/QuadraticFactorization";

describe("factorQuadratic", () => {
  it("fatora a = 1", () => {
    const result = factorQuadratic({ a: 1, b: 5, c: 6 });

    expect(result.kind).toBe("factorable");

    if (result.kind === "factorable") {
      expect(result.roots.map((root) => root.toString()).sort()).toEqual([
        "-2",
        "-3"
      ]);
    }
  });

  it("fatora a diferente de 1", () => {
    const result = factorQuadratic({ a: 2, b: 7, c: 3 });

    expect(result.kind).toBe("factorable");

    if (result.kind === "factorable") {
      expect(formatFactorization(result)).toContain("= 0");
      expect(result.roots.map((root) => root.toString()).sort()).toEqual([
        "-1/2",
        "-3"
      ]);
    }
  });

  it("reconhece quando não há fatoração inteira", () => {
    expect(factorQuadratic({ a: 1, b: 2, c: 5 }).kind).toBe(
      "not-factorable-over-integers"
    );
  });
});
