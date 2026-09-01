import { Component, computed, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Exercise } from '../../models/exercise.models';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-exercise-card',
  templateUrl: './exercise-card.component.html',
  standalone: true,
  imports: [RouterLink, MatIcon],
})
export class ExerciseCardComponent {
  private readonly progressService = inject(ProgressService);

  readonly exercise = input.required<Exercise>();

  protected readonly completed = computed(() =>
    this.progressService.isExerciseCompleted(this.exercise().id),
  );
}
