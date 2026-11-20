import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../assets/i18n/en.json';
import { ALL_EXERCISES, exercisesForChapter } from '../../data/exercises';
import { UNITS } from '../../data/units';
import { DeviceLayoutService } from '../../services/device-layout.service';
import { ProgressService } from '../../services/progress.service';
import { LearningMapPageComponent } from './learning-map-page.component';

describe('LearningMapPageComponent', () => {
  let progress: ProgressService;
  let layouts: DeviceLayoutService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslateService()],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    progress = TestBed.inject(ProgressService);
    layouts = TestBed.inject(DeviceLayoutService);
    layouts.setDeviceLayoutId('cc1-cc2-ccu');
  });
  afterEach(() => {
    layouts.setDeviceLayoutId('cc1-cc2-ccu');
    localStorage.clear();
  });

  function create() {
    const fixture = TestBed.createComponent(LearningMapPageComponent);
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const root = (f: F) => f.nativeElement as HTMLElement;
  const totals = (f: F) =>
    Array.from(root(f).querySelectorAll('.mt-6 > div')).map((d) =>
      d.textContent!.replace(/\s+/g, ' ').trim(),
    );
  const items = (f: F) => Array.from(root(f).querySelectorAll('li'));
  const item = (f: F, chapterId: string) => {
    const chapter = UNITS.flatMap((u) => u.chapters).find(
      (c) => c.id === chapterId,
    )!;
    return items(f).find(
      (li) => li.querySelector('a')!.getAttribute('href') === chapter.path,
    )!;
  };
  const chapters = UNITS.flatMap((u) => u.chapters);

  it('lists every unit with its chapters, in order, each linking to its page', () => {
    const f = create();
    const sections = Array.from(root(f).querySelectorAll('section'));
    expect(sections.length).toBe(UNITS.length);
    sections.forEach((s, i) => {
      expect(s.querySelector('h2')!.textContent!.trim()).toBe(
        (en.units as any)[UNITS[i].id].title,
      );
      const hrefs = Array.from(s.querySelectorAll('li > a')).map((a) =>
        a.getAttribute('href'),
      );
      expect(hrefs).toEqual(UNITS[i].chapters.map((c) => c.path));
    });
  });

  describe('totals', () => {
    it('start at zero, out of every chapter and every exercise', () => {
      const f = create();
      expect(totals(f)).toEqual([
        `0 / ${chapters.length} chapters read`,
        `0 / ${ALL_EXERCISES.length} exercises completed`,
      ]);
    });

    it('count chapters read and exercises completed', () => {
      progress.markChapterRead(chapters[0].id);
      progress.markChapterRead(chapters[1].id);
      progress.markExerciseCompleted('az');
      const f = create();
      expect(totals(f)).toEqual([
        `2 / ${chapters.length} chapters read`,
        `1 / ${ALL_EXERCISES.length} exercises completed`,
      ]);
    });

    it('update while shown', () => {
      const f = create();
      progress.markChapterRead(chapters[0].id);
      f.detectChanges();
      expect(totals(f)[0]).toBe(`1 / ${chapters.length} chapters read`);
    });

    it('leave out the exercises the device layout cannot do', () => {
      const unavailable = ALL_EXERCISES.filter((e) =>
        e.unavailableOnDeviceLayouts?.includes('m4g'),
      ).length;
      expect(unavailable).toBeGreaterThan(0);
      layouts.setDeviceLayoutId('m4g');
      const f = create();
      expect(totals(f)[1]).toBe(
        `0 / ${ALL_EXERCISES.length - unavailable} exercises completed`,
      );
    });

    it('do not count a finished exercise that is unavailable on this layout', () => {
      progress.markExerciseCompleted('mouse-clicks');
      layouts.setDeviceLayoutId('m4g');
      expect(totals(create())[1]).toMatch(/^0 \//);
      layouts.setDeviceLayoutId('cc1-cc2-ccu');
      expect(totals(create())[1]).toMatch(/^1 \//);
    });
  });

  describe('chapters', () => {
    const dot = (li: Element) => li.querySelector('span')!;

    it('look unread with a grey dot and no check mark', () => {
      const li = item(create(), 'device-introduction');
      expect(dot(li).classList).toContain('bg-gray-400');
      expect(dot(li).classList).not.toContain('bg-capella-500');
      expect(li.querySelector('mat-icon')).toBeNull();
      expect(li.querySelector('a > span')!.classList).toContain('text-gray-50');
    });

    it('look read with an accent dot, accent title and a check mark', () => {
      progress.markChapterRead('device-introduction');
      const f = create();
      const li = item(f, 'device-introduction');
      expect(dot(li).classList).toContain('bg-capella-500');
      expect(dot(li).classList).not.toContain('bg-gray-400');
      expect(li.querySelector('mat-icon')!.textContent!.trim()).toBe(
        'check_circle',
      );
      expect(li.querySelector('a > span')!.classList).toContain(
        'text-capella-500',
      );
      // others stay unread
      expect(
        item(f, '3d-switch-introduction').querySelector('mat-icon'),
      ).toBeNull();
    });

    it('show their title', () => {
      expect(item(create(), 'device-introduction').textContent).toContain(
        (en.chapters as any)['device-introduction'],
      );
    });
  });

  describe('exercise progress', () => {
    const note = (li: Element) =>
      li.querySelector('p')?.textContent?.trim() ?? null;

    it('is not shown for a chapter without exercises', () => {
      expect(exercisesForChapter('device-introduction').length).toBe(0);
      expect(note(item(create(), 'device-introduction'))).toBeNull();
    });

    it('counts finished exercises of the chapter, in grey until all are done', () => {
      progress.markExerciseCompleted('az');
      const f = create();
      const li = item(f, 'letters');
      expect(note(li)).toBe('1 / 2 exercises completed');
      expect(li.querySelector('p')!.classList).toContain('text-gray-100');
      expect(li.querySelector('p')!.classList).not.toContain(
        'text-capella-500',
      );
    });

    it('turns to the accent colour when every exercise of the chapter is done', () => {
      progress.markExerciseCompleted('az');
      progress.markExerciseCompleted('quick-brown-fox');
      const li = item(create(), 'letters');
      expect(note(li)).toBe('2 / 2 exercises completed');
      expect(li.querySelector('p')!.classList).toContain('text-capella-500');
      expect(li.querySelector('p')!.classList).not.toContain('text-gray-100');
    });

    it('is shown for a chapter with a single exercise too', () => {
      expect(exercisesForChapter('number').length).toBe(1);
      expect(note(item(create(), 'number'))).toBe('0 / 1 exercises completed');
    });

    it('ignores finished exercises of other chapters', () => {
      progress.markExerciseCompleted('0-9');
      expect(note(item(create(), 'letters'))).toBe('0 / 2 exercises completed');
    });

    it('says the exercises are disabled when the layout rules out all of them', () => {
      layouts.setDeviceLayoutId('m4g');
      const li = item(create(), 'mouse-features');
      expect(note(li)).toBe('Exercises disabled on the M4G layout');
      expect(li.querySelector('p')!.classList).toContain('text-gray-300');
    });

    it('does not say that for a chapter that still has some exercises on this layout', () => {
      layouts.setDeviceLayoutId('m4g');
      expect(note(item(create(), 'letters'))).toBe('0 / 2 exercises completed');
    });

    it('follows a change of device layout while shown', () => {
      const f = create();
      expect(note(item(f, 'mouse-features'))).toBe('0 / 3 exercises completed');
      layouts.setDeviceLayoutId('m4g');
      f.detectChanges();
      expect(note(item(f, 'mouse-features'))).toBe(
        'Exercises disabled on the M4G layout',
      );
    });
  });
});
