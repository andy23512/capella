import { Component, computed, input, output } from '@angular/core';
import { describeDonutSector, polarToCartesian } from '../../utils/math.utils';

export type TiltDirection = 'n' | 'e' | 's' | 'w';

const CENTER = 100;

@Component({
  selector: '[appSwitchSector]',
  templateUrl: './switch-sector.component.html',
  standalone: true,
})
export class SwitchSectorComponent {
  readonly direction = input.required<TiltDirection>();
  readonly centerAngle = input.required<number>();
  readonly r1 = input(42);
  readonly r2 = input(95);
  readonly gapDeg = input(6);
  readonly highlightKind = input<'press' | 'hold' | null>(null);

  readonly sectorClick = output<void>();

  protected readonly pathD = computed(() => {
    const half = 45 - this.gapDeg();
    return describeDonutSector(
      CENTER,
      CENTER,
      this.r1(),
      this.r2(),
      this.centerAngle() - half,
      this.centerAngle() + half,
    );
  });

  protected readonly labelPosition = computed(() =>
    polarToCartesian(CENTER, CENTER, (this.r1() + this.r2()) / 2, this.centerAngle()),
  );
}
