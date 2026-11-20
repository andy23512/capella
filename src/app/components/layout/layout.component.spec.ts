import { TestBed } from '@angular/core/testing';
import { POSITION_CODE_LAYOUT } from 'tangent-cc-lib';
import { DeviceLayoutService } from '../../services/device-layout.service';
import { resolveCharacterKeyPosition } from '../../utils/key-position.utils';
import { LayoutComponent } from './layout.component';

describe('LayoutComponent', () => {
  let layouts: DeviceLayoutService;

  beforeEach(() => {
    layouts = TestBed.inject(DeviceLayoutService);
    layouts.setDeviceLayoutId('cc1-cc2-ccu');
  });
  afterEach(() => {
    layouts.setDeviceLayoutId('cc1-cc2-ccu');
    localStorage.clear();
  });

  function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(LayoutComponent);
    for (const [k, v] of Object.entries(inputs)) {
      fixture.componentRef.setInput(k, v);
    }
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const root = (f: F) => f.nativeElement as HTMLElement;
  const svg = (f: F) => root(f).querySelector('svg')!;
  const switches = (f: F) =>
    Array.from(root(f).querySelectorAll('g[appGridSwitch]'));
  const viewBox = (f: F) =>
    svg(f).getAttribute('viewBox')!.split(' ').map(Number);
  /** Centre of a switch, from its centre circle. */
  const centreOf = (g: Element) => {
    const c = g.querySelector(':scope > circle')!;
    return { x: Number(c.getAttribute('cx')), y: Number(c.getAttribute('cy')) };
  };

  describe('size', () => {
    it('is 2216 wide: ten 200-unit columns and nine 24-unit gaps', () => {
      const f = create();
      expect(viewBox(f)).toEqual([0, 0, 2216, 1096]);
    });

    it('is shorter on a layout without the third thumb switch', () => {
      layouts.setDeviceLayoutId('m4g');
      const f = create();
      expect(viewBox(f)).toEqual([0, 0, 2216, 872]);
    });

    it('keeps the proportions of the drawing for its box', () => {
      const f = create();
      const box = root(f).querySelector('div')!;
      expect(box.style.aspectRatio.replace(/\s/g, '')).toBe('2216/1096');
    });

    it('follows a change of device layout while it is shown', () => {
      const f = create();
      layouts.setDeviceLayoutId('m4g');
      f.detectChanges();
      expect(viewBox(f)[3]).toBe(872);
      expect(switches(f).length).toBe(16);
    });
  });

  describe('switches', () => {
    it('draws nine switches for each hand with the third thumb switch', () => {
      expect(switches(create()).length).toBe(18);
    });

    it('draws eight for each hand without it', () => {
      layouts.setDeviceLayoutId('m4g');
      expect(switches(create()).length).toBe(16);
    });

    it('leaves out only the third thumb switch without it, keeping the other two thumb rows', () => {
      layouts.setDeviceLayoutId('m4g');
      const rows = new Set(switches(create()).map((g) => centreOf(g).y));
      // rows are 224 apart from y = 100; the thumb rows are the 3rd, 4th and 5th
      expect(rows.has(100 + 2 * 224)).toBeTrue();
      expect(rows.has(100 + 3 * 224)).toBeTrue();
      expect(rows.has(100 + 4 * 224)).toBeFalse();
    });

    it('draws every switch at a different place', () => {
      const places = switches(create()).map((g) => {
        const { x, y } = centreOf(g);
        return `${x},${y}`;
      });
      expect(new Set(places).size).toBe(18);
    });

    it('mirrors the right hand around the middle', () => {
      const f = create();
      const all = switches(f).map(centreOf);
      const left = all.slice(0, 9);
      const right = all.slice(9);
      // left hand first (little to thumbEnd), then the right hand
      left.forEach((p, i) => {
        expect(right[i].x).toBeCloseTo(2216 - p.x);
        expect(right[i].y).toBeCloseTo(p.y);
      });
    });

    it('keeps the left hand on the left half and the right hand on the right half', () => {
      const all = switches(create()).map(centreOf);
      all.slice(0, 9).forEach((p) => expect(p.x).toBeLessThan(1108));
      all.slice(9).forEach((p) => expect(p.x).toBeGreaterThan(1108));
    });

    it('stays inside its drawing', () => {
      const f = create();
      const [, , w, h] = viewBox(f);
      for (const { x, y } of switches(f).map(centreOf)) {
        expect(x - 100).toBeGreaterThanOrEqual(0);
        expect(x + 100).toBeLessThanOrEqual(w);
        expect(y - 100).toBeGreaterThanOrEqual(0);
        expect(y + 100).toBeLessThanOrEqual(h);
      }
    });

    it('puts the little finger at the outer edge, and the thumbs toward the middle', () => {
      const all = switches(create()).map(centreOf);
      const [little, ring, ringMid, middle, middleMid, index, tip, mid, end] =
        all.slice(0, 9);
      expect(little.x).toBeLessThan(ring.x);
      expect(ring.x).toBeLessThan(middle.x);
      expect(middle.x).toBeLessThan(index.x);
      expect(ring.x).toBe(ringMid.x);
      expect(middle.x).toBe(middleMid.x);
      expect(ring.y).toBeLessThan(ringMid.y);
      expect(middle.y).toBeLessThan(middleMid.y);
      expect(tip.y).toBeLessThan(mid.y);
      expect(mid.y).toBeLessThan(end.y);
      expect(tip.x).toBeGreaterThan(mid.x);
      expect(mid.x).toBeGreaterThan(end.x);
      expect(index.y).toBeCloseTo((ring.y + ringMid.y) / 2);
      expect(little.y).toBeCloseTo((ring.y + ringMid.y) / 2);
    });

    it('leaves the same gap between neighbouring columns', () => {
      const all = switches(create()).map(centreOf);
      const [little, ring, , middle, , index] = all.slice(0, 9);
      expect(ring.x - little.x).toBe(224);
      expect(middle.x - ring.x).toBe(224);
      expect(index.x - middle.x).toBe(224);
    });
  });

  describe('highlight and labels', () => {
    const fillsLit = (f: F) =>
      root(f).querySelectorAll('.fill-capella-500, .fill-blue-400').length;
    const labelTexts = (f: F) =>
      Array.from(root(f).querySelectorAll('text')).map((t) =>
        t.textContent!.trim(),
      );

    it('shows no highlight and no label by default', () => {
      const f = create();
      expect(fillsLit(f)).toBe(0);
      expect(labelTexts(f)).toEqual([]);
    });

    it('lights exactly the switches of a highlight', () => {
      const highlight = resolveCharacterKeyPosition('A')!;
      const f = create({ highlight });
      expect(fillsLit(f)).toBe(highlight.positionCodes.length);
    });

    it('shows the labels it is given, once each', () => {
      const f = create({
        labels: { 61: { text: 'A' }, 31: { text: 'shift', icon: true } },
      });
      expect(labelTexts(f).sort()).toEqual(['A', 'shift']);
    });

    it('lights the switch of the right hand the code belongs to', () => {
      const code = POSITION_CODE_LAYOUT.right.index.c;
      const f = create({
        highlight: {
          ...resolveCharacterKeyPosition('a')!,
          characterKeyPositionCode: code,
          positionCodes: [code],
        },
      });
      const lit = switches(f).filter((g) =>
        g.querySelector('circle.fill-capella-500'),
      );
      expect(lit.length).toBe(1);
      expect(centreOf(lit[0]).x).toBeGreaterThan(1108);
    });
  });
});
