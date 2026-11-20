import {
  angularHalfGapDeg,
  describeDonutSector,
  describeOpenDonutSector,
  fontSizeForLabel,
  polarToCartesian,
} from './math.utils';

describe('fontSizeForLabel', () => {
  it('keeps the base size for a one-character label', () => {
    expect(fontSizeForLabel('A', 100)).toBe(100);
  });

  it('shrinks as the text gets longer', () => {
    expect(fontSizeForLabel('F5', 100)).toBe(80);
    expect(fontSizeForLabel('Tab', 100)).toBe(60);
    expect(fontSizeForLabel('Ctrl', 100)).toBe(60);
    expect(fontSizeForLabel('Shift', 100)).toBe(45);
  });

  it('scales with the base size', () => {
    expect(fontSizeForLabel('Shift', 20)).toBe(9);
  });

  it('treats an empty label like a one-character one', () => {
    expect(fontSizeForLabel('', 100)).toBe(100);
  });
});

describe('polarToCartesian', () => {
  it('measures angles from the positive x axis, turning toward positive y', () => {
    const east = polarToCartesian(10, 20, 5, 0);
    expect(east.x).toBeCloseTo(15);
    expect(east.y).toBeCloseTo(20);
    const south = polarToCartesian(10, 20, 5, 90);
    expect(south.x).toBeCloseTo(10);
    expect(south.y).toBeCloseTo(25);
    const west = polarToCartesian(10, 20, 5, 180);
    expect(west.x).toBeCloseTo(5);
    expect(west.y).toBeCloseTo(20);
  });

  it('stays at the centre for a zero radius', () => {
    expect(polarToCartesian(3, 4, 0, 123)).toEqual({ x: 3, y: 4 });
  });
});

describe('describeDonutSector', () => {
  it('draws a closed path: inner start, outer start, outer arc, inner end, inner arc back', () => {
    const path = describeDonutSector(0, 0, 10, 20, 0, 90);
    const [m, l1, a1, l2, a2, z] = path.split(/ (?=[MLAZ])/);
    expect(m).toMatch(/^M 10 0$/);
    expect(l1).toMatch(/^L 20 0$/);
    expect(a1).toMatch(/^A 20 20 0 0 1 /);
    expect(l2.startsWith('L ')).toBeTrue();
    expect(l2.endsWith(' 10')).toBeTrue();
    expect(a2).toMatch(/^A 10 10 0 0 0 10 0$/);
    expect(z).toBe('Z');
  });

  it('ends its outer arc at the end angle', () => {
    const path = describeDonutSector(0, 0, 10, 20, 0, 90);
    const arc = path.split(/ (?=[MLAZ])/)[2].split(' ');
    expect(Number(arc[6])).toBeCloseTo(0);
    expect(Number(arc[7])).toBeCloseTo(20);
  });
});

describe('describeOpenDonutSector', () => {
  it('has no closing command and no start-side edge', () => {
    const path = describeOpenDonutSector(0, 0, 10, 20, 0, 90, 0, 90);
    expect(path).not.toContain('Z');
    expect(path.split(/ (?=[MLAZ])/).map((p) => p[0])).toEqual([
      'M',
      'A',
      'L',
      'A',
    ]);
  });

  it('uses its own start and end angles for the inner and outer arcs', () => {
    const path = describeOpenDonutSector(0, 0, 10, 20, 10, 80, 30, 60);
    const [m, , l, a2] = path.split(/ (?=[MLAZ])/);
    const inner = polarToCartesian(0, 0, 10, 10);
    expect(Number(m.split(' ')[1])).toBeCloseTo(inner.x);
    expect(Number(m.split(' ')[2])).toBeCloseTo(inner.y);
    const outerEnd = polarToCartesian(0, 0, 20, 60);
    expect(Number(l.split(' ')[1])).toBeCloseTo(outerEnd.x);
    expect(Number(l.split(' ')[2])).toBeCloseTo(outerEnd.y);
    const outerStart = polarToCartesian(0, 0, 20, 30);
    expect(Number(a2.split(' ')[6])).toBeCloseTo(outerStart.x);
    expect(Number(a2.split(' ')[7])).toBeCloseTo(outerStart.y);
  });
});

describe('angularHalfGapDeg', () => {
  it('is larger at a smaller radius for the same gap width', () => {
    expect(angularHalfGapDeg(50, 4)).toBeGreaterThan(angularHalfGapDeg(100, 4));
  });

  it('matches asin(gap / 2 * sqrt 2 / r) in degrees', () => {
    expect(angularHalfGapDeg(100, 10)).toBeCloseTo(
      (Math.asin((5 * Math.SQRT2) / 100) * 180) / Math.PI,
      10,
    );
  });

  it('is zero without a gap', () => {
    expect(angularHalfGapDeg(100, 0)).toBe(0);
  });
});
