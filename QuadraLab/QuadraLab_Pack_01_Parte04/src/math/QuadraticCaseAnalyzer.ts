import type { QuadraticCoefficients } from "../types";
import { completeSquare, type CompletedSquare } from "./CompletingSquare";
import {
  factorQuadratic,
  type QuadraticFactorization
} from "./QuadraticFactorization";

export interface QuadraticAnalysis {
  coefficients: QuadraticCoefficients;
  factorization: QuadraticFactorization;
  completedSquare: CompletedSquare;
  rootCase: "two-real" | "one-real" | "no-real";
}

export function analyzeQuadratic(
  coefficients: QuadraticCoefficients
): QuadraticAnalysis {
  const factorization = factorQuadratic(coefficients);
  const completedSquare = completeSquare(coefficients);

  return {
    coefficients,
    factorization,
    completedSquare,
    rootCase: completedSquare.classification
  };
}
