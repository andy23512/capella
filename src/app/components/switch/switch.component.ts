import { Component, computed, input, output } from '@angular/core';
import {
  SwitchSectorComponent,
  TiltDirection,
} from '../switch-sector/switch-sector.component';
import { polarToCartesian } from '../../utils/math.utils';

export type SwitchDirection = TiltDirection | 'c';

const CENTER = 100;
const BASE_ANGLES: Record<TiltDirection, number> = {
  n: 270,
  e: 0,
  s: 90,
  w: 180,
};
const REFERENCE_ANGLES = [270, 0, 90, 180];

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  standalone: true,
  imports: [SwitchSectorComponent],
})
export class SwitchComponent {
  /** Degrees to rotate the four tilt sectors by, relative to natural finger directions. */
  readonly rotation = input(0);
  /** Show fixed dashed guide lines marking the natural up/right/down/left finger directions. */
  readonly showReference = input(false);
  readonly selectedDirection = input<SwitchDirection | null>(null);
  readonly highlightKind = input<'press' | 'hold'>('press');

  readonly directionSelected = output<SwitchDirection>();

  protected readonly tiltDirections: TiltDirection[] = ['n', 'e', 's', 'w'];

  protected readonly sectorAngles = computed<Record<TiltDirection, number>>(
    () => {
      const rotation = this.rotation();
      return {
        n: BASE_ANGLES.n + rotation,
        e: BASE_ANGLES.e + rotation,
        s: BASE_ANGLES.s + rotation,
        w: BASE_ANGLES.w + rotation,
      };
    },
  );

  protected readonly referenceLines = computed(() =>
    REFERENCE_ANGLES.map((angle) => ({
      inner: polarToCartesian(CENTER, CENTER, 100, angle),
      outer: polarToCartesian(CENTER, CENTER, 118, angle),
      label: polarToCartesian(CENTER, CENTER, 132, angle),
    })),
  );
}
