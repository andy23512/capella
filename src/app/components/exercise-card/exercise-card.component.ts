import { Component, computed, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { isExerciseAvailable } from '../../data/exercises';
import { Exercise } from '../../models/exercise.models';
import { DeviceLayoutService } from '../../services/device-layout.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-exercise-card',
  templateUrl: './exercise-card.component.html',
  standalone: true,
  imports: [RouterLink, MatIcon],
})
export class ExerciseCardComponent {
  private readonly progressService = inject(ProgressService);
  private readonly deviceLayoutService = inject(DeviceLayoutService);

  readonly exercise = input.required<Exercise>();

  protected readonly unavailable = computed(
    () =>
      !isExerciseAvailable(
        this.exercise(),
        this.deviceLayoutService.deviceLayoutId(),
      ),
  );

  protected readonly completed = computed(() =>
    this.progressService.isExerciseCompleted(this.exercise().id),
  );
}
