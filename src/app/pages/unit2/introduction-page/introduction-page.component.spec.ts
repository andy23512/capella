import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../../assets/i18n/en.json';
import { UNITS } from '../../../data/units';
import { DeviceLayoutService } from '../../../services/device-layout.service';
import { Unit2IntroductionPageComponent } from './introduction-page.component';

const chapters = UNITS.flatMap((u) => u.chapters);
describe('Unit2IntroductionPageComponent', () => {
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
    const fixture = TestBed.createComponent(Unit2IntroductionPageComponent);
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
    const i = chapters.findIndex((c) => c.id === 'unit-2-introduction');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(hrefs(create(), 'app-chapter-nav a')).toEqual(
      [chapters[i - 1], chapters[i + 1]].filter(Boolean).map((c) => c.path),
    );
  });

  const note = (f: F) => root(f).querySelector('p.rounded-lg') as HTMLElement;
  const t = en.unit2Intro;

  it('shows the introduction of unit-2, listing its content chapters', () => {
    const f = create();
    const u = UNITS.find((x) => x.id === 'unit-2')!;
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      en.units['unit-2'].title,
    );
    expect(text(f)).toContain(en.units['unit-2'].introduction);
    expect(hrefs(f, 'app-unit-intro ol li a')).toEqual(
      u.chapters.filter((c) => !c.kind).map((c) => c.path),
    );
  });

  it('says the diagrams assume the CC1 / CC2 / CCU layout, linking to the settings', () => {
    const p = note(create());
    const s = p.textContent!.replace(/\s+/g, ' ');
    expect(s).toContain(t.ccBefore);
    expect(s).toContain(t.ccAfter);
    expect(s).not.toContain(t.m4gBefore);
    expect(p.querySelector('a')!.getAttribute('href')).toBe('/settings');
    expect(p.querySelector('a')!.textContent!.trim()).toBe(t.settings);
  });

  it('says the diagrams show the M4G layout when that is selected', () => {
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId('m4g');
    const p = note(create());
    const s = p.textContent!.replace(/\s+/g, ' ');
    expect(s).toContain(t.m4gBefore);
    expect(s).toContain(t.m4gAfter);
    expect(s).not.toContain(t.ccBefore);
    expect(p.querySelector('a')!.getAttribute('href')).toBe('/settings');
  });

  it('follows a change of layout', () => {
    const f = create();
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId('m4g');
    f.detectChanges();
    expect(note(f).textContent).toContain(t.m4gAfter);
  });
});
