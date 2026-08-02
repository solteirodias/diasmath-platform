import { describe, expect, it } from "vitest";
import { Rational } from "../src/math/Rational";

describe("Rational", () => {
  it("simplifica frações", () => {
    expect(new Rational(6, 8).toString()).toBe("3/4");
  });

  it("normaliza o sinal", () => {
    expect(new Rational(2, -4).toString()).toBe("-1/2");
  });

  it("soma e subtrai exatamente", () => {
    const half = new Rational(1, 2);
    const third = new Rational(1, 3);

    expect(half.add(third).toString()).toBe("5/6");
    expect(half.subtract(third).toString()).toBe("1/6");
  });
});
