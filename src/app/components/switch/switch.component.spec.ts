import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { SwitchComponent, SwitchDirection } from './switch.component';

describe('SwitchComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  });

  function createComponent() {
    const fixture = TestBed.createComponent(SwitchComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('places the four tilt sectors at their natural finger-direction angles with no rotation', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance as unknown as {
      sectorAngles: () => Record<'n' | 'e' | 's' | 'w', number>;
    };
    expect(component.sectorAngles()).toEqual({ n: 270, e: 0, s: 90, w: 180 });
  });

  it('offsets every tilt sector by the given rotation input', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('rotation', 45);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      sectorAngles: () => Record<'n' | 'e' | 's' | 'w', number>;
    };
    expect(component.sectorAngles()).toEqual({
      n: 315,
      e: 45,
      s: 135,
      w: 225,
    });
  });

  it('emits the pressed direction, including the center press', () => {
    const fixture = createComponent();
    const emitted: string[] = [];
    fixture.componentInstance.directionSelected.subscribe((direction) =>
      emitted.push(direction),
    );
    fixture.componentInstance.directionSelected.emit('n');
    fixture.componentInstance.directionSelected.emit('c');
    expect(emitted).toEqual(['n', 'c']);
  });
});

describe('SwitchComponent, as drawn', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  });

  function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(SwitchComponent);
    for (const [k, v] of Object.entries(inputs)) {
      fixture.componentRef.setInput(k, v);
    }
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const el = (f: F) => f.nativeElement as HTMLElement;
  const sectors = (f: F) =>
    Array.from(
      el(f).querySelectorAll('g[appSwitchSector] > path'),
    ) as SVGPathElement[];
  const centre = (f: F) => el(f).querySelector('circle') as SVGCircleElement;
  const filled = (e: Element) => ({
    accent: e.classList.contains('fill-capella-500'),
    blue: e.classList.contains('fill-blue-400'),
  });

  it('draws four sectors and a centre press, labeled N, E, S, W and Press', () => {
    const f = create();
    expect(sectors(f).length).toBe(4);
    const texts = Array.from(el(f).querySelectorAll('text')).map((t) =>
      t.textContent!.trim(),
    );
    expect(texts).toEqual(['N', 'E', 'S', 'W', 'switch.press']);
  });

  describe('guide lines', () => {
    it('are hidden unless asked for', () => {
      const f = create();
      expect(el(f).querySelectorAll('line').length).toBe(0);
      expect(el(f).textContent).not.toContain('switch.naturalUp');
    });

    it('show four dashed lines and the "natural up" note when asked for', () => {
      const f = create({ showReference: true });
      expect(el(f).querySelectorAll('line').length).toBe(4);
      expect(el(f).textContent).toContain('switch.naturalUp');
    });

    it('run from the edge of the switch outward, 100 to 118 from the middle', () => {
      const f = create({ showReference: true });
      const up = el(f).querySelectorAll('line')[0];
      expect(Number(up.getAttribute('y1'))).toBeCloseTo(0);
      expect(Number(up.getAttribute('y2'))).toBeCloseTo(-18);
      expect(Number(up.getAttribute('x1'))).toBeCloseTo(100);
    });

    it('stay where they are when the sectors are rotated', () => {
      const f = create({ showReference: true });
      const before = Array.from(el(f).querySelectorAll('line')).map((l) =>
        l.getAttribute('x2'),
      );
      f.componentRef.setInput('rotation', 45);
      f.detectChanges();
      const after = Array.from(el(f).querySelectorAll('line')).map((l) =>
        l.getAttribute('x2'),
      );
      expect(after).toEqual(before);
    });
  });

  describe('selecting', () => {
    const order: SwitchDirection[] = ['n', 'e', 's', 'w'];

    it('emits the direction of the sector that is clicked', () => {
      const f = create();
      const emitted: SwitchDirection[] = [];
      f.componentInstance.directionSelected.subscribe((d) => emitted.push(d));
      sectors(f).forEach((p) => p.dispatchEvent(new MouseEvent('click')));
      expect(emitted).toEqual(order);
    });

    it('emits "c" for the centre press', () => {
      const f = create();
      const emitted: SwitchDirection[] = [];
      f.componentInstance.directionSelected.subscribe((d) => emitted.push(d));
      centre(f).dispatchEvent(new MouseEvent('click'));
      expect(emitted).toEqual(['c']);
    });

    it('lights only the selected sector, as a press by default', () => {
      const f = create({ selectedDirection: 'e' });
      expect(sectors(f).map((p) => filled(p).accent)).toEqual([
        false,
        true,
        false,
        false,
      ]);
      expect(filled(centre(f)).accent).toBeFalse();
      expect(centre(f).classList).toContain('fill-gray-500');
    });

    it('lights a selected sector blue as a hold', () => {
      const f = create({ selectedDirection: 's', highlightKind: 'hold' });
      expect(sectors(f).map((p) => filled(p).blue)).toEqual([
        false,
        false,
        true,
        false,
      ]);
      expect(sectors(f).map((p) => filled(p).accent)).toEqual([
        false,
        false,
        false,
        false,
      ]);
    });

    it('lights the centre press, in either colour, when "c" is selected', () => {
      const f = create({ selectedDirection: 'c' });
      expect(filled(centre(f)).accent).toBeTrue();
      expect(centre(f).classList).not.toContain('fill-gray-500');
      expect(filled(centre(f)).blue).toBeFalse();
      expect(sectors(f).every((p) => !filled(p).accent)).toBeTrue();
      f.componentRef.setInput('highlightKind', 'hold');
      f.detectChanges();
      expect(filled(centre(f)).blue).toBeTrue();
      expect(filled(centre(f)).accent).toBeFalse();
    });

    it('lights nothing without a selection', () => {
      const f = create();
      expect(
        sectors(f).every((p) => !filled(p).accent && !filled(p).blue),
      ).toBeTrue();
      expect(filled(centre(f))).toEqual({ accent: false, blue: false });
    });
  });

  it('turns the sectors with the rotation input', () => {
    const f = create();
    const before = sectors(f).map((p) => p.getAttribute('d'));
    f.componentRef.setInput('rotation', 45);
    f.detectChanges();
    const after = sectors(f).map((p) => p.getAttribute('d'));
    after.forEach((d, i) => expect(d).not.toBe(before[i]));
  });
});
