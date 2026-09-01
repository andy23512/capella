export type ExerciseStepKind = 'character' | 'named-key' | 'mouse' | 'dup';

export interface ExerciseStep {
  /** What the user sees ("A", "Space", "F5", "Left click", "DUP (t)"). */
  label: string;
  /** Which input pipeline resolves and detects this step. */
  kind: ExerciseStepKind;
  /**
   * A single character for 'character' and 'dup' steps (for 'dup', the
   * character DUP is expected to repeat), a NonWSKCode name (e.g. 'Enter')
   * for 'named-key' steps, or a NonKeyActionName (e.g. 'MouseLeftClick') for
   * 'mouse' steps.
   */
  key: string;
}

export interface Exercise {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  steps: ExerciseStep[];
}
