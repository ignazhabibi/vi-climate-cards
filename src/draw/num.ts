// Number helpers for SVG markup. Coordinates are integers wherever possible;
// these cover the few places with fractions, so the markup stays short.
// Exact halves round to even, so a value on a .5 step does not drift up.

/** Integer division, rounding down. */
export const div = (a: number, b: number): number => Math.floor(a / b);

/** Rounds to the nearest integer, halves to even. */
export function roundEven(x: number): number {
  const r = Math.round(x);
  return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
}

/** `x` with `digits` decimals, halves to even (toFixed rounds them up). */
export function fixed(x: number, digits: number): string {
  const scale = 10 ** digits;
  const t = x * scale;
  if (Math.abs(t % 1) === 0.5 && t / scale === x) return (roundEven(t) / scale).toFixed(digits);
  return x.toFixed(digits);
}

/** Rounds to `digits` decimals, halves to even. */
export const roundTo = (x: number, digits: number): number => Number(fixed(x, digits));

/** Shortest form with at most `precision` significant digits: 698.88, 26, 1.11. */
export const g = (x: number, precision = 6): string => String(Number(x.toPrecision(precision)));
