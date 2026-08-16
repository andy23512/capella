import { UNITS } from '../data/units';
import { ChapterMeta } from '../models/content.models';

export interface AdjacentChapters {
  previous: ChapterMeta | null;
  next: ChapterMeta | null;
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
 * Sidenav groups chapters under their unit, so a bare "Introduction"/"Summary"
 * title is unambiguous there. Chapter-nav buttons lack that grouping context,
 * so front/back-matter chapters are prefixed with their unit here instead.
 */
export function getChapterNavLabel(chapter: ChapterMeta): string {
  if (!chapter.kind) {
    return chapter.title;
  }
  const unit = UNITS.find((u) => u.id === chapter.unitId);
  const unitPrefix = unit?.title.split(':')[0].trim() ?? chapter.unitId;
  return `${unitPrefix}: ${chapter.title}`;
}
