export type ExerciseStepKind =
  | 'character'
  | 'named-key'
  | 'mouse'
  | 'dup'
  | 'combo';

export interface ExerciseStep {
  /** What the user sees ("A", "Space", "F5", "Left click", "DUP (t)", "Ctrl + C"). */
  label: string;
  /** Which input pipeline resolves and detects this step. */
  kind: ExerciseStepKind;
  /**
   * A single character for 'character' and 'dup' steps (for 'dup', the
   * character DUP is expected to repeat), a NonWSKCode name (e.g. 'Enter')
   * for 'named-key' steps, a NonKeyActionName (e.g. 'MouseLeftClick') for
   * 'mouse' steps, or the character held with `modifier` for 'combo' steps.
   */
  key: string;
  /** For 'combo' steps: the NonWSKCode of the modifier held down (e.g. 'ControlLeft'). */
  modifier?: string;
}

export interface Exercise {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  steps: ExerciseStep[];
}
