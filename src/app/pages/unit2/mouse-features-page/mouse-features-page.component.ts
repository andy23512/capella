import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { MOUSE_FEATURES_EXERCISES } from '../../../data/exercises';

@Component({
  selector: 'app-mouse-features-page',
  templateUrl: './mouse-features-page.component.html',
  standalone: true,
  imports: [ExerciseCardComponent, ChapterNavComponent],
})
export class MouseFeaturesPageComponent {
  protected readonly exercises = MOUSE_FEATURES_EXERCISES;
}
