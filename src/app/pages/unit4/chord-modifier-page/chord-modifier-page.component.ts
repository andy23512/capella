import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { CHORD_MODIFIER_EXERCISES } from '../../../data/exercises';
import { resolveChordIllustration } from '../../../utils/key-position.utils';

@Component({
  selector: 'app-chord-modifier-page',
  templateUrl: './chord-modifier-page.component.html',
  standalone: true,
  imports: [LayoutComponent, ChapterNavComponent, ExerciseCardComponent],
})
export class ChordModifierPageComponent {
  protected readonly exampleChord = resolveChordIllustration(
    ['o', 'r', 'w'],
    'presentTense',
  );
  protected readonly exercises = CHORD_MODIFIER_EXERCISES;
}
