import { Component, inject } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { TranslatePipe } from '@ngx-translate/core';
import {
  DeviceLayoutId,
  DeviceLayoutService,
} from '../../services/device-layout.service';
import { LanguageService, UiLanguage } from '../../services/language.service';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  standalone: true,
  imports: [MatRadioGroup, MatRadioButton, TranslatePipe],
})
export class SettingsPageComponent {
  protected readonly deviceLayoutService = inject(DeviceLayoutService);
  protected readonly languageService = inject(LanguageService);

  protected onDeviceLayoutChange(id: DeviceLayoutId): void {
    this.deviceLayoutService.setDeviceLayoutId(id);
  }

  protected onLanguageChange(language: UiLanguage): void {
    this.languageService.setLanguage(language);
  }
}
