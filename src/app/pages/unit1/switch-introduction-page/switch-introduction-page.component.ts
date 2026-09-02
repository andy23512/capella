import { Component, signal } from '@angular/core';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';

type OrientationMode = 'cc' | 'forge';

@Component({
  selector: 'app-switch-introduction-page',
  templateUrl: './switch-introduction-page.component.html',
  standalone: true,
  imports: [MatButtonToggleGroup, MatButtonToggle, ChapterNavComponent],
})
export class SwitchIntroductionPageComponent {
  protected readonly mode = signal<OrientationMode>('cc');
}
