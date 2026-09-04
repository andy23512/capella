import { TestBed } from '@angular/core/testing';
import { SwitchComponent } from './switch.component';

describe('SwitchComponent', () => {
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
