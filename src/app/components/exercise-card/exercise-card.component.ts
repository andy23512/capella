import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Exercise } from '../../models/exercise.models';

@Component({
  selector: 'app-exercise-card',
  templateUrl: './exercise-card.component.html',
  standalone: true,
  imports: [RouterLink],
})
export class ExerciseCardComponent {
  readonly exercise = input.required<Exercise>();
}
