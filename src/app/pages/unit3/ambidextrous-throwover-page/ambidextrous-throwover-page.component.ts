import { Component, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  MatButtonToggle,
  MatButtonToggleChange,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { HighlightKeyCombination } from 'tangent-cc-lib';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { LayoutComponent } from '../../../components/layout/layout.component';
import {
  Hand,
  PositionLabels,
  buildAmbidextrousThrowoverLabels,
  resolveNonKeyActionPosition,
} from '../../../utils/key-position.utils';

@Component({
  selector: 'app-ambidextrous-throwover-page',
  templateUrl: './ambidextrous-throwover-page.component.html',
  standalone: true,
  imports: [TranslatePipe, 
    LayoutComponent,
    ChapterNavComponent,
    MatButtonToggleGroup,
    MatButtonToggle,
  ],
})
export class AmbidextrousThrowoverPageComponent {
  private readonly leftAtHighlight: HighlightKeyCombination | null =
    resolveNonKeyActionPosition('AmbidextrousThrowoverLeft');
  private readonly rightAtHighlight: HighlightKeyCombination | null =
    resolveNonKeyActionPosition('AmbidextrousThrowoverRight');

  protected readonly activeHand = signal<Hand | null>(null);

  protected readonly highlight = computed<HighlightKeyCombination | null>(
    () => {
      const hand = this.activeHand();
      if (hand === 'left') return this.leftAtHighlight;
      if (hand === 'right') return this.rightAtHighlight;
      return null;
    },
  );

  protected readonly labels = computed<PositionLabels>(() => {
    const labels = { ...buildAmbidextrousThrowoverLabels(this.activeHand()) };
    const atHighlight = this.highlight();
    if (atHighlight) {
      labels[atHighlight.characterKeyPositionCode] = { text: 'AT' };
    }
    return labels;
  });

  /** A translation key; the template renders it with the translate pipe. */
  protected readonly caption = computed(() => {
    switch (this.activeHand()) {
      case 'left':
        return 'atPage.captionLeft';
      case 'right':
        return 'atPage.captionRight';
      default:
        return 'atPage.captionDefault';
    }
  });

  protected onModeChange(event: MatButtonToggleChange) {
    this.activeHand.set(event.value as Hand | null);
  }
}
