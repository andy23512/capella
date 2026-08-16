import { Component } from '@angular/core';
import { HighlightKeyCombination } from 'tangent-cc-lib';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { LayoutComponent } from '../../../components/layout/layout.component';
import {
  PositionLabels,
  buildPositionLabels,
  resolveNonKeyActionPosition,
} from '../../../utils/key-position.utils';

@Component({
  selector: 'app-ambidextrous-throwover-page',
  templateUrl: './ambidextrous-throwover-page.component.html',
  standalone: true,
  imports: [LayoutComponent, ChapterNavComponent],
})
export class AmbidextrousThrowoverPageComponent {
  protected readonly leftHighlight: HighlightKeyCombination | null =
    resolveNonKeyActionPosition('AmbidextrousThrowoverLeft');
  protected readonly rightHighlight: HighlightKeyCombination | null =
    resolveNonKeyActionPosition('AmbidextrousThrowoverRight');
  protected readonly leftLabels: PositionLabels = this.leftHighlight
    ? buildPositionLabels(this.leftHighlight, 'AT')
    : {};
  protected readonly rightLabels: PositionLabels = this.rightHighlight
    ? buildPositionLabels(this.rightHighlight, 'AT')
    : {};
}
