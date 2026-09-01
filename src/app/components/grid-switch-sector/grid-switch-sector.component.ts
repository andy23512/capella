import { Component, computed, input } from '@angular/core';
import { PositionLabel } from '../../utils/key-position.utils';
import {
  angularHalfGapDeg,
  describeOpenDonutSector,
  fontSizeForLabel,
  polarToCartesian,
} from '../../utils/math.utils';

const R1 = 37;
const R2 = 100;
/** Physical gap width (in local units) between neighboring sectors, held constant across radii. */
const GAP_WIDTH = 5.5;
const GAP_DEG_INNER = angularHalfGapDeg(R1, GAP_WIDTH);
const GAP_DEG_OUTER = angularHalfGapDeg(R2, GAP_WIDTH);
const LABEL_BASE_FONT_SIZE = 56;

/** One highlightable N/E/S/W wedge of a switch, drawn directly into the parent layout SVG's shared coordinate space. */
@Component({
  selector: '[appGridSwitchSector]',
  templateUrl: './grid-switch-sector.component.html',
  standalone: true,
})
export class GridSwitchSectorComponent {
  readonly center = input.required<{ x: number; y: number }>();
  readonly centerAngle = input.required<number>();
  readonly label = input<PositionLabel | null>(null);
  readonly highlightKind = input<'press' | 'hold' | null>(null);

  protected readonly fontSize = computed(() => {
    const label = this.label();
    if (!label) {
      return LABEL_BASE_FONT_SIZE;
    }
    return label.icon
      ? LABEL_BASE_FONT_SIZE * 0.8
      : fontSizeForLabel(label.text, LABEL_BASE_FONT_SIZE);
  });

  protected readonly pathD = computed(() => {
    const d = this.centerAngle();
    const c = this.center();
    return describeOpenDonutSector(
      c.x,
      c.y,
      R1,
      R2,
      d - 45 + GAP_DEG_INNER,
      d + 45 - GAP_DEG_INNER,
      d - 45 + GAP_DEG_OUTER,
      d + 45 - GAP_DEG_OUTER,
    );
  });

  protected readonly labelPosition = computed(() => {
    const c = this.center();
    return polarToCartesian(c.x, c.y, (R1 + R2) / 2, this.centerAngle());
  });
}
