import { describe, expect, it } from "vitest";
import { completeSquare } from "../src/math/CompletingSquare";

describe("completeSquare", () => {
  it("classifica duas raízes reais", () => {
    expect(
      completeSquare({ a: 1, b: 5, c: 6 }).classification
    ).toBe("two-real");
  });

  it("classifica uma raiz real", () => {
    expect(
      completeSquare({ a: 1, b: 4, c: 4 }).classification
    ).toBe("one-real");
  });

  it("classifica nenhuma raiz real", () => {
    expect(
      completeSquare({ a: 1, b: 2, c: 5 }).classification
    ).toBe("no-real");
  });

  it("classifica caso sem raiz com a diferente de 1", () => {
    expect(
      completeSquare({ a: 2, b: 4, c: 7 }).classification
    ).toBe("no-real");
  });
});
