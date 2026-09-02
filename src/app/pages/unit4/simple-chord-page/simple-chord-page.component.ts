import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { SIMPLE_CHORD_EXERCISES } from '../../../data/exercises';
import { resolveChordIllustration } from '../../../utils/key-position.utils';

@Component({
  selector: 'app-simple-chord-page',
  templateUrl: './simple-chord-page.component.html',
  standalone: true,
  imports: [LayoutComponent, ChapterNavComponent, ExerciseCardComponent],
})
export class SimpleChordPageComponent {
  protected readonly exampleChord = resolveChordIllustration(['b', 'c']);
  protected readonly exercises = SIMPLE_CHORD_EXERCISES;
}
