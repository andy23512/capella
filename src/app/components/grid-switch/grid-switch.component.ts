import { Component, computed, input } from '@angular/core';
import { DirectionMap, HighlightKeyCombination } from 'tangent-cc-lib';
import { PositionLabel, PositionLabels } from '../../utils/key-position.utils';
import { fontSizeForLabel } from '../../utils/math.utils';
import { GridSwitchSectorComponent } from '../grid-switch-sector/grid-switch-sector.component';

export type TiltDirection = 'n' | 'e' | 's' | 'w';

const BASE_ANGLES: Record<TiltDirection, number> = {
  n: 270,
  e: 0,
  s: 90,
  w: 180,
};
const CENTER_RADIUS = 37;
const CENTER_BASE_FONT_SIZE = 30;

function highlightKindFor(
  positionCode: number,
  highlight: HighlightKeyCombination | null,
): 'press' | 'hold' | null {
  if (!highlight) {
    return null;
  }
  if (positionCode === highlight.characterKeyPositionCode) {
    return 'press';
  }
  if (highlight.positionCodes.includes(positionCode)) {
    return 'hold';
  }
  return null;
}

/**
 * One full switch (4 tilt sectors + center press), drawn directly into the
 * parent layout SVG's shared coordinate space rather than its own nested
 * SVG — every sector independently checks highlight membership, so two
 * directions on the same switch can both light up at once.
 */
@Component({
  selector: '[appGridSwitch]',
  templateUrl: './grid-switch.component.html',
  standalone: true,
  imports: [GridSwitchSectorComponent],
})
export class GridSwitchComponent {
  readonly center = input.required<{ x: number; y: number }>();
  readonly positionCodeMap = input.required<DirectionMap<number>>();
  readonly highlight = input<HighlightKeyCombination | null>(null);
  readonly labels = input<PositionLabels>({});

  protected readonly centerRadius = CENTER_RADIUS;
  protected readonly tiltDirections: TiltDirection[] = ['n', 'e', 's', 'w'];
  protected readonly baseAngles = BASE_ANGLES;

  protected readonly centerHighlightKind = computed(() =>
    highlightKindFor(this.positionCodeMap().c, this.highlight()),
  );

  protected readonly centerLabel = computed(
    () => this.labels()[this.positionCodeMap().c] ?? null,
  );

  protected readonly centerFontSize = computed(() => {
    const label = this.centerLabel();
    if (!label) {
      return CENTER_BASE_FONT_SIZE;
    }
    return label.icon
      ? CENTER_BASE_FONT_SIZE * 0.8
      : fontSizeForLabel(label.text, CENTER_BASE_FONT_SIZE);
  });

  protected directionHighlightKind(
    direction: TiltDirection,
  ): 'press' | 'hold' | null {
    return highlightKindFor(this.positionCodeMap()[direction], this.highlight());
  }

  protected directionLabel(direction: TiltDirection): PositionLabel | null {
    return this.labels()[this.positionCodeMap()[direction]] ?? null;
  }
}
