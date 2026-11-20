import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightKeyCombination, Layer } from 'tangent-cc-lib';
import { PositionLabels } from '../../utils/key-position.utils';
import { GridSwitchComponent } from './grid-switch.component';

// center 10, n 11, e 12, s 13, w 14
const CODES = { c: 10, n: 11, e: 12, s: 13, w: 14 };

function highlight(
  character: number,
  held: number[] = [],
): HighlightKeyCombination {
  return {
    characterKeyPositionCode: character,
    layer: Layer.Primary,
    shiftKey: false,
    altGraphKey: false,
    positionCodes: [character, ...held],
    score: 0,
  };
}

@Component({
  imports: [GridSwitchComponent],
  template: `<svg>
    <g
      appGridSwitch
      [center]="{ x: 50, y: 60 }"
      [positionCodeMap]="codes"
      [highlight]="highlightValue"
      [labels]="labelsValue"
    ></g>
  </svg>`,
})
class HostComponent {
  codes = CODES;
  highlightValue: HighlightKeyCombination | null = null;
  labelsValue: PositionLabels = {};
}

describe('GridSwitchComponent', () => {
  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const root = (f: F) => f.nativeElement as HTMLElement;
  const sectors = (f: F) =>
    Array.from(root(f).querySelectorAll('g[appGridSwitchSector]'));
  /** The fill path of each sector: n, e, s, w. */
  const fills = (f: F) =>
    sectors(f).map((s) => s.querySelectorAll('path')[1] as SVGPathElement);
  const kind = (p: SVGPathElement) =>
    p.classList.contains('fill-capella-500')
      ? 'press'
      : p.classList.contains('fill-blue-400')
        ? 'hold'
        : null;
  const centre = (f: F) =>
    root(f).querySelector(
      ':scope > g > circle, :scope svg > g > circle',
    ) as SVGCircleElement;
  const centreText = (f: F) =>
    Array.from(
      root(f).querySelectorAll('g[appGridSwitch] > text'),
    ) as SVGTextElement[];

  it('draws four sectors and a centre circle', () => {
    const f = create();
    expect(sectors(f).length).toBe(4);
    const circle = centre(f);
    expect(circle.getAttribute('cx')).toBe('50');
    expect(circle.getAttribute('cy')).toBe('60');
    expect(circle.getAttribute('r')).toBe('37');
  });

  it('lights nothing without a highlight', () => {
    const f = create();
    expect(fills(f).map(kind)).toEqual([null, null, null, null]);
    expect(centre(f).getAttribute('opacity')).toBe('0');
  });

  describe('highlight', () => {
    it('presses the sector of the character key and leaves the others alone', () => {
      const f = create();
      f.componentInstance.highlightValue = highlight(CODES.e);
      f.detectChanges();
      expect(fills(f).map(kind)).toEqual([null, 'press', null, null]);
      expect(centre(f).getAttribute('opacity')).toBe('0');
    });

    it('holds the sectors of the other held switches', () => {
      const f = create();
      f.componentInstance.highlightValue = highlight(CODES.n, [CODES.s]);
      f.detectChanges();
      expect(fills(f).map(kind)).toEqual(['press', null, 'hold', null]);
    });

    it('lights two directions of the same switch at once', () => {
      const f = create();
      f.componentInstance.highlightValue = highlight(CODES.w, [CODES.e]);
      f.detectChanges();
      expect(fills(f).map(kind)).toEqual([null, 'hold', null, 'press']);
    });

    it('presses the centre for the centre code, in the accent colour', () => {
      const f = create();
      f.componentInstance.highlightValue = highlight(CODES.c);
      f.detectChanges();
      expect(centre(f).getAttribute('opacity')).toBe('0.5');
      expect(centre(f).classList).toContain('fill-capella-500');
      expect(fills(f).map(kind)).toEqual([null, null, null, null]);
    });

    it('holds the centre in blue', () => {
      const f = create();
      f.componentInstance.highlightValue = highlight(CODES.n, [CODES.c]);
      f.detectChanges();
      expect(centre(f).classList).toContain('fill-blue-400');
      expect(centre(f).classList).not.toContain('fill-capella-500');
    });

    it('ignores a highlight that is about other switches', () => {
      const f = create();
      f.componentInstance.highlightValue = highlight(99, [98]);
      f.detectChanges();
      expect(fills(f).map(kind)).toEqual([null, null, null, null]);
      expect(centre(f).getAttribute('opacity')).toBe('0');
    });
  });

  describe('labels', () => {
    const sectorTexts = (f: F) =>
      sectors(f).map(
        (s) => s.querySelector('text')?.textContent?.trim() ?? null,
      );

    it('puts each label on the sector with that position code', () => {
      const f = create();
      f.componentInstance.labelsValue = {
        [CODES.n]: { text: 'N1' },
        [CODES.s]: { text: 'S1' },
      };
      f.detectChanges();
      expect(sectorTexts(f)).toEqual(['N1', null, 'S1', null]);
      expect(centreText(f).length).toBe(0);
    });

    it('puts the centre label in the middle, at the size for its length', () => {
      const f = create();
      f.componentInstance.labelsValue = { [CODES.c]: { text: 'A' } };
      f.detectChanges();
      const [t] = centreText(f);
      expect(t.textContent!.trim()).toBe('A');
      expect(t.getAttribute('x')).toBe('50');
      expect(t.getAttribute('y')).toBe('60');
      expect(t.style.fontSize).toBe('30px');
      f.componentInstance.labelsValue = { [CODES.c]: { text: 'Shift' } };
      f.detectChanges();
      expect(centreText(f)[0].style.fontSize).toBe('13.5px');
    });

    it('makes an icon in the centre 80% of the full size, in the icon font', () => {
      const f = create();
      f.componentInstance.labelsValue = {
        [CODES.c]: { text: 'shift', icon: true },
      };
      f.detectChanges();
      const [t] = centreText(f);
      expect(t.style.fontSize).toBe('24px');
      expect(t.classList).toContain('material-symbols-outlined');
    });

    it('is not tied to the highlight', () => {
      const f = create();
      f.componentInstance.labelsValue = { [CODES.e]: { text: 'E1' } };
      f.componentInstance.highlightValue = highlight(CODES.w);
      f.detectChanges();
      expect(sectorTexts(f)).toEqual([null, 'E1', null, null]);
    });
  });

  it('turns n, e, s, w into the four angles a switch is drawn at', () => {
    const f = create();
    // the label sits along each sector's own angle: up, right, down, left
    f.componentInstance.labelsValue = {
      [CODES.n]: { text: 'a' },
      [CODES.e]: { text: 'b' },
      [CODES.s]: { text: 'c' },
      [CODES.w]: { text: 'd' },
    };
    f.detectChanges();
    const at = sectors(f).map((s) => {
      const t = s.querySelector('text')!;
      return [
        Number(t.getAttribute('x')) - 50,
        Number(t.getAttribute('y')) - 60,
      ];
    });
    expect(at[0][0]).toBeCloseTo(0);
    expect(at[0][1]).toBeLessThan(0);
    expect(at[1][0]).toBeGreaterThan(0);
    expect(at[1][1]).toBeCloseTo(0);
    expect(at[2][0]).toBeCloseTo(0);
    expect(at[2][1]).toBeGreaterThan(0);
    expect(at[3][0]).toBeLessThan(0);
    expect(at[3][1]).toBeCloseTo(0);
  });
});
