import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { ExerciseCardComponent } from '../../../components/exercise-card/exercise-card.component';
import { MOUSE_FEATURES_EXERCISES } from '../../../data/exercises';
import { DeviceLayoutService } from '../../../services/device-layout.service';

@Component({
  selector: 'app-mouse-features-page',
  templateUrl: './mouse-features-page.component.html',
  standalone: true,
  imports: [ExerciseCardComponent, ChapterNavComponent, RouterLink],
})
export class MouseFeaturesPageComponent {
  protected readonly deviceLayoutService = inject(DeviceLayoutService);
  protected readonly exercises = MOUSE_FEATURES_EXERCISES;
}
