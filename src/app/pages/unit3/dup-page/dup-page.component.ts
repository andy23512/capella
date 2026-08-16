import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { DUP_EXERCISES } from '../../../data/exercises';

@Component({
  selector: 'app-dup-page',
  templateUrl: './dup-page.component.html',
  standalone: true,
  imports: [ExerciseCardComponent, ChapterNavComponent],
})
export class DupPageComponent {
  protected readonly exercises = DUP_EXERCISES;
}
