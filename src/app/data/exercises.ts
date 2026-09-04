import { NonKeyActionName } from 'tangent-cc-lib';
import {
  ChordModifierKind,
  Exercise,
  ExerciseStep,
} from '../models/exercise.models';

function charSteps(text: string): ExerciseStep[] {
  return [...text].map((char) => ({
    label: char === ' ' ? '␣' : char,
    kind: 'character',
    key: char,
  }));
}

function characterStep(label: string, char: string): ExerciseStep {
  return { label, kind: 'character', key: char };
}

function namedSteps(
  labelsAndKeys: [label: string, key: string][],
): ExerciseStep[] {
  return labelsAndKeys.map(([label, key]) => ({
    label,
    kind: 'named-key',
    key,
  }));
}

function mouseSteps(
  labelsAndActions: [label: string, key: NonKeyActionName][],
): ExerciseStep[] {
  return labelsAndActions.map(([label, key]) => ({
    label,
    kind: 'mouse',
    key,
  }));
}

/** A letter followed by DUP repeating it, e.g. the "tt" in "letter". */
function dupPairSteps(chars: string[]): ExerciseStep[] {
  return chars.flatMap((char) => [
    characterStep(char, char),
    { label: `DUP (${char})`, kind: 'dup', key: char },
  ]);
}

function chordStep(
  chordChars: string[],
  outputText: string,
): ExerciseStep {
  return {
    label: chordChars.map((char) => char.toUpperCase()).join(' + '),
    kind: 'chord',
    key: outputText,
    chordChars,
  };
}

const CHORD_MODIFIER_LABEL: Record<ChordModifierKind, string> = {
  capitalization: 'Capitalization',
  presentTense: 'Present Tense',
  plural: 'Plural',
  pastTense: 'Past Tense',
  comparative: 'Comparative',
};

/** A chord fired together with a Chord Modifier switch, e.g. the "work" chord + Present Tense for "working". */
function chordModifierStep(
  chordChars: string[],
  modifier: ChordModifierKind,
  outputText: string,
): ExerciseStep {
  return {
    label: `${chordChars.map((char) => char.toUpperCase()).join(' + ')} → ${CHORD_MODIFIER_LABEL[modifier]}`,
    kind: 'chord',
    key: outputText,
    chordChars,
    chordModifier: modifier,
  };
}

export const LETTERS_EXERCISES: Exercise[] = [
  {
    id: 'az',
    chapterId: 'letters',
    title: 'A–Z',
    description: 'Every letter of the alphabet, once each, in order.',
    steps: charSteps('abcdefghijklmnopqrstuvwxyz'),
  },
  {
    id: 'quick-brown-fox',
    chapterId: 'letters',
    title: 'Quick Brown Fox',
    description:
      'A classic pangram — every letter appears at least once, plus a capital and spaces.',
    steps: charSteps('The quick brown fox jumps over the lazy dog'),
  },
];

export const NUMBER_EXERCISES: Exercise[] = [
  {
    id: '0-9',
    chapterId: 'number',
    title: '1–0',
    description: 'Every digit, once each, in order.',
    steps: charSteps('1234567890'),
  },
];

export const SYMBOLS_EXERCISES: Exercise[] = [
  {
    id: 'shifted-row',
    chapterId: 'symbols',
    title: 'Number-row symbols',
    description: 'The shifted symbols above the number row: ! @ # $ % ^ & * ( )',
    steps: charSteps('!@#$%^&*()'),
  },
  {
    id: 'punctuation',
    chapterId: 'symbols',
    title: 'Punctuation & other symbols',
    description: 'The rest of the standard symbol set, including quotes and brackets.',
    steps: charSteps(`-_=+[]{}\\|;:'",.<>/?~`),
  },
];

export const FUNCTIONAL_KEYS_EXERCISES: Exercise[] = [
  {
    id: 'editing',
    chapterId: 'functional-keys',
    title: 'Editing keys',
    description: 'Space, Enter, Backspace, Tab, Delete, and Escape.',
    steps: [
      characterStep('Space', ' '),
      ...namedSteps([
        ['Enter', 'Enter'],
        ['Backspace', 'Backspace'],
        ['Tab', 'Tab'],
        ['Delete', 'Delete'],
        ['Escape', 'Escape'],
      ]),
    ],
  },
  {
    id: 'navigation',
    chapterId: 'functional-keys',
    title: 'Navigation keys',
    description: 'The arrow keys.',
    steps: namedSteps([
      ['Arrow Up', 'ArrowUp'],
      ['Arrow Down', 'ArrowDown'],
      ['Arrow Left', 'ArrowLeft'],
      ['Arrow Right', 'ArrowRight'],
    ]),
  },
];

export const FUNCTION_KEYS_EXERCISES: Exercise[] = [
  {
    id: 'f1-f12',
    chapterId: 'function-keys',
    title: 'F1–F12',
    description:
      'The full row of function keys, in order. F11 is skipped since it is bound to a system-level shortcut (e.g. Show Desktop on macOS) and cannot be captured by the browser.',
    steps: namedSteps(
      Array.from({ length: 12 }, (_, i) => `F${i + 1}`)
        .filter((label) => label !== 'F11')
        .map((label) => [label, label] as [string, string]),
    ),
  },
];

export const MOUSE_FEATURES_EXERCISES: Exercise[] = [
  {
    id: 'mouse-movement',
    chapterId: 'mouse-features',
    title: 'Cursor movement',
    description: 'Nudge the mouse cursor up, down, left, and right.',
    steps: mouseSteps([
      ['Move up', 'MouseMoveUp'],
      ['Move down', 'MouseMoveDown'],
      ['Move left', 'MouseMoveLeft'],
      ['Move right', 'MouseMoveRight'],
    ]),
  },
  {
    id: 'mouse-clicks',
    chapterId: 'mouse-features',
    title: 'Left & right click',
    description: 'A left click, then a right click.',
    steps: mouseSteps([
      ['Left click', 'MouseLeftClick'],
      ['Right click', 'MouseRightClick'],
    ]),
  },
  {
    id: 'mouse-scroll',
    chapterId: 'mouse-features',
    title: 'Scrolling',
    description: 'Scroll up, down, left, and right.',
    steps: mouseSteps([
      ['Scroll up', 'MouseScrollCoastUp'],
      ['Scroll down', 'MouseScrollCoastDown'],
      ['Scroll left', 'MouseScrollCoastLeft'],
      ['Scroll right', 'MouseScrollCoastRight'],
    ]),
  },
];

export const SIMPLE_CHORD_EXERCISES: Exercise[] = [
  {
    id: 'because-chord',
    chapterId: 'simple-chord',
    title: '"because" starter chord',
    description:
      'Press B and C together — within the device\'s Press/Release Tolerance — to fire the built-in "because" chord. Three reps.',
    steps: [
      chordStep(['b', 'c'], 'because'),
      chordStep(['b', 'c'], 'because'),
      chordStep(['b', 'c'], 'because'),
    ],
  },
];

export const CHORD_MODIFIER_EXERCISES: Exercise[] = [
  {
    id: 'chord-modifier-capitalization',
    chapterId: 'chord-modifier',
    title: 'Capitalization',
    description:
      'Fire the "run" starter chord, then immediately tap either Shift switch — arpeggiately — to capitalize its output: "Run". Three reps.',
    steps: [
      chordModifierStep(['n', 'r', 'u'], 'capitalization', 'Run'),
      chordModifierStep(['n', 'r', 'u'], 'capitalization', 'Run'),
      chordModifierStep(['n', 'r', 'u'], 'capitalization', 'Run'),
    ],
  },
  {
    id: 'chord-modifier-present-tense',
    chapterId: 'chord-modifier',
    title: 'Present Tense',
    description:
      'Fire the "work" starter chord, then immediately tap the left AT (Ambidextrous Throwover) switch — arpeggiately — to turn it into "working". Three reps.',
    steps: [
      chordModifierStep(['o', 'r', 'w'], 'presentTense', 'working'),
      chordModifierStep(['o', 'r', 'w'], 'presentTense', 'working'),
      chordModifierStep(['o', 'r', 'w'], 'presentTense', 'working'),
    ],
  },
  {
    id: 'chord-modifier-plural',
    chapterId: 'chord-modifier',
    title: 'Plural',
    description:
      'Fire the "book" starter chord, then immediately tap the right AT (Ambidextrous Throwover) switch — arpeggiately — to turn it into "books". Three reps.',
    steps: [
      chordModifierStep(['b', 'k', 'o'], 'plural', 'books'),
      chordModifierStep(['b', 'k', 'o'], 'plural', 'books'),
      chordModifierStep(['b', 'k', 'o'], 'plural', 'books'),
    ],
  },
  {
    id: 'chord-modifier-past-tense',
    chapterId: 'chord-modifier',
    title: 'Past Tense',
    description:
      'Fire the "help" starter chord, then immediately tap the left Numeric Layer switch — arpeggiately — to turn it into "helped". Three reps.',
    steps: [
      chordModifierStep(['e', 'h', 'l'], 'pastTense', 'helped'),
      chordModifierStep(['e', 'h', 'l'], 'pastTense', 'helped'),
      chordModifierStep(['e', 'h', 'l'], 'pastTense', 'helped'),
    ],
  },
  {
    id: 'chord-modifier-comparative',
    chapterId: 'chord-modifier',
    title: 'Comparative',
    description:
      'Fire the "small" starter chord, then immediately tap the right Numeric Layer switch — arpeggiately — to turn it into "smaller". Three reps.',
    steps: [
      chordModifierStep(['a', 'm', 's'], 'comparative', 'smaller'),
      chordModifierStep(['a', 'm', 's'], 'comparative', 'smaller'),
      chordModifierStep(['a', 'm', 's'], 'comparative', 'smaller'),
    ],
  },
];

export const DUP_EXERCISES: Exercise[] = [
  {
    id: 'double-letters',
    chapterId: 'dup',
    title: 'Double letters',
    description:
      'Type a letter, then press DUP to repeat it — the same trick works for any double letter, like the "tt" in "letter".',
    steps: dupPairSteps(['t', 's', 'e']),
  },
];

export const ALL_EXERCISES: Exercise[] = [
  ...LETTERS_EXERCISES,
  ...NUMBER_EXERCISES,
  ...SYMBOLS_EXERCISES,
  ...FUNCTIONAL_KEYS_EXERCISES,
  ...FUNCTION_KEYS_EXERCISES,
  ...MOUSE_FEATURES_EXERCISES,
  ...SIMPLE_CHORD_EXERCISES,
  ...CHORD_MODIFIER_EXERCISES,
  ...DUP_EXERCISES,
];

export function exercisesForChapter(chapterId: string): Exercise[] {
  return ALL_EXERCISES.filter((exercise) => exercise.chapterId === chapterId);
}
