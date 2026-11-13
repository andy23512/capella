import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { FUNCTION_KEYS_EXERCISES } from '../../../data/exercises';

@Component({
  selector: 'app-function-keys-page',
  templateUrl: './function-keys-page.component.html',
  standalone: true,
  imports: [TranslatePipe, ExerciseCardComponent, ChapterNavComponent],
})
export class FunctionKeysPageComponent {
  protected readonly exercises = FUNCTION_KEYS_EXERCISES;
}
