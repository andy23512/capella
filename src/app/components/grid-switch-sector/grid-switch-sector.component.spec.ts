import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PositionLabel } from '../../utils/key-position.utils';
import {
  angularHalfGapDeg,
  describeOpenDonutSector,
} from '../../utils/math.utils';
import { GridSwitchSectorComponent } from './grid-switch-sector.component';

@Component({
  imports: [GridSwitchSectorComponent],
  template: `<svg>
    <g
      appGridSwitchSector
      [center]="{ x: 100, y: 200 }"
      [centerAngle]="angle"
      [label]="label"
      [highlightKind]="kind"
    ></g>
  </svg>`,
})
class HostComponent {
  angle = 270;
  label: PositionLabel | null = null;
  kind: 'press' | 'hold' | null = null;
}

describe('GridSwitchSectorComponent', () => {
  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const paths = (f: F) =>
    Array.from(f.nativeElement.querySelectorAll('path')) as SVGPathElement[];
  const text = (f: F) =>
    f.nativeElement.querySelector('text') as SVGTextElement | null;

  it('draws an outline and a fill with the same shape, open on the start side', () => {
    const f = create();
    const [outline, fill] = paths(f);
    expect(outline.getAttribute('d')).toBe(fill.getAttribute('d'));
    expect(outline.getAttribute('d')).not.toContain('Z');
    expect(outline.getAttribute('fill')).toBe('none');
  });

  it('insets each end by the angle of a 5.5-unit gap at its own radius', () => {
    const f = create();
    const inner = angularHalfGapDeg(37, 5.5);
    const outer = angularHalfGapDeg(100, 5.5);
    expect(inner).toBeGreaterThan(outer);
    for (const angle of [270, 0, 90, 180]) {
      f.componentInstance.angle = angle;
      f.detectChanges();
      expect(paths(f)[0].getAttribute('d')).toBe(
        describeOpenDonutSector(
          100,
          200,
          37,
          100,
          angle - 45 + inner,
          angle + 45 - inner,
          angle - 45 + outer,
          angle + 45 - outer,
        ),
      );
    }
  });

  it('moves with the centre of the switch', () => {
    const f = create();
    const d = paths(f)[0].getAttribute('d')!;
    // the inner arc starts 37 from the centre, so it must be near (100, 200)
    const [, x, y] = d.split(' ');
    expect(Math.hypot(Number(x) - 100, Number(y) - 200)).toBeCloseTo(37, 5);
  });

  it('turns with the angle', () => {
    const f = create();
    const before = paths(f)[0].getAttribute('d');
    f.componentInstance.angle = 0;
    f.detectChanges();
    expect(paths(f)[0].getAttribute('d')).not.toBe(before);
  });

  describe('highlight', () => {
    const opacity = (f: F) => paths(f)[1].getAttribute('opacity');

    it('is invisible without a highlight', () => {
      const f = create();
      expect(opacity(f)).toBe('0');
      expect(paths(f)[1].classList).not.toContain('fill-capella-500');
      expect(paths(f)[1].classList).not.toContain('fill-blue-400');
    });

    it('is half see-through accent colour for a press', () => {
      const f = create();
      f.componentInstance.kind = 'press';
      f.detectChanges();
      expect(opacity(f)).toBe('0.5');
      expect(paths(f)[1].classList).toContain('fill-capella-500');
      expect(paths(f)[1].classList).not.toContain('fill-blue-400');
    });

    it('is half see-through blue for a hold', () => {
      const f = create();
      f.componentInstance.kind = 'hold';
      f.detectChanges();
      expect(opacity(f)).toBe('0.5');
      expect(paths(f)[1].classList).toContain('fill-blue-400');
      expect(paths(f)[1].classList).not.toContain('fill-capella-500');
    });
  });

  describe('label', () => {
    it('is left out when there is none', () => {
      expect(text(create())).toBeNull();
    });

    it('shows its text, halfway between the two radii along the angle', () => {
      const f = create();
      f.componentInstance.label = { text: 'A' };
      f.detectChanges();
      expect(text(f)!.textContent!.trim()).toBe('A');
      // angle 270 is straight up, (37 + 100) / 2 = 68.5 from the centre
      expect(Number(text(f)!.getAttribute('x'))).toBeCloseTo(100);
      expect(Number(text(f)!.getAttribute('y'))).toBeCloseTo(200 - 68.5);
    });

    it('is drawn with the icon font only for an icon', () => {
      const f = create();
      f.componentInstance.label = { text: 'shift', icon: true };
      f.detectChanges();
      expect(text(f)!.classList).toContain('material-symbols-outlined');
      f.componentInstance.label = { text: 'A' };
      f.detectChanges();
      expect(text(f)!.classList).not.toContain('material-symbols-outlined');
    });

    it('gets smaller as the text gets longer, and an icon is 80% of the full size', () => {
      const f = create();
      const size = () => text(f)!.style.fontSize;
      f.componentInstance.label = { text: 'A' };
      f.detectChanges();
      expect(size()).toBe('56px');
      f.componentInstance.label = { text: 'F5' };
      f.detectChanges();
      expect(size()).toBe('44.8px');
      f.componentInstance.label = { text: 'Shift' };
      f.detectChanges();
      expect(size()).toBe('25.2px');
      f.componentInstance.label = { text: 'shift', icon: true };
      f.detectChanges();
      expect(size()).toBe('44.8px');
    });
  });
});
