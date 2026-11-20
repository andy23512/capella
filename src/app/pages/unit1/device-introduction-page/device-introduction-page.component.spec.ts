import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../../assets/i18n/en.json';
import { UNITS } from '../../../data/units';
import { DeviceLayoutService } from '../../../services/device-layout.service';
import { DEVICES } from '../../../data/devices';
import { DeviceIntroductionPageComponent } from './device-introduction-page.component';

const chapters = UNITS.flatMap((u) => u.chapters);
describe('DeviceIntroductionPageComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslateService()],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId('cc1-cc2-ccu');
  });
  afterEach(() => {
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId('cc1-cc2-ccu');
    localStorage.clear();
  });

  function create() {
    const fixture = TestBed.createComponent(DeviceIntroductionPageComponent);
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const root = (f: F) => f.nativeElement as HTMLElement;
  const text = (f: F) => root(f).textContent!.replace(/\s+/g, ' ');
  const hrefs = (f: F, selector: string) =>
    Array.from(root(f).querySelectorAll(selector)).map((a) =>
      a.getAttribute('href'),
    );

  it('ends with links to the chapters before and after it, in this order', () => {
    const i = chapters.findIndex((c) => c.id === 'device-introduction');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(hrefs(create(), 'app-chapter-nav a')).toEqual(
      [chapters[i - 1], chapters[i + 1]].filter(Boolean).map((c) => c.path),
    );
  });

  it('shows its unit, and its own title as the heading', () => {
    const f = create();
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      en.units['unit-1'].title,
    );
    expect(root(f).querySelector('h1')!.textContent!.trim()).toBe(
      (en.chapters as Record<string, string>)['device-introduction'],
    );
  });

  it('explains the chapter and shows one card for each device, in order', () => {
    const f = create();
    expect(text(f)).toContain(en.deviceIntro.description);
    expect(DEVICES.map((d) => d.name)).toEqual([
      'CharaChorder One',
      'CharaChorder Two',
      'CCU',
      'Master Forge',
    ]);
    expect(
      Array.from(root(f).querySelectorAll('app-device-card h3')).map((h) =>
        h.textContent!.trim(),
      ),
    ).toEqual(DEVICES.map((d) => d.name));
  });
});
