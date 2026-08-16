import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { KEY_COMBINATIONS_EXERCISES } from '../../../data/exercises';

@Component({
  selector: 'app-key-combinations-page',
  templateUrl: './key-combinations-page.component.html',
  standalone: true,
  imports: [ExerciseCardComponent, ChapterNavComponent],
})
export class KeyCombinationsPageComponent {
  protected readonly exercises = KEY_COMBINATIONS_EXERCISES;
}
