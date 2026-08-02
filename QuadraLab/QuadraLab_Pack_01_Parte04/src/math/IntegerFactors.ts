export function positiveDivisors(value: number): number[] {
  const absolute = Math.abs(value);

  if (!Number.isInteger(absolute) || absolute === 0) {
    return [];
  }

  const divisors = new Set<number>();

  for (let candidate = 1; candidate * candidate <= absolute; candidate += 1) {
    if (absolute % candidate !== 0) continue;
    divisors.add(candidate);
    divisors.add(absolute / candidate);
  }

  return [...divisors].sort((a, b) => a - b);
}

export function signedDivisors(value: number): number[] {
  return positiveDivisors(value).flatMap((divisor) => [divisor, -divisor]);
}

export function integerProductPairs(value: number): Array<[number, number]> {
  if (value === 0) {
    return [[0, 1], [1, 0], [0, -1], [-1, 0]];
  }

  return signedDivisors(value).map((left) => [left, value / left]);
}
