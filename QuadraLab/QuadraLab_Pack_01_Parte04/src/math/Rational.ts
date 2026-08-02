export class Rational {
  readonly numerator: number;
  readonly denominator: number;

  constructor(numerator: number, denominator = 1) {
    if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
      throw new Error("Rational aceita apenas números inteiros.");
    }

    if (denominator === 0) {
      throw new Error("O denominador não pode ser zero.");
    }

    const sign = denominator < 0 ? -1 : 1;
    const divisor = gcd(Math.abs(numerator), Math.abs(denominator));

    this.numerator = sign * (numerator / divisor);
    this.denominator = Math.abs(denominator) / divisor;
  }

  add(other: Rational): Rational {
    return new Rational(
      this.numerator * other.denominator + other.numerator * this.denominator,
      this.denominator * other.denominator
    );
  }

  subtract(other: Rational): Rational {
    return new Rational(
      this.numerator * other.denominator - other.numerator * this.denominator,
      this.denominator * other.denominator
    );
  }

  multiply(other: Rational): Rational {
    return new Rational(
      this.numerator * other.numerator,
      this.denominator * other.denominator
    );
  }

  divide(other: Rational): Rational {
    return new Rational(
      this.numerator * other.denominator,
      this.denominator * other.numerator
    );
  }

  negate(): Rational {
    return new Rational(-this.numerator, this.denominator);
  }

  square(): Rational {
    return new Rational(
      this.numerator * this.numerator,
      this.denominator * this.denominator
    );
  }

  equals(other: Rational): boolean {
    return (
      this.numerator === other.numerator &&
      this.denominator === other.denominator
    );
  }

  isZero(): boolean {
    return this.numerator === 0;
  }

  sign(): -1 | 0 | 1 {
    if (this.numerator === 0) return 0;
    return this.numerator > 0 ? 1 : -1;
  }

  toNumber(): number {
    return this.numerator / this.denominator;
  }

  toString(): string {
    return this.denominator === 1
      ? String(this.numerator)
      : `${this.numerator}/${this.denominator}`;
  }

  toTeX(): string {
    return this.denominator === 1
      ? String(this.numerator)
      : `\\frac{${this.numerator}}{${this.denominator}}`;
  }
}

function gcd(a: number, b: number): number {
  let x = a;
  let y = b;

  while (y !== 0) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }

  return x || 1;
}
