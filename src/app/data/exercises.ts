import { NonKeyActionName } from 'tangent-cc-lib';
import { Exercise, ExerciseStep } from '../models/exercise.models';
import { DeviceLayoutId } from '../services/device-layout.service';

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

/**
 * Named keys whose label is descriptive text and so is translated. The
 * others (Enter, Tab, F5, ...) are keycap names and stay as they are.
 */
const TRANSLATED_NAMED_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'AltLeft',
  'AltRight',
  'ControlLeft',
  'ControlRight',
  'MetaLeft',
  'MetaRight',
]);

function namedSteps(
  labelsAndKeys: [label: string, key: string][],
): ExerciseStep[] {
  return labelsAndKeys.map(([label, key]) => ({
    label,
    labelKey: TRANSLATED_NAMED_KEYS.has(key) ? `stepLabels.${key}` : undefined,
    kind: 'named-key',
    key,
  }));
}

function mouseSteps(
  labelsAndActions: [label: string, key: NonKeyActionName][],
): ExerciseStep[] {
  return labelsAndActions.map(([label, key]) => ({
    label,
    labelKey: `stepLabels.${key}`,
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

function chordStep(chordChars: string[], outputText: string): ExerciseStep {
  return {
    label: chordChars.map((char) => char.toUpperCase()).join(' + '),
    kind: 'chord',
    key: outputText,
    chordChars,
  };
}

export const LETTERS_EXERCISES: Exercise[] = [
  {
    id: 'az',
    chapterId: 'letters',
    titleKey: 'exercises.az.title',
    descriptionKey: 'exercises.az.description',
    steps: charSteps('abcdefghijklmnopqrstuvwxyz'),
  },
  {
    id: 'quick-brown-fox',
    chapterId: 'letters',
    titleKey: 'exercises.quick-brown-fox.title',
    descriptionKey: 'exercises.quick-brown-fox.description',
    steps: charSteps('The quick brown fox jumps over the lazy dog'),
  },
];

export const NUMBER_EXERCISES: Exercise[] = [
  {
    id: '0-9',
    chapterId: 'number',
    titleKey: 'exercises.0-9.title',
    descriptionKey: 'exercises.0-9.description',
    steps: charSteps('1234567890'),
  },
];

export const SYMBOLS_EXERCISES: Exercise[] = [
  {
    id: 'shifted-row',
    chapterId: 'symbols',
    titleKey: 'exercises.shifted-row.title',
    descriptionKey: 'exercises.shifted-row.description',
    steps: charSteps('!@#$%^&*()'),
  },
  {
    id: 'punctuation',
    chapterId: 'symbols',
    titleKey: 'exercises.punctuation.title',
    descriptionKey: 'exercises.punctuation.description',
    steps: charSteps(`-_=+[]{}\\|;:'",.<>/?~`),
  },
];

export const FUNCTIONAL_KEYS_EXERCISES: Exercise[] = [
  {
    id: 'editing',
    chapterId: 'functional-keys',
    titleKey: 'exercises.editing.title',
    descriptionKey: 'exercises.editing.description',
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
    titleKey: 'exercises.navigation.title',
    descriptionKey: 'exercises.navigation.description',
    steps: namedSteps([
      ['Arrow Up', 'ArrowUp'],
      ['Arrow Down', 'ArrowDown'],
      ['Arrow Left', 'ArrowLeft'],
      ['Arrow Right', 'ArrowRight'],
    ]),
  },
  {
    id: 'modifier-keys',
    chapterId: 'functional-keys',
    titleKey: 'exercises.modifier-keys.title',
    descriptionKey: 'exercises.modifier-keys.description',
    steps: namedSteps([
      ['Left Alt', 'AltLeft'],
      ['Right Alt', 'AltRight'],
      ['Left Control', 'ControlLeft'],
      ['Right Control', 'ControlRight'],
      ['Left Meta', 'MetaLeft'],
      ['Right Meta', 'MetaRight'],
    ]),
  },
];

export const FUNCTION_KEYS_EXERCISES: Exercise[] = [
  {
    id: 'f1-f12',
    chapterId: 'function-keys',
    titleKey: 'exercises.f1-f12.title',
    descriptionKey: 'exercises.f1-f12.description',
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
    titleKey: 'exercises.mouse-movement.title',
    descriptionKey: 'exercises.mouse-movement.description',
    unavailableOnDeviceLayouts: ['m4g'],
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
    titleKey: 'exercises.mouse-clicks.title',
    descriptionKey: 'exercises.mouse-clicks.description',
    unavailableOnDeviceLayouts: ['m4g'],
    steps: mouseSteps([
      ['Left click', 'MouseLeftClick'],
      ['Right click', 'MouseRightClick'],
    ]),
  },
  {
    id: 'mouse-scroll',
    chapterId: 'mouse-features',
    titleKey: 'exercises.mouse-scroll.title',
    descriptionKey: 'exercises.mouse-scroll.description',
    unavailableOnDeviceLayouts: ['m4g'],
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
    titleKey: 'exercises.because-chord.title',
    descriptionKey: 'exercises.because-chord.description',
    steps: [
      chordStep(['b', 'c'], 'because'),
      chordStep(['b', 'c'], 'because'),
      chordStep(['b', 'c'], 'because'),
    ],
  },
];

export const DUP_EXERCISES: Exercise[] = [
  {
    id: 'double-letters',
    chapterId: 'dup',
    titleKey: 'exercises.double-letters.title',
    descriptionKey: 'exercises.double-letters.description',
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
  ...DUP_EXERCISES,
];

export function isExerciseAvailable(
  exercise: Exercise,
  deviceLayoutId: DeviceLayoutId,
): boolean {
  return !exercise.unavailableOnDeviceLayouts?.includes(deviceLayoutId);
}

export function exercisesForChapter(chapterId: string): Exercise[] {
  return ALL_EXERCISES.filter((exercise) => exercise.chapterId === chapterId);
}
