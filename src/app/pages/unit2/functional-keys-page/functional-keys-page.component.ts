import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { FUNCTIONAL_KEYS_EXERCISES } from '../../../data/exercises';

@Component({
  selector: 'app-functional-keys-page',
  templateUrl: './functional-keys-page.component.html',
  standalone: true,
  imports: [ExerciseCardComponent, ChapterNavComponent],
})
export class FunctionalKeysPageComponent {
  protected readonly exercises = FUNCTIONAL_KEYS_EXERCISES;
}
