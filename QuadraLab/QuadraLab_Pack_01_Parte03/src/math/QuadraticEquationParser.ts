import type { ParsedEquation, QuadraticCoefficients } from "../types";

const SUPERSCRIPT_TWO = /²/g;

export class EquationParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EquationParseError";
  }
}

export function parseQuadraticEquation(input: string): ParsedEquation {
  const original = input.trim();

  if (!original) {
    throw new EquationParseError("Digite uma equação quadrática.");
  }

  const normalized = original
    .toLowerCase()
    .replace(SUPERSCRIPT_TWO, "^2")
    .replace(/\s+/g, "")
    .replace(/−/g, "-");

  const [left, right = "0", ...extra] = normalized.split("=");

  if (extra.length > 0) {
    throw new EquationParseError("Use apenas um sinal de igualdade.");
  }

  const leftCoefficients = parsePolynomial(left);
  const rightCoefficients = parsePolynomial(right);

  const coefficients: QuadraticCoefficients = {
    a: leftCoefficients.a - rightCoefficients.a,
    b: leftCoefficients.b - rightCoefficients.b,
    c: leftCoefficients.c - rightCoefficients.c
  };

  if (coefficients.a === 0) {
    throw new EquationParseError("A equação precisa possuir termo quadrático.");
  }

  if (![coefficients.a, coefficients.b, coefficients.c].every(Number.isInteger)) {
    throw new EquationParseError(
      "Nesta versão, use coeficientes inteiros para gerar as peças."
    );
  }

  return { original, normalized, coefficients };
}

function parsePolynomial(expression: string): QuadraticCoefficients {
  if (!expression || expression === "0") {
    return { a: 0, b: 0, c: 0 };
  }

  const terms = expression.replace(/-/g, "+-").split("+").filter(Boolean);
  const result: QuadraticCoefficients = { a: 0, b: 0, c: 0 };

  for (const term of terms) {
    if (term.includes("x^2")) {
      result.a += coefficientOf(term.replace("x^2", ""));
    } else if (term.includes("x")) {
      result.b += coefficientOf(term.replace("x", ""));
    } else {
      const value = Number(term);
      if (!Number.isFinite(value)) {
        throw new EquationParseError(`Termo inválido: ${term}`);
      }
      result.c += value;
    }
  }

  return result;
}

function coefficientOf(raw: string): number {
  if (raw === "" || raw === "+") return 1;
  if (raw === "-") return -1;

  const value = Number(raw);

  if (!Number.isFinite(value)) {
    throw new EquationParseError(`Coeficiente inválido: ${raw}`);
  }

  return value;
}
