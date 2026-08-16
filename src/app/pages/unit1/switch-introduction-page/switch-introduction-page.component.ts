import { Component, computed, signal } from '@angular/core';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import {
  SwitchComponent,
  SwitchDirection,
} from '../../../components/switch/switch.component';

type OrientationMode = 'cc' | 'forge';

const DIRECTION_INFO: Record<
  SwitchDirection,
  { label: string; description: string }
> = {
  n: { label: 'North', description: 'Tilt the switch away from you.' },
  e: { label: 'East', description: 'Tilt the switch to the right.' },
  s: { label: 'South', description: 'Tilt the switch toward you.' },
  w: { label: 'West', description: 'Tilt the switch to the left.' },
  c: { label: 'Center', description: 'Press the switch straight down.' },
};

@Component({
  selector: 'app-switch-introduction-page',
  templateUrl: './switch-introduction-page.component.html',
  standalone: true,
  imports: [SwitchComponent, MatButtonToggleGroup, MatButtonToggle, ChapterNavComponent],
})
export class SwitchIntroductionPageComponent {
  protected readonly mode = signal<OrientationMode>('cc');
  protected readonly selectedDirection = signal<SwitchDirection | null>(null);

  protected readonly rotation = computed(() =>
    this.mode() === 'forge' ? 45 : 0,
  );

  protected readonly selectedInfo = computed(() => {
    const direction = this.selectedDirection();
    return direction ? DIRECTION_INFO[direction] : null;
  });

  onDirectionSelected(direction: SwitchDirection) {
    this.selectedDirection.set(direction);
  }
}
