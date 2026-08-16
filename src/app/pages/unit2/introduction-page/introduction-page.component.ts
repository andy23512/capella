import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { UnitIntroComponent } from '../../../components/unit-intro/unit-intro.component';
import { UNITS } from '../../../data/units';

@Component({
  selector: 'app-unit2-introduction-page',
  templateUrl: './introduction-page.component.html',
  standalone: true,
  imports: [UnitIntroComponent, ChapterNavComponent],
})
export class Unit2IntroductionPageComponent {
  protected readonly unit = UNITS.find((u) => u.id === 'unit-2')!;
}
