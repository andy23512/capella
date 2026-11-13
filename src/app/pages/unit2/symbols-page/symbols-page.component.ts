import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { SYMBOLS_EXERCISES } from '../../../data/exercises';

@Component({
  selector: 'app-symbols-page',
  templateUrl: './symbols-page.component.html',
  standalone: true,
  imports: [TranslatePipe, ExerciseCardComponent, ChapterNavComponent],
})
export class SymbolsPageComponent {
  protected readonly exercises = SYMBOLS_EXERCISES;
}
