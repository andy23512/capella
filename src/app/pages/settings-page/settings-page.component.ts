import { Component, inject } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import {
  DeviceLayoutId,
  DeviceLayoutService,
} from '../../services/device-layout.service';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  standalone: true,
  imports: [MatRadioGroup, MatRadioButton],
})
export class SettingsPageComponent {
  protected readonly deviceLayoutService = inject(DeviceLayoutService);

  protected onDeviceLayoutChange(id: DeviceLayoutId): void {
    this.deviceLayoutService.setDeviceLayoutId(id);
  }
}
