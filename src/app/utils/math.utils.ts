export interface Point {
  x: number;
  y: number;
}

/** Shrinks a label's font size as its text gets longer, so short labels (e.g. "A") stay large and longer ones (e.g. "SHIFT") still fit their switch sector. */
export function fontSizeForLabel(text: string, base: number): number {
  if (text.length > 4) {
    return base * 0.45;
  }
  if (text.length > 2) {
    return base * 0.6;
  }
  if (text.length > 1) {
    return base * 0.8;
  }
  return base;
}

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): Point {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG path for an annular (donut) sector between angles [startAngle, endAngle], both < 180deg apart. */
export function describeDonutSector(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  startAngle: number,
  endAngle: number,
): string {
  const outerStart = polarToCartesian(cx, cy, r2, startAngle);
  const outerEnd = polarToCartesian(cx, cy, r2, endAngle);
  const innerStart = polarToCartesian(cx, cy, r1, startAngle);
  const innerEnd = polarToCartesian(cx, cy, r1, endAngle);
  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${r2} ${r2} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${r1} ${r1} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

/**
 * SVG path for an annular (donut) sector, like {@link describeDonutSector},
 * but with only the end-angle-side radial edge drawn — the start-angle side
 * is left open. Adjacent sectors each draw one shared boundary this way
 * instead of both drawing it, halving redundant lines when stroked (fill
 * still renders the full wedge, since SVG auto-closes unclosed subpaths for
 * filling).
 *
 * The inner and outer arcs take separate angle ranges so the gap between
 * neighboring sectors can be inset by a different angle at each radius —
 * see {@link angularHalfGapDeg}.
 */
export function describeOpenDonutSector(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  innerStartAngle: number,
  innerEndAngle: number,
  outerStartAngle: number,
  outerEndAngle: number,
): string {
  const outerStart = polarToCartesian(cx, cy, r2, outerStartAngle);
  const outerEnd = polarToCartesian(cx, cy, r2, outerEndAngle);
  const innerStart = polarToCartesian(cx, cy, r1, innerStartAngle);
  const innerEnd = polarToCartesian(cx, cy, r1, innerEndAngle);
  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `A ${r1} ${r1} 0 0 1 ${innerEnd.x} ${innerEnd.y}`,
    `L ${outerEnd.x} ${outerEnd.y}`,
    `A ${r2} ${r2} 0 0 0 ${outerStart.x} ${outerStart.y}`,
  ].join(' ');
}

/**
 * Half-angle, in degrees, that a gap of fixed physical width `gapWidth`
 * subtends at radius `r` — so a donut sector's angular inset can be
 * computed per-radius to keep the gap's on-screen size constant between
 * its inner and outer edge, rather than widening at the outer radius the
 * way a single fixed angular inset would.
 */
export function angularHalfGapDeg(r: number, gapWidth: number): number {
  return (Math.asin(((gapWidth / 2) * Math.SQRT2) / r) / Math.PI) * 180;
}
