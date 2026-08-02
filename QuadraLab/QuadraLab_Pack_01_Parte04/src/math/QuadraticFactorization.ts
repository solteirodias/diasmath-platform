import type { QuadraticCoefficients } from "../types";
import { integerProductPairs } from "./IntegerFactors";
import { Rational } from "./Rational";

export interface LinearFactor {
  x: number;
  constant: number;
}

export interface FactorableQuadratic {
  kind: "factorable";
  left: LinearFactor;
  right: LinearFactor;
  roots: [Rational, Rational];
  repeatedRoot: boolean;
  middleSplit: [number, number];
}

export interface NonFactorableQuadratic {
  kind: "not-factorable-over-integers";
}

export type QuadraticFactorization =
  | FactorableQuadratic
  | NonFactorableQuadratic;

export function factorQuadratic(
  coefficients: QuadraticCoefficients
): QuadraticFactorization {
  const { a, b, c } = coefficients;

  if (c === 0) {
    const left: LinearFactor = { x: 1, constant: 0 };
    const right: LinearFactor = { x: a, constant: b };
    const roots: [Rational, Rational] = [
      new Rational(0),
      new Rational(-b, a)
    ];

    return {
      kind: "factorable",
      left,
      right,
      roots,
      repeatedRoot: roots[0].equals(roots[1]),
      middleSplit: [0, b]
    };
  }

  const leadingPairs = integerProductPairs(a);
  const constantPairs = integerProductPairs(c);

  for (const [p, r] of leadingPairs) {
    for (const [q, s] of constantPairs) {
      if (p * s + q * r !== b) continue;

      const normalized = normalizeFactors(
        { x: p, constant: q },
        { x: r, constant: s }
      );

      const roots: [Rational, Rational] = [
        new Rational(-normalized.left.constant, normalized.left.x),
        new Rational(-normalized.right.constant, normalized.right.x)
      ];

      return {
        kind: "factorable",
        left: normalized.left,
        right: normalized.right,
        roots,
        repeatedRoot: roots[0].equals(roots[1]),
        middleSplit: [
          normalized.left.x * normalized.right.constant,
          normalized.left.constant * normalized.right.x
        ]
      };
    }
  }

  return { kind: "not-factorable-over-integers" };
}

export function formatLinearFactor(factor: LinearFactor): string {
  const xPart =
    factor.x === 1 ? "x" : factor.x === -1 ? "−x" : `${factor.x}x`;

  if (factor.constant === 0) {
    return xPart;
  }

  const sign = factor.constant > 0 ? "+" : "−";
  return `${xPart} ${sign} ${Math.abs(factor.constant)}`;
}

export function formatFactorization(result: FactorableQuadratic): string {
  return `(${formatLinearFactor(result.left)})(${formatLinearFactor(
    result.right
  )}) = 0`;
}

function normalizeFactors(
  left: LinearFactor,
  right: LinearFactor
): { left: LinearFactor; right: LinearFactor } {
  let first = { ...left };
  let second = { ...right };

  if (first.x < 0 && second.x < 0) {
    first = { x: -first.x, constant: -first.constant };
    second = { x: -second.x, constant: -second.constant };
  }

  const firstWeight = Math.abs(first.x) * 1000 + Math.abs(first.constant);
  const secondWeight = Math.abs(second.x) * 1000 + Math.abs(second.constant);

  return firstWeight >= secondWeight
    ? { left: first, right: second }
    : { left: second, right: first };
}
