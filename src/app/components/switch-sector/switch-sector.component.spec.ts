import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwitchSectorComponent } from './switch-sector.component';

@Component({
  imports: [SwitchSectorComponent],
  template: `<svg>
    <g
      appSwitchSector
      [direction]="direction"
      [centerAngle]="angle"
      [highlightKind]="kind"
      [r1]="r1"
      [r2]="r2"
      [gapDeg]="gap"
      (sectorClick)="clicks = clicks + 1"
    ></g>
  </svg>`,
})
class HostComponent {
  direction: 'n' | 'e' | 's' | 'w' = 'n';
  angle = 270;
  kind: 'press' | 'hold' | null = null;
  r1 = 42;
  r2 = 95;
  gap = 6;
  clicks = 0;
}

@Component({
  imports: [SwitchSectorComponent],
  template: `<svg>
    <g appSwitchSector direction="n" [centerAngle]="270"></g>
  </svg>`,
})
class DefaultsHostComponent {}

describe('SwitchSectorComponent', () => {
  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }
  const path = (f: ReturnType<typeof create>) =>
    f.nativeElement.querySelector('path') as SVGPathElement;
  const label = (f: ReturnType<typeof create>) =>
    f.nativeElement.querySelector('text') as SVGTextElement;

  it('writes the direction in capitals as its label', () => {
    const f = create();
    expect(label(f).textContent!.trim()).toBe('N');
    f.componentInstance.direction = 'w';
    f.detectChanges();
    expect(label(f).textContent!.trim()).toBe('W');
  });

  it('puts the label halfway between the two radii, along its own angle', () => {
    const f = create();
    // angle 270 points up: x stays at the centre, y is 100 - (42 + 95) / 2
    expect(Number(label(f).getAttribute('x'))).toBeCloseTo(100);
    expect(Number(label(f).getAttribute('y'))).toBeCloseTo(100 - 68.5);
    f.componentInstance.angle = 0;
    f.detectChanges();
    expect(Number(label(f).getAttribute('x'))).toBeCloseTo(168.5);
    expect(Number(label(f).getAttribute('y'))).toBeCloseTo(100);
  });

  it('draws a closed donut sector, narrowed on each side by the gap', () => {
    const f = create();
    const d = path(f).getAttribute('d')!;
    expect(d.startsWith('M ')).toBeTrue();
    expect(d.endsWith('Z')).toBeTrue();
    expect(d).toContain('A 95 95');
    expect(d).toContain('A 42 42');
    f.componentInstance.gap = 20;
    f.detectChanges();
    expect(path(f).getAttribute('d')).not.toBe(d);
  });

  it('starts 42 from the middle and ends 95 from it, unless told otherwise', () => {
    const f = TestBed.createComponent(DefaultsHostComponent);
    f.detectChanges();
    const d = f.nativeElement
      .querySelector('path')
      .getAttribute('d')
      .split(' ');
    // M x y L x y: the inner start, then the outer start
    const dist = (x: string, y: string) =>
      Math.hypot(Number(x) - 100, Number(y) - 100);
    expect(dist(d[1], d[2])).toBeCloseTo(42, 5);
    expect(dist(d[4], d[5])).toBeCloseTo(95, 5);
  });

  it('follows the radii and the angle', () => {
    const f = create();
    const before = path(f).getAttribute('d');
    f.componentInstance.r2 = 80;
    f.detectChanges();
    expect(path(f).getAttribute('d')).toContain('A 80 80');
    f.componentInstance.angle = 90;
    f.detectChanges();
    expect(path(f).getAttribute('d')).not.toBe(before);
  });

  describe('colour', () => {
    const classes = (f: ReturnType<typeof create>) =>
      Array.from(path(f).classList);

    it('is grey when nothing is highlighted', () => {
      const f = create();
      expect(classes(f)).toContain('fill-gray-400');
      expect(classes(f)).not.toContain('fill-capella-500');
      expect(classes(f)).not.toContain('fill-blue-400');
      expect(label(f).classList).toContain('fill-white');
    });

    it('is the accent colour for a press', () => {
      const f = create();
      f.componentInstance.kind = 'press';
      f.detectChanges();
      expect(classes(f)).toContain('fill-capella-500');
      expect(classes(f)).not.toContain('fill-gray-400');
      expect(classes(f)).not.toContain('fill-blue-400');
      expect(label(f).classList).toContain('fill-gray-900');
    });

    it('is blue for a hold', () => {
      const f = create();
      f.componentInstance.kind = 'hold';
      f.detectChanges();
      expect(classes(f)).toContain('fill-blue-400');
      expect(classes(f)).not.toContain('fill-capella-500');
      expect(classes(f)).not.toContain('fill-gray-400');
      expect(label(f).classList).toContain('fill-gray-900');
    });
  });

  it('tells its parent when it is clicked, and lets clicks on the label through', () => {
    const f = create();
    path(f).dispatchEvent(new MouseEvent('click'));
    path(f).dispatchEvent(new MouseEvent('click'));
    expect(f.componentInstance.clicks).toBe(2);
    expect(label(f).classList).toContain('pointer-events-none');
  });
});
