import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { FUNCTIONAL_KEYS_EXERCISES } from '../../../data/exercises';

@Component({
  selector: 'app-functional-keys-page',
  templateUrl: './functional-keys-page.component.html',
  standalone: true,
  imports: [TranslatePipe, ExerciseCardComponent, ChapterNavComponent],
})
export class FunctionalKeysPageComponent {
  protected readonly exercises = FUNCTIONAL_KEYS_EXERCISES;
}
