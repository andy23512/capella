import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Device } from '../../models/device.models';

@Component({
  selector: 'app-device-card',
  templateUrl: './device-card.component.html',
  standalone: true,
  imports: [TranslatePipe],
})
export class DeviceCardComponent {
  readonly device = input.required<Device>();

  protected readonly nonThumbSwitches = computed(
    () => this.device().switchesPerHand - this.device().thumbSwitchesPerHand,
  );
  protected readonly nonThumbRange = computed(() =>
    Array.from({ length: this.nonThumbSwitches() }),
  );
  protected readonly thumbRange = computed(() =>
    Array.from({ length: this.device().thumbSwitchesPerHand }),
  );
}
