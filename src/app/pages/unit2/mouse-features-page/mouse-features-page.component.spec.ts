import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../../assets/i18n/en.json';
import { UNITS } from '../../../data/units';
import { DeviceLayoutService } from '../../../services/device-layout.service';
import { exercisesForChapter } from '../../../data/exercises';
import { MouseFeaturesPageComponent } from './mouse-features-page.component';

const chapters = UNITS.flatMap((u) => u.chapters);
describe('MouseFeaturesPageComponent', () => {
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
    const fixture = TestBed.createComponent(MouseFeaturesPageComponent);
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
    const i = chapters.findIndex((c) => c.id === 'mouse-features');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(hrefs(create(), 'app-chapter-nav a')).toEqual(
      [chapters[i - 1], chapters[i + 1]].filter(Boolean).map((c) => c.path),
    );
  });

  it('shows its unit, and its own title as the heading', () => {
    const f = create();
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      en.units['unit-2'].title,
    );
    expect(root(f).querySelector('h1')!.textContent!.trim()).toBe(
      (en.chapters as Record<string, string>)['mouse-features'],
    );
  });

  const notice = (f: F) => root(f).querySelector('p.rounded-lg');
  const n = en.mouseFeatures.m4gNotice;

  it('explains the chapter', () => {
    expect(text(create())).toContain(en.chapterIntro['mouse-features']);
  });

  it('offers the mouse exercises as links on the CC1 / CC2 / CCU layout, with no notice', () => {
    const f = create();
    expect(notice(f)).toBeNull();
    const exercises = exercisesForChapter('mouse-features');
    expect(exercises.length).toBe(3);
    expect(hrefs(f, 'app-exercise-card a')).toEqual(
      exercises.map((e) => `/exercise/${e.id}`),
    );
  });

  it('on the M4G layout shows the cards as disabled and a notice linking to the settings', () => {
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId('m4g');
    const f = create();
    expect(root(f).querySelectorAll('app-exercise-card').length).toBe(3);
    expect(root(f).querySelectorAll('app-exercise-card a').length).toBe(0);
    expect(
      root(f).querySelectorAll('app-exercise-card [aria-disabled="true"]')
        .length,
    ).toBe(3);
    const p = notice(f)!;
    expect(p.textContent!.replace(/\s+/g, ' ').trim()).toBe(
      `${n.label}${n.before}${n.settings}${n.after}`.replace(/\s+/g, ' '),
    );
    expect(p.querySelector('strong')!.textContent).toBe(n.label);
    expect(p.querySelector('a')!.getAttribute('href')).toBe('/settings');
  });

  it('shows or hides the notice as the layout is switched', () => {
    const f = create();
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId('m4g');
    f.detectChanges();
    expect(notice(f)).not.toBeNull();
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId('cc1-cc2-ccu');
    f.detectChanges();
    expect(notice(f)).toBeNull();
  });
});
