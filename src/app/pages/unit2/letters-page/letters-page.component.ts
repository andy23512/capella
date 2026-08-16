import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { LETTERS_EXERCISES } from '../../../data/exercises';

@Component({
  selector: 'app-letters-page',
  templateUrl: './letters-page.component.html',
  standalone: true,
  imports: [ExerciseCardComponent, ChapterNavComponent],
})
export class LettersPageComponent {
  protected readonly exercises = LETTERS_EXERCISES;
}
