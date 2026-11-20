import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../../assets/i18n/en.json';
import { UNITS } from '../../../data/units';
import { DeviceLayoutService } from '../../../services/device-layout.service';
import { exercisesForChapter } from '../../../data/exercises';
import { DupPageComponent } from './dup-page.component';

const chapters = UNITS.flatMap((u) => u.chapters);
describe('DupPageComponent', () => {
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
    const fixture = TestBed.createComponent(DupPageComponent);
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
    const i = chapters.findIndex((c) => c.id === 'dup');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(hrefs(create(), 'app-chapter-nav a')).toEqual(
      [chapters[i - 1], chapters[i + 1]].filter(Boolean).map((c) => c.path),
    );
  });

  it('shows its unit, and its own title as the heading', () => {
    const f = create();
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      en.units['unit-3'].title,
    );
    expect(root(f).querySelector('h1')!.textContent!.trim()).toBe(
      (en.chapters as Record<string, string>)['dup'],
    );
  });

  it('explains the chapter', () => {
    const f = create();
    expect(text(f)).toContain(en.dupPage.intro1);
    expect(text(f)).toContain(en.dupPage.intro2);
  });

  it('offers exactly the exercises of this chapter, in order', () => {
    const f = create();
    const exercises = exercisesForChapter('dup');
    expect(exercises.length).toBeGreaterThan(0);
    expect(hrefs(f, 'app-exercise-card a')).toEqual(
      exercises.map((e) => `/exercise/${e.id}`),
    );
    expect(root(f).querySelectorAll('app-exercise-card').length).toBe(
      exercises.length,
    );
  });
});
