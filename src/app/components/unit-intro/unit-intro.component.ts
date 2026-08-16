import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Unit } from '../../models/content.models';

@Component({
  selector: 'app-unit-intro',
  templateUrl: './unit-intro.component.html',
  standalone: true,
  imports: [RouterLink],
})
export class UnitIntroComponent {
  readonly unit = input.required<Unit>();

  protected readonly chapters = computed(() =>
    this.unit().chapters.filter((chapter) => !chapter.kind),
  );
}
