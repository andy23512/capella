import { UNITS } from '../data/units';
import { ChapterMeta } from '../models/content.models';

export interface AdjacentChapters {
  previous: ChapterMeta | null;
  next: ChapterMeta | null;
}

export interface ChapterNavLabel {
  titleKey: string;
  /** Set when the label needs a unit prefix; unset for a bare chapter title. */
  unitKey: string | null;
}

export function getAdjacentChapters(chapterId: string): AdjacentChapters {
  const chapters = UNITS.flatMap((unit) => unit.chapters);
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);
  if (index === -1) {
    return { previous: null, next: null };
  }
  return {
    previous: index === 0 ? null : chapters[index - 1],
    next: index === chapters.length - 1 ? null : chapters[index + 1],
  };
}

/**
 * The sidenav groups chapters under their unit, so a bare "Introduction"/"Summary"
 * title is unambiguous there. Chapter-nav buttons lack that grouping context,
 * so front/back-matter chapters are prefixed with their unit here instead.
 * Returns translation keys; the template joins them with `chapterNav.withUnit`.
 */
export function getChapterNavLabel(chapter: ChapterMeta): ChapterNavLabel {
  if (!chapter.kind) {
    return { titleKey: chapter.titleKey, unitKey: null };
  }
  const unit = UNITS.find((u) => u.id === chapter.unitId);
  return { titleKey: chapter.titleKey, unitKey: unit?.shortTitleKey ?? null };
}
