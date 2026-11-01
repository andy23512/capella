import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { UnitIntroComponent } from '../../../components/unit-intro/unit-intro.component';
import { UNITS } from '../../../data/units';
import { DeviceLayoutService } from '../../../services/device-layout.service';

@Component({
  selector: 'app-unit2-introduction-page',
  templateUrl: './introduction-page.component.html',
  standalone: true,
  imports: [UnitIntroComponent, ChapterNavComponent, RouterLink],
})
export class Unit2IntroductionPageComponent {
  protected readonly deviceLayoutService = inject(DeviceLayoutService);
  protected readonly unit = UNITS.find((u) => u.id === 'unit-2')!;
}
