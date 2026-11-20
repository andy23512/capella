import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../../assets/i18n/en.json';
import { UNITS } from '../../../data/units';
import { DeviceLayoutService } from '../../../services/device-layout.service';
import { exercisesForChapter } from '../../../data/exercises';
import { resolveChordIllustration } from '../../../utils/key-position.utils';
import { SimpleChordPageComponent } from './simple-chord-page.component';

const chapters = UNITS.flatMap((u) => u.chapters);
describe('SimpleChordPageComponent', () => {
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
    const fixture = TestBed.createComponent(SimpleChordPageComponent);
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
    const i = chapters.findIndex((c) => c.id === 'simple-chord');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(hrefs(create(), 'app-chapter-nav a')).toEqual(
      [chapters[i - 1], chapters[i + 1]].filter(Boolean).map((c) => c.path),
    );
  });

  it('shows its unit, and its own title as the heading', () => {
    const f = create();
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      en.units['unit-4'].title,
    );
    expect(root(f).querySelector('h1')!.textContent!.trim()).toBe(
      (en.chapters as Record<string, string>)['simple-chord'],
    );
  });

  const t = en.simpleChordPage;

  it('explains simple chords, with key terms in bold', () => {
    const f = create();
    expect(root(f).querySelectorAll('p strong').length).toBeGreaterThanOrEqual(
      2,
    );
    expect(text(f)).toContain(t.fluidNote);
    expect(text(f)).toContain(t.tryIt);
    expect(text(f)).toContain(t.tryItIntro);
  });

  it('draws the B + C chord on the layout, under its caption', () => {
    const f = create();
    const chord = resolveChordIllustration(['b', 'c'])!;
    expect(text(f)).toContain(t.diagramCaption);
    const lit = Array.from(
      root(f).querySelectorAll('app-layout g[appGridSwitch]'),
    ).filter((g) => g.querySelector('.fill-capella-500, .fill-blue-400'));
    expect(lit.length).toBeGreaterThan(0);
    const labels = Array.from(root(f).querySelectorAll('app-layout text')).map(
      (x) => x.textContent!.trim(),
    );
    expect(labels.sort()).toEqual(
      Object.values(chord.labels)
        .map((l) => l.text)
        .sort(),
    );
  });

  it('offers the chord exercise', () => {
    const f = create();
    expect(exercisesForChapter('simple-chord').length).toBe(1);
    expect(hrefs(f, 'app-exercise-card a')).toEqual([
      '/exercise/because-chord',
    ]);
  });
});
