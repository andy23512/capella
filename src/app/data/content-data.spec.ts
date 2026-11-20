import { APP_ROUTES } from '../app.routes';
import en from '../../assets/i18n/en.json';
import zhTW from '../../assets/i18n/zh-TW.json';
import { DEVICES } from './devices';
import {
  ALL_EXERCISES,
  LETTERS_EXERCISES,
  exercisesForChapter,
  isExerciseAvailable,
} from './exercises';
import * as exerciseData from './exercises';
import { UNITS } from './units';

/** Every leaf of a translation file, as `a.b.c`. */
function leafKeys(node: unknown, prefix = ''): string[] {
  if (node !== null && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) =>
      leafKeys(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

const EN = new Set(leafKeys(en));
const ZH = new Set(leafKeys(zhTW));
const CHAPTERS = UNITS.flatMap((u) => u.chapters);
const unique = (values: string[]) => new Set(values).size === values.length;

describe('units and chapters', () => {
  it('have unique ids', () => {
    expect(unique(UNITS.map((u) => u.id))).toBeTrue();
    expect(unique(CHAPTERS.map((c) => c.id))).toBeTrue();
  });

  it('have unique paths', () => {
    expect(unique(CHAPTERS.map((c) => c.path))).toBeTrue();
  });

  it('keep each chapter under the unit that lists it', () => {
    for (const unit of UNITS) {
      for (const chapter of unit.chapters) {
        expect(chapter.unitId).withContext(chapter.id).toBe(unit.id);
      }
    }
  });

  it('give every unit at most one introduction and one summary', () => {
    for (const unit of UNITS) {
      for (const kind of ['intro', 'summary']) {
        expect(unit.chapters.filter((c) => c.kind === kind).length)
          .withContext(`${unit.id} ${kind}`)
          .toBeLessThanOrEqual(1);
      }
    }
  });

  it('are all reachable through a route', () => {
    const routePaths = new Set(APP_ROUTES.map((r) => `/${r.path}`));
    for (const chapter of CHAPTERS) {
      expect(routePaths.has(chapter.path)).withContext(chapter.path).toBeTrue();
    }
  });

  it('only use translation keys that exist, in both languages', () => {
    const keys = [
      ...UNITS.flatMap((u) => [
        u.titleKey,
        u.shortTitleKey,
        u.introductionKey,
        u.summaryKey,
        ...(u.resources ?? []).flatMap((r) => [r.labelKey, r.urlKey]),
      ]),
      ...CHAPTERS.map((c) => c.titleKey),
    ].filter((k): k is string => !!k);
    for (const key of keys) {
      expect(EN.has(key)).withContext(`en ${key}`).toBeTrue();
      expect(ZH.has(key)).withContext(`zh-TW ${key}`).toBeTrue();
    }
  });
});

describe('devices', () => {
  it('have unique ids', () => {
    expect(unique(DEVICES.map((d) => d.id))).toBeTrue();
  });

  it('only use translation keys that exist, in both languages', () => {
    for (const device of DEVICES) {
      for (const key of [
        device.taglineKey,
        device.descriptionKey,
        device.notesKey,
      ].filter((k): k is string => !!k)) {
        expect(EN.has(key)).withContext(`en ${key}`).toBeTrue();
        expect(ZH.has(key)).withContext(`zh-TW ${key}`).toBeTrue();
      }
    }
  });
});

describe('exercises', () => {
  it('have unique ids', () => {
    expect(unique(ALL_EXERCISES.map((e) => e.id))).toBeTrue();
  });

  it('include every exercise list of the module', () => {
    const lists = Object.values(exerciseData).filter(
      (v): v is typeof ALL_EXERCISES => Array.isArray(v),
    );
    const listed = new Set(lists.flat().map((e) => e.id));
    expect(new Set(ALL_EXERCISES.map((e) => e.id))).toEqual(listed);
  });

  it('belong to a chapter that exists', () => {
    const chapterIds = new Set(CHAPTERS.map((c) => c.id));
    for (const exercise of ALL_EXERCISES) {
      expect(chapterIds.has(exercise.chapterId))
        .withContext(exercise.id)
        .toBeTrue();
    }
  });

  it('each have at least one step, each with something to type', () => {
    for (const exercise of ALL_EXERCISES) {
      expect(exercise.steps.length).withContext(exercise.id).toBeGreaterThan(0);
      for (const step of exercise.steps) {
        expect(step.key)
          .withContext(`${exercise.id} ${step.label}`)
          .not.toBe('');
        expect(step.label).withContext(exercise.id).not.toBe('');
      }
    }
  });

  it('give a chord step the switches to press', () => {
    for (const exercise of ALL_EXERCISES) {
      for (const step of exercise.steps) {
        if (step.kind === 'chord') {
          expect(step.chordChars?.length)
            .withContext(`${exercise.id} ${step.label}`)
            .toBeGreaterThan(1);
        }
      }
    }
  });

  it('give a character or dup step a single character', () => {
    for (const exercise of ALL_EXERCISES) {
      for (const step of exercise.steps) {
        if (step.kind === 'character' || step.kind === 'dup') {
          expect([...step.key].length)
            .withContext(`${exercise.id} ${step.label}`)
            .toBe(1);
        }
      }
    }
  });

  it('only use translation keys that exist, in both languages', () => {
    const keys = ALL_EXERCISES.flatMap((e) => [
      e.titleKey,
      e.descriptionKey,
      ...e.steps.map((s) => s.labelKey),
    ]).filter((k): k is string => !!k);
    for (const key of keys) {
      expect(EN.has(key)).withContext(`en ${key}`).toBeTrue();
      expect(ZH.has(key)).withContext(`zh-TW ${key}`).toBeTrue();
    }
  });

  describe('exercisesForChapter', () => {
    it('lists the exercises of one chapter, in order', () => {
      expect(exercisesForChapter('letters')).toEqual(LETTERS_EXERCISES);
    });

    it('has none for a chapter without exercises or one that does not exist', () => {
      expect(exercisesForChapter('nope')).toEqual([]);
    });
  });

  describe('isExerciseAvailable', () => {
    it('is available everywhere unless a layout is ruled out', () => {
      const free = ALL_EXERCISES.find((e) => !e.unavailableOnDeviceLayouts)!;
      expect(isExerciseAvailable(free, 'cc1-cc2-ccu')).toBeTrue();
      expect(isExerciseAvailable(free, 'm4g')).toBeTrue();
    });

    it('is unavailable only on the layouts it names', () => {
      const limited = ALL_EXERCISES.find((e) => e.unavailableOnDeviceLayouts)!;
      expect(isExerciseAvailable(limited, 'm4g')).toBeFalse();
      expect(isExerciseAvailable(limited, 'cc1-cc2-ccu')).toBeTrue();
    });
  });
});

describe('translation files', () => {
  it('have the same keys in English and Traditional Chinese', () => {
    expect([...EN].filter((k) => !ZH.has(k)))
      .withContext('only in en')
      .toEqual([]);
    expect([...ZH].filter((k) => !EN.has(k)))
      .withContext('only in zh-TW')
      .toEqual([]);
  });

  it('have no empty text', () => {
    const empty = (node: unknown, prefix = ''): string[] =>
      node !== null && typeof node === 'object'
        ? Object.entries(node).flatMap(([k, v]) =>
            empty(v, prefix ? `${prefix}.${k}` : k),
          )
        : typeof node === 'string' && node.trim() === ''
          ? [prefix]
          : [];
    expect(empty(en)).withContext('en').toEqual([]);
    expect(empty(zhTW)).withContext('zh-TW').toEqual([]);
  });
});
