export type ExerciseStepKind =
  | 'character'
  | 'named-key'
  | 'mouse'
  | 'dup'
  | 'chord';

export interface ExerciseStep {
  /** What the user sees ("A", "Space", "F5", "Left click", "DUP (t)", "B + C"). */
  label: string;
  /** Which input pipeline resolves and detects this step. */
  kind: ExerciseStepKind;
  /**
   * A single character for 'character' and 'dup' steps (for 'dup', the
   * character DUP is expected to repeat), a NonWSKCode name (e.g. 'Enter')
   * for 'named-key' steps, a NonKeyActionName (e.g. 'MouseLeftClick') for
   * 'mouse' steps, or the text the chord types out (e.g. "because") for
   * 'chord' steps.
   */
  key: string;
  /** For 'chord' steps only — the switches pressed together to fire it (e.g. ['b', 'c']), used to render the highlight. */
  chordChars?: string[];
}

export interface Exercise {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  steps: ExerciseStep[];
}
