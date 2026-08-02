import type { QuadraticCoefficients } from "../types";

export function formatQuadratic({
  a,
  b,
  c
}: QuadraticCoefficients): string {
  const terms: string[] = [];

  pushTerm(terms, a, "x²", true);
  pushTerm(terms, b, "x", false);
  pushTerm(terms, c, "", false);

  return `${terms.join(" ")} = 0`;
}

function pushTerm(
  terms: string[],
  coefficient: number,
  variable: string,
  first: boolean
): void {
  if (coefficient === 0) return;

  const negative = coefficient < 0;
  const absolute = Math.abs(coefficient);
  const magnitude = absolute === 1 && variable ? "" : String(absolute);
  const body = `${magnitude}${variable}`;

  if (first) {
    terms.push(negative ? `-${body}` : body);
  } else {
    terms.push(`${negative ? "−" : "+"} ${body}`);
  }
}
