import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { NUMBER_EXERCISES } from '../../../data/exercises';

@Component({
  selector: 'app-number-page',
  templateUrl: './number-page.component.html',
  standalone: true,
  imports: [ExerciseCardComponent, ChapterNavComponent],
})
export class NumberPageComponent {
  protected readonly exercises = NUMBER_EXERCISES;
}
