import { Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ProgressService } from '../../../services/progress.service';
import { IMPULSE_CHORD_PRACTICE_ID } from '../impulse-chord-practice-page/impulse-chord-practice-page.component';

@Component({
  selector: 'app-impulse-chord-page',
  templateUrl: './impulse-chord-page.component.html',
  standalone: true,
  imports: [ChapterNavComponent, RouterLink, MatIcon],
})
export class ImpulseChordPageComponent {
  private readonly progressService = inject(ProgressService);

  protected readonly practiceCompleted = computed(() =>
    this.progressService.isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
  );
}
