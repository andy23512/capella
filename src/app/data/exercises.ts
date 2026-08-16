import { NonKeyActionName } from 'tangent-cc-lib';
import { Exercise, ExerciseStep } from '../models/exercise.models';

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

function comboStep(label: string, char: string): ExerciseStep {
  return { label, kind: 'combo', key: char, modifier: 'ControlLeft' };
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
    title: '0–9',
    description: 'Every digit, once each, in order.',
    steps: charSteps('0123456789'),
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
    description: 'The arrow keys, plus Home and End.',
    steps: namedSteps([
      ['Arrow Up', 'ArrowUp'],
      ['Arrow Down', 'ArrowDown'],
      ['Arrow Left', 'ArrowLeft'],
      ['Arrow Right', 'ArrowRight'],
      ['Home', 'Home'],
      ['End', 'End'],
    ]),
  },
];

export const FUNCTION_KEYS_EXERCISES: Exercise[] = [
  {
    id: 'f1-f12',
    chapterId: 'function-keys',
    title: 'F1–F12',
    description: 'The full row of function keys, in order.',
    steps: namedSteps(
      Array.from({ length: 12 }, (_, i) => {
        const label = `F${i + 1}`;
        return [label, label] as [string, string];
      }),
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

export const KEY_COMBINATIONS_EXERCISES: Exercise[] = [
  {
    id: 'copy-paste',
    chapterId: 'key-combinations',
    title: 'Copy & Paste',
    description: 'Hold Ctrl and press C to copy, then Ctrl and V to paste.',
    steps: [
      comboStep('Ctrl + C', 'c'),
      comboStep('Ctrl + V', 'v'),
    ],
  },
];

export const ALL_EXERCISES: Exercise[] = [
  ...LETTERS_EXERCISES,
  ...NUMBER_EXERCISES,
  ...SYMBOLS_EXERCISES,
  ...FUNCTIONAL_KEYS_EXERCISES,
  ...FUNCTION_KEYS_EXERCISES,
  ...MOUSE_FEATURES_EXERCISES,
  ...KEY_COMBINATIONS_EXERCISES,
  ...DUP_EXERCISES,
];

export function exercisesForChapter(chapterId: string): Exercise[] {
  return ALL_EXERCISES.filter((exercise) => exercise.chapterId === chapterId);
}
