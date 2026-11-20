import { UNITS } from '../data/units';
import { ChapterMeta } from '../models/content.models';
import { getAdjacentChapters, getChapterNavLabel } from './chapter-nav.utils';

const ALL = UNITS.flatMap((u) => u.chapters);

describe('getAdjacentChapters', () => {
  it('has no previous chapter before the first one', () => {
    const { previous, next } = getAdjacentChapters(ALL[0].id);
    expect(previous).toBeNull();
    expect(next).toBe(ALL[1]);
  });

  it('has no next chapter after the last one', () => {
    const { previous, next } = getAdjacentChapters(ALL[ALL.length - 1].id);
    expect(previous).toBe(ALL[ALL.length - 2]);
    expect(next).toBeNull();
  });

  it('links a middle chapter to both of its neighbours', () => {
    const { previous, next } = getAdjacentChapters(ALL[3].id);
    expect(previous).toBe(ALL[2]);
    expect(next).toBe(ALL[4]);
  });

  it('follows the reading order across unit boundaries', () => {
    const lastOfFirst = UNITS[0].chapters[UNITS[0].chapters.length - 1];
    const { next } = getAdjacentChapters(lastOfFirst.id);
    expect(next).toBe(UNITS[1].chapters[0]);
    expect(getAdjacentChapters(UNITS[1].chapters[0].id).previous).toBe(
      lastOfFirst,
    );
  });

  it('has neither for an unknown chapter', () => {
    expect(getAdjacentChapters('nope')).toEqual({
      previous: null,
      next: null,
    });
  });
});

describe('getChapterNavLabel', () => {
  it('uses the bare title for a numbered chapter', () => {
    const chapter = ALL.find((c) => !c.kind)!;
    expect(getChapterNavLabel(chapter)).toEqual({
      titleKey: chapter.titleKey,
      unitKey: null,
    });
  });

  it('prefixes an introduction with its unit', () => {
    const chapter = UNITS[1].chapters.find((c) => c.kind === 'intro')!;
    expect(getChapterNavLabel(chapter)).toEqual({
      titleKey: chapter.titleKey,
      unitKey: UNITS[1].shortTitleKey,
    });
  });

  it('prefixes a summary with its unit', () => {
    const chapter = UNITS[2].chapters.find((c) => c.kind === 'summary')!;
    expect(getChapterNavLabel(chapter).unitKey).toBe(UNITS[2].shortTitleKey);
  });

  it('has no unit prefix when the unit is unknown', () => {
    const chapter: ChapterMeta = {
      id: 'x',
      unitId: 'missing',
      titleKey: 'chapters.x',
      path: '/x',
      kind: 'intro',
    };
    expect(getChapterNavLabel(chapter)).toEqual({
      titleKey: 'chapters.x',
      unitKey: null,
    });
  });
});
