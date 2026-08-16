import {
  ACTIONS,
  ActionType,
  CharacterActionCode,
  DEFAULT_DEVICE_LAYOUT,
  FingerMap,
  HandMap,
  HighlightKeyCombination,
  HighlightSetting,
  KEYBOARD_LAYOUTS_FROM_KBDLAYOUT,
  KeyCombination,
  NonKeyActionName,
  NonWSKCode,
  POSITION_CODE_LAYOUT,
  convertKeyboardLayoutToCharacterKeyCodeMap,
  getCharacterActionCodesFromCharacterKeyCode,
  getHighlightKeyCombinationFromKeyCombinations,
  getKeyCombinationsFromActionCodes,
  getLayerShiftPositionCodeMap,
  getModifierKeyPositionCodeMap,
} from 'tangent-cc-lib';
import { SwitchDirection } from '../components/switch/switch.component';
import { ExerciseStep } from '../models/exercise.models';

export interface DecodedPosition {
  hand: keyof HandMap<unknown>;
  finger: keyof FingerMap<unknown>;
  direction: SwitchDirection;
}

/** Maps a switch's position code to the short text shown on it in the layout diagram. */
export type PositionLabels = Record<number, string>;

/** Short on-switch display text for modifier keys used in 'combo' exercise steps. */
const MODIFIER_SHORT_LABEL: Partial<Record<NonWSKCode, string>> = {
  ControlLeft: 'CTRL',
  ControlRight: 'CTRL',
  AltLeft: 'ALT',
  AltRight: 'ALT',
  ShiftLeft: 'SHIFT',
  ShiftRight: 'SHIFT',
  MetaLeft: 'CMD',
  MetaRight: 'CMD',
};

const US_KEYBOARD_LAYOUT =
  KEYBOARD_LAYOUTS_FROM_KBDLAYOUT.find((layout) => layout.id === 'us') ??
  null;
const CHARACTER_KEY_CODE_MAP =
  convertKeyboardLayoutToCharacterKeyCodeMap(US_KEYBOARD_LAYOUT);
const LAYER_SHIFT_POSITION_CODE_MAP = getLayerShiftPositionCodeMap(
  DEFAULT_DEVICE_LAYOUT,
);
const MODIFIER_KEY_POSITION_CODE_MAP = getModifierKeyPositionCodeMap(
  DEFAULT_DEVICE_LAYOUT,
);

/** Same defaults Alnitak ships (src/app/stores/highlight-setting.store.ts). */
const HIGHLIGHT_SETTING: HighlightSetting = {
  shiftLayer: { preferSides: 'both', preferShiftSide: 'left' },
  numShiftLayer: { preferSides: 'both', preferNumShiftSide: 'left' },
  shiftAndNumShiftLayer: {
    preferShiftSide: 'right',
    preferCharacterKeySide: 'right',
  },
  fnShiftLayer: { preferSides: 'both', preferFnShiftSide: 'left' },
  shiftAndFnShiftLayer: {
    preferShiftSide: 'right',
    preferCharacterKeySide: 'right',
  },
  flagShiftLayer: { preferSides: 'both', preferFlagShiftSide: 'left' },
  shiftAndFlagShiftLayer: {
    preferShiftSide: 'right',
    preferCharacterKeySide: 'right',
  },
};

const POSITION_CODE_TO_DECODED = new Map<number, DecodedPosition>();
(Object.keys(POSITION_CODE_LAYOUT) as (keyof HandMap<unknown>)[]).forEach(
  (hand) => {
    const fingerMap = POSITION_CODE_LAYOUT[hand];
    (Object.keys(fingerMap) as (keyof FingerMap<unknown>)[]).forEach(
      (finger) => {
        const directionMap = fingerMap[finger];
        (Object.keys(directionMap) as SwitchDirection[]).forEach(
          (direction) => {
            POSITION_CODE_TO_DECODED.set(directionMap[direction], {
              hand,
              finger,
              direction,
            });
          },
        );
      },
    );
  },
);

export function decodePositionCode(code: number): DecodedPosition | null {
  return POSITION_CODE_TO_DECODED.get(code) ?? null;
}

/** Short generic label for a held (non-character) switch, based on which modifier/layer-shift it is — or null if it isn't one of the recognized ones (e.g. a 'combo' step's explicit modifier switch, labeled by its caller instead). */
function labelForHeldPosition(
  highlight: HighlightKeyCombination,
  positionCode: number,
): string | null {
  if (MODIFIER_KEY_POSITION_CODE_MAP.shift[highlight.layer]?.includes(positionCode)) {
    return 'SHIFT';
  }
  if (
    MODIFIER_KEY_POSITION_CODE_MAP.altGraph[highlight.layer]?.includes(
      positionCode,
    )
  ) {
    return 'ALT GR';
  }
  if (LAYER_SHIFT_POSITION_CODE_MAP.numShift.includes(positionCode)) {
    return 'NUM';
  }
  if (LAYER_SHIFT_POSITION_CODE_MAP.fnShift.includes(positionCode)) {
    return 'FN';
  }
  if (LAYER_SHIFT_POSITION_CODE_MAP.flagShift.includes(positionCode)) {
    return 'FLAG';
  }
  return null;
}

/**
 * Builds a positionCode -> short display label map for a resolved highlight,
 * for rendering on the layout diagram. `characterLabel` is shown on the
 * character-key switch itself; any other held switches (Shift/layer-shift/
 * AltGr) get a generic short label where recognized; `extra` lets a caller
 * (e.g. a 'combo' step's own modifier switch) supply additional labels that
 * take precedence.
 */
export function buildPositionLabels(
  highlight: HighlightKeyCombination,
  characterLabel: string,
  extra?: PositionLabels,
): PositionLabels {
  const labels: PositionLabels = {
    [highlight.characterKeyPositionCode]: characterLabel,
    ...extra,
  };
  for (const code of highlight.positionCodes) {
    if (code in labels) {
      continue;
    }
    const label = labelForHeldPosition(highlight, code);
    if (label) {
      labels[code] = label;
    }
  }
  return labels;
}

function highlightFromKeyCombinations(
  keyCombinations: KeyCombination[] | null,
): HighlightKeyCombination | null {
  if (!keyCombinations || keyCombinations.length === 0) {
    return null;
  }
  return getHighlightKeyCombinationFromKeyCombinations(
    keyCombinations,
    LAYER_SHIFT_POSITION_CODE_MAP,
    MODIFIER_KEY_POSITION_CODE_MAP,
    HIGHLIGHT_SETTING,
  );
}

/** Resolves a typed character (letter, digit, symbol, or space) to a switch highlight. */
export function resolveCharacterKeyPosition(
  char: string,
): HighlightKeyCombination | null {
  const candidates = CHARACTER_KEY_CODE_MAP.get(char);
  if (!candidates) {
    return null;
  }
  for (const candidate of candidates) {
    const actionCodes =
      getCharacterActionCodesFromCharacterKeyCode(candidate);
    if (actionCodes.length === 0) {
      continue;
    }
    const keyCombinations = getKeyCombinationsFromActionCodes(
      actionCodes,
      DEFAULT_DEVICE_LAYOUT,
    );
    const highlight = highlightFromKeyCombinations(keyCombinations);
    if (highlight) {
      return highlight;
    }
  }
  return null;
}

/** Resolves a non-printing key (Enter, Backspace, arrows, F1-F12, ...) to a switch highlight. */
export function resolveNamedKeyPosition(
  keyCode: NonWSKCode,
): HighlightKeyCombination | null {
  // Some NonWSKCode values (e.g. 'ControlLeft') have more than one action
  // entry with different codeIds — not all of them are necessarily present
  // in DEFAULT_DEVICE_LAYOUT, so every candidate must be tried in turn.
  const candidates = ACTIONS.filter(
    (a) => a.type === ActionType.NonWSK && a.keyCode === keyCode,
  );
  for (const candidate of candidates) {
    const actionCodes: CharacterActionCode[] = [
      { actionCode: candidate.codeId, shiftKey: false, altGraphKey: false },
    ];
    const keyCombinations = getKeyCombinationsFromActionCodes(
      actionCodes,
      DEFAULT_DEVICE_LAYOUT,
    );
    const highlight = highlightFromKeyCombinations(keyCombinations);
    if (highlight) {
      return highlight;
    }
  }
  return null;
}

/** Resolves a non-key action (mouse features, DUP, Ambidextrous Throwover, ...) to a switch highlight. */
export function resolveNonKeyActionPosition(
  actionName: NonKeyActionName,
): HighlightKeyCombination | null {
  const action = ACTIONS.find(
    (a) => a.type === ActionType.NonKey && a.actionName === actionName,
  );
  if (!action) {
    return null;
  }
  const actionCodes: CharacterActionCode[] = [
    { actionCode: action.codeId, shiftKey: false, altGraphKey: false },
  ];
  const keyCombinations = getKeyCombinationsFromActionCodes(
    actionCodes,
    DEFAULT_DEVICE_LAYOUT,
  );
  return highlightFromKeyCombinations(keyCombinations);
}

/** Resolves a modifier + character combo (e.g. Ctrl+C) to a switch highlight. */
export function resolveComboPosition(
  modifierKeyCode: NonWSKCode,
  char: string,
): HighlightKeyCombination | null {
  const modifierHighlight = resolveNamedKeyPosition(modifierKeyCode);
  const characterHighlight = resolveCharacterKeyPosition(char);
  if (!modifierHighlight || !characterHighlight) {
    return null;
  }
  return {
    ...characterHighlight,
    positionCodes: Array.from(
      new Set([
        ...characterHighlight.positionCodes,
        modifierHighlight.characterKeyPositionCode,
      ]),
    ),
  };
}

export interface ChordIllustration {
  highlight: HighlightKeyCombination;
  labels: PositionLabels;
}

/**
 * Combines several characters' switch positions into one illustrative
 * "press these together" highlight — for showing what a chord's input
 * looks like. Not a real trained chord (there's no default chord
 * dictionary); every switch is rendered the same way (as a hold) since a
 * chord has no single "primary" switch the way a modifier combo does.
 */
export function resolveChordIllustration(
  chars: string[],
): ChordIllustration | null {
  const highlights = chars.map((char) => resolveCharacterKeyPosition(char));
  if (highlights.some((highlight) => !highlight)) {
    return null;
  }
  // SwitchComponent can only highlight one direction per switch at a time,
  // so two characters landing on the same switch (different directions)
  // can't both be shown — bail out rather than silently dropping one.
  const switchesUsed = new Set<string>();
  for (const highlight of highlights) {
    const decoded = decodePositionCode(highlight!.characterKeyPositionCode);
    if (!decoded) {
      return null;
    }
    const switchId = `${decoded.hand}-${decoded.finger}`;
    if (switchesUsed.has(switchId)) {
      return null;
    }
    switchesUsed.add(switchId);
  }
  const positionCodes = new Set<number>();
  const labels: PositionLabels = {};
  chars.forEach((char, i) => {
    const highlight = highlights[i]!;
    labels[highlight.characterKeyPositionCode] = char.toUpperCase();
    highlight.positionCodes.forEach((code) => {
      positionCodes.add(code);
      if (!(code in labels)) {
        const heldLabel = labelForHeldPosition(highlight, code);
        if (heldLabel) {
          labels[code] = heldLabel;
        }
      }
    });
    positionCodes.add(highlight.characterKeyPositionCode);
  });
  const highlight: HighlightKeyCombination = {
    characterKeyPositionCode: -1,
    positionCodes: Array.from(positionCodes),
    layer: highlights[0]!.layer,
    shiftKey: false,
    altGraphKey: false,
    score: 0,
  };
  return { highlight, labels };
}

/** Resolves an exercise step to a switch highlight, dispatching by its kind. */
export function resolveStepPosition(
  step: ExerciseStep,
): HighlightKeyCombination | null {
  switch (step.kind) {
    case 'character':
      return resolveCharacterKeyPosition(step.key);
    case 'named-key':
      return resolveNamedKeyPosition(step.key as NonWSKCode);
    case 'mouse':
      return resolveNonKeyActionPosition(step.key as NonKeyActionName);
    case 'dup':
      return resolveNonKeyActionPosition('Dup');
    case 'combo':
      return resolveComboPosition(step.modifier as NonWSKCode, step.key);
  }
}

/** Builds the on-switch labels for a resolved exercise step highlight. */
export function resolveStepLabels(
  step: ExerciseStep,
  highlight: HighlightKeyCombination,
): PositionLabels {
  if (step.kind === 'combo' && step.modifier) {
    const modifierHighlight = resolveNamedKeyPosition(
      step.modifier as NonWSKCode,
    );
    const extra = modifierHighlight
      ? {
          [modifierHighlight.characterKeyPositionCode]:
            MODIFIER_SHORT_LABEL[step.modifier as NonWSKCode] ??
            step.modifier,
        }
      : undefined;
    return buildPositionLabels(highlight, step.key.toUpperCase(), extra);
  }
  if (step.kind === 'character') {
    // Whitespace characters (e.g. Space) render invisibly on the switch —
    // fall back to the step's own human-readable label (e.g. "Space", "␣").
    const characterLabel = step.key.trim() === '' ? step.label : step.key;
    return buildPositionLabels(highlight, characterLabel);
  }
  return buildPositionLabels(highlight, step.label);
}
