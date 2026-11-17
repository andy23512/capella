import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { UNITS } from '../../../data/units';

@Component({
  selector: 'app-whats-next-page',
  templateUrl: './whats-next-page.component.html',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ChapterNavComponent],
})
export class WhatsNextPageComponent {
  protected readonly unit = UNITS.find((u) => u.id === 'unit-5')!;

  /** Units 1-4, each linking to its first chapter for review. */
  protected readonly recapUnits = UNITS.filter((u) => u.id !== 'unit-5').map(
    (u) => ({
      titleKey: u.titleKey,
      path: u.chapters[0].path,
      recapKey: `whatsNext.recap.${u.id.replace('-', '')}`,
    }),
  );
}
