import type { QuadraticCoefficients } from "../types";
import { Rational } from "./Rational";

export interface CompletedSquare {
  leading: number;
  shift: Rational;
  remainder: Rational;
  classification: "two-real" | "one-real" | "no-real";
}

export function completeSquare(
  coefficients: QuadraticCoefficients
): CompletedSquare {
  const { a, b, c } = coefficients;
  const shift = new Rational(b, 2 * a);
  const remainder = new Rational(c).subtract(
    new Rational(b * b, 4 * a)
  );

  let classification: CompletedSquare["classification"];

  if (remainder.isZero()) {
    classification = "one-real";
  } else {
    const neverReachesZero =
      (a > 0 && remainder.sign() > 0) ||
      (a < 0 && remainder.sign() < 0);

    classification = neverReachesZero ? "no-real" : "two-real";
  }

  return {
    leading: a,
    shift,
    remainder,
    classification
  };
}

export function formatCompletedSquare(result: CompletedSquare): string {
  const shiftSign = result.shift.sign() >= 0 ? "+" : "−";
  const shiftMagnitude = new Rational(
    Math.abs(result.shift.numerator),
    result.shift.denominator
  ).toString();
  const leading =
    result.leading === 1
      ? ""
      : result.leading === -1
        ? "−"
        : String(result.leading);

  const remainder =
    result.remainder.sign() >= 0
      ? ` + ${result.remainder.toString()}`
      : ` − ${result.remainder.negate().toString()}`;

  return `${leading}(x ${shiftSign} ${shiftMagnitude})²${remainder}`;
}
