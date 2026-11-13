import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Unit } from '../../models/content.models';

@Component({
  selector: 'app-unit-intro',
  templateUrl: './unit-intro.component.html',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
})
export class UnitIntroComponent {
  readonly unit = input.required<Unit>();

  protected readonly chapters = computed(() =>
    this.unit().chapters.filter((chapter) => !chapter.kind),
  );
}
