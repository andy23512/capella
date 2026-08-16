import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { DeviceCardComponent } from '../../../components/device-card/device-card.component';
import { DEVICES } from '../../../data/devices';

@Component({
  selector: 'app-device-introduction-page',
  templateUrl: './device-introduction-page.component.html',
  standalone: true,
  imports: [DeviceCardComponent, ChapterNavComponent],
})
export class DeviceIntroductionPageComponent {
  protected readonly devices = DEVICES;
}
