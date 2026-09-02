import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { UnitSummaryComponent } from '../../../components/unit-summary/unit-summary.component';
import { UNITS } from '../../../data/units';

@Component({
  selector: 'app-unit3-summary-page',
  templateUrl: './summary-page.component.html',
  standalone: true,
  imports: [UnitSummaryComponent, ChapterNavComponent],
})
export class Unit3SummaryPageComponent {
  protected readonly unit = UNITS.find((u) => u.id === 'unit-3')!;
}
