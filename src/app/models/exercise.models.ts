export type ExerciseStepKind =
  | 'character'
  | 'named-key'
  | 'mouse'
  | 'dup'
  | 'chord';

/**
 * The five Chord Modifier switches — a physical switch held alongside a
 * chord that alters its output rather than replacing it. Capitalization is
 * either Shift switch; Present Tense/Plural are the left/right Ambidextrous
 * Throwover switches; Past Tense/Comparative are the left/right Numeric
 * Layer switches.
 */
export type ChordModifierKind =
  | 'capitalization'
  | 'presentTense'
  | 'plural'
  | 'pastTense'
  | 'comparative';

export interface ExerciseStep {
  /** What the user sees ("A", "Space", "F5", "Left click", "DUP (t)", "B + C"). */
  label: string;
  /** Which input pipeline resolves and detects this step. */
  kind: ExerciseStepKind;
  /**
   * A single character for 'character' and 'dup' steps (for 'dup', the
   * character DUP is expected to repeat), a NonWSKCode name (e.g. 'Enter')
   * for 'named-key' steps, a NonKeyActionName (e.g. 'MouseLeftClick') for
   * 'mouse' steps, or the text the chord types out (e.g. "because", or
   * "working" once a modifier is applied) for 'chord' steps.
   */
  key: string;
  /** For 'chord' steps only — the switches pressed together to fire it (e.g. ['b', 'c']), used to render the highlight. */
  chordChars?: string[];
  /** For 'chord' steps only — a modifier switch held alongside the chord, if any. */
  chordModifier?: ChordModifierKind;
}

export interface Exercise {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  steps: ExerciseStep[];
}
