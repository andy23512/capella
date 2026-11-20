import { TestBed } from '@angular/core/testing';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { By } from '@angular/platform-browser';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../assets/i18n/en.json';
import { DeviceLayoutService } from '../../services/device-layout.service';
import { LanguageService } from '../../services/language.service';
import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
  let layouts: DeviceLayoutService;
  let languages: LanguageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    layouts = TestBed.inject(DeviceLayoutService);
    languages = TestBed.inject(LanguageService);
    layouts.setDeviceLayoutId('cc1-cc2-ccu');
    languages.setLanguage('en');
  });
  afterEach(() => {
    layouts.setDeviceLayoutId('cc1-cc2-ccu');
    languages.setLanguage('en');
    localStorage.clear();
  });

  function create() {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const groups = (f: F) =>
    f.debugElement
      .queryAll(By.directive(MatRadioGroup))
      .map((d) => d.componentInstance as MatRadioGroup);
  const radios = (f: F, group: number) =>
    f.debugElement
      .queryAll(By.directive(MatRadioGroup))
      [group].queryAll(By.directive(MatRadioButton));
  const checked = (f: F, group: number) =>
    radios(f, group).map((r) => r.componentInstance.checked as boolean);
  const choose = (f: F, group: number, index: number) => {
    (
      radios(f, group)[index].nativeElement.querySelector(
        'input',
      ) as HTMLInputElement
    ).click();
    f.detectChanges();
  };

  it('has a language choice, then a device layout choice', () => {
    const f = create();
    const headings = Array.from(f.nativeElement.querySelectorAll('h1, h2')).map(
      (h) => (h as HTMLElement).textContent!.trim(),
    );
    expect(headings).toEqual([
      en.settings.title,
      en.settings.language.title,
      en.settings.deviceLayout.title,
    ]);
    expect(groups(f).length).toBe(2);
  });

  describe('language', () => {
    it('offers English and 繁體中文, each in its own language, and shows the current one', () => {
      const f = create();
      expect(
        radios(f, 0).map((r) => r.nativeElement.textContent.trim()),
      ).toEqual(['English', '繁體中文']);
      expect(checked(f, 0)).toEqual([true, false]);
    });

    it('switches the site language, and remembers it', () => {
      const f = create();
      choose(f, 0, 1);
      expect(languages.language()).toBe('zh-TW');
      expect(localStorage.getItem('capella:ui-language')).toBe('zh-TW');
      expect(checked(f, 0)).toEqual([false, true]);
    });

    it('shows a language that was already chosen elsewhere', () => {
      languages.setLanguage('zh-TW');
      const f = create();
      expect(checked(f, 0)).toEqual([false, true]);
    });
  });

  describe('device layout', () => {
    it('offers CC1/CC2/CCU and M4G, with a note for M4G only', () => {
      const f = create();
      const texts = radios(f, 1).map((r) =>
        r.nativeElement.textContent.replace(/\s+/g, ' ').trim(),
      );
      expect(texts).toEqual([
        en.settings.deviceLayout.cc1Cc2Ccu,
        `${en.settings.deviceLayout.m4g} ${en.settings.deviceLayout.m4gNote}`,
      ]);
    });

    it('starts on the current device layout', () => {
      const f = create();
      expect(checked(f, 1)).toEqual([true, false]);
    });

    it('switches the device layout and back', () => {
      const f = create();
      choose(f, 1, 1);
      expect(layouts.deviceLayoutId()).toBe('m4g');
      expect(checked(f, 1)).toEqual([false, true]);
      choose(f, 1, 0);
      expect(layouts.deviceLayoutId()).toBe('cc1-cc2-ccu');
      expect(checked(f, 1)).toEqual([true, false]);
    });

    it('does not change the language', () => {
      const f = create();
      choose(f, 1, 1);
      expect(languages.language()).toBe('en');
    });

    it('shows a device layout that was already chosen elsewhere', () => {
      layouts.setDeviceLayoutId('m4g');
      const f = create();
      expect(checked(f, 1)).toEqual([false, true]);
    });
  });
});
