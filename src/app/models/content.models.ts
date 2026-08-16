export interface ChapterMeta {
  id: string;
  unitId: string;
  title: string;
  path: string;
  /** Unset for a regular numbered chapter; set for a unit's front/back matter. */
  kind?: 'intro' | 'summary';
}

export interface UnitResource {
  label: string;
  url: string;
}

export interface Unit {
  id: string;
  title: string;
  introduction?: string;
  summary?: string;
  resources?: UnitResource[];
  chapters: ChapterMeta[];
}
