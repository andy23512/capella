import { Component, input } from '@angular/core';
import { Unit } from '../../models/content.models';

@Component({
  selector: 'app-unit-summary',
  templateUrl: './unit-summary.component.html',
  standalone: true,
})
export class UnitSummaryComponent {
  readonly unit = input.required<Unit>();
}
