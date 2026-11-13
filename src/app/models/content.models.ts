/**
 * Display text in the content models is stored as translation keys (see
 * src/assets/i18n), not as literal strings. Render them with the `translate`
 * pipe.
 */
export interface ChapterMeta {
  id: string;
  unitId: string;
  titleKey: string;
  path: string;
  /** Unset for a regular numbered chapter; set for a unit's front/back matter. */
  kind?: 'intro' | 'summary';
}

export interface UnitResource {
  labelKey: string;
  /** Translated so a language can point to its own version of the page. */
  urlKey: string;
}

export interface Unit {
  id: string;
  titleKey: string;
  /** The "Unit N" part of the title, used where the full title is too long. */
  shortTitleKey: string;
  introductionKey?: string;
  summaryKey?: string;
  resources?: UnitResource[];
  chapters: ChapterMeta[];
}
