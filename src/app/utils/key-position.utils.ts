import {
  ACTIONS,
  ActionType,
  ALT_GRAPH_KEY_LABEL,
  CharacterActionCode,
  DEFAULT_DEVICE_LAYOUT,
  DeviceLayout,
  FLAG_SHIFT_KEY_LABEL,
  FN_SHIFT_KEY_LABEL,
  FingerMap,
  HandMap,
  HighlightKeyCombination,
  HighlightSetting,
  KEYBOARD_LAYOUTS_FROM_KBDLAYOUT,
  KeyCombination,
  KeyLabelType,
  M4G_DEFAULT_DEVICE_LAYOUT,
  NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP,
  NON_WSK_CODE_2_RAW_KEY_LABEL_MAP,
  NUM_SHIFT_KEY_LABEL,
  NonKeyActionName,
  NonWSKCode,
  POSITION_CODE_LAYOUT,
  RawKeyLabel,
  SHIFT_KEY_LABEL,
  convertKeyboardLayoutToCharacterKeyCodeMap,
  getCharacterActionCodesFromCharacterKeyCode,
  getHighlightKeyCombinationFromKeyCombinations,
  getKeyCombinationsFromActionCodes,
  getLayerShiftPositionCodeMap,
  getModifierKeyPositionCodeMap,
} from 'tangent-cc-lib';
import { SwitchDirection } from '../components/switch/switch.component';
import { ChordModifierKind, ExerciseStep } from '../models/exercise.models';
import {
  DeviceLayoutId,
  deviceLayoutId,
} from '../services/device-layout.service';

export type Hand = keyof HandMap<unknown>;
type Finger = keyof FingerMap<unknown>;

export interface DecodedPosition {
  hand: Hand;
  finger: Finger;
  direction: SwitchDirection;
}

/** A switch's on-diagram label — plain text, or (when `icon` is set) a Material Icons ligature name. */
export interface PositionLabel {
  readonly text: string;
  readonly icon?: boolean;
}

/** Maps a switch's position code to the label shown on it in the layout diagram. */
export type PositionLabels = Record<number, PositionLabel>;

/**
 * Converts a tangent-cc-lib key label to Capella's on-switch label format.
 * Only String and Icon ever occur across the labels Capella references
 * (NON_WSK_CODE_2_RAW_KEY_LABEL_MAP, NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP,
 * and the individual SHIFT/NUM_SHIFT/FN_SHIFT/FLAG_SHIFT/ALT_GRAPH
 * constants) — Logo and ActionCode have no PositionLabel rendering yet
 * because no exercise triggers one.
 */
function toPositionLabel(rawLabel: RawKeyLabel): PositionLabel {
  switch (rawLabel.type) {
    case KeyLabelType.String:
      return { text: rawLabel.c };
    case KeyLabelType.Icon:
      return { text: rawLabel.c, icon: true };
    case KeyLabelType.Logo:
    case KeyLabelType.ActionCode:
      throw new Error(
        `No PositionLabel rendering for tangent-cc-lib's "${rawLabel.type}" key labels yet.`,
      );
  }
}

const US_KEYBOARD_LAYOUT =
  KEYBOARD_LAYOUTS_FROM_KBDLAYOUT.find((layout) => layout.id === 'us') ??
  null;
const CHARACTER_KEY_CODE_MAP =
  convertKeyboardLayoutToCharacterKeyCodeMap(US_KEYBOARD_LAYOUT);

const DEVICE_LAYOUTS: Record<DeviceLayoutId, DeviceLayout> = {
  'cc1-cc2-ccu': DEFAULT_DEVICE_LAYOUT,
  m4g: M4G_DEFAULT_DEVICE_LAYOUT,
};

interface DerivedLayoutData {
  layerShiftPositionCodeMap: ReturnType<typeof getLayerShiftPositionCodeMap>;
  modifierKeyPositionCodeMap: ReturnType<typeof getModifierKeyPositionCodeMap>;
}

const DERIVED_LAYOUT_DATA_CACHE = new Map<DeviceLayoutId, DerivedLayoutData>();

function activeDeviceLayout(): DeviceLayout {
  return DEVICE_LAYOUTS[deviceLayoutId()];
}

/** Lazily derived, per-device-layout data — memoized so switching layouts doesn't recompute a layout already visited. */
function activeDerivedLayoutData(): DerivedLayoutData {
  const id = deviceLayoutId();
  const cached = DERIVED_LAYOUT_DATA_CACHE.get(id);
  if (cached) {
    return cached;
  }
  const layout = DEVICE_LAYOUTS[id];
  const derived: DerivedLayoutData = {
    layerShiftPositionCodeMap: getLayerShiftPositionCodeMap(layout),
    modifierKeyPositionCodeMap: getModifierKeyPositionCodeMap(layout),
  };
  DERIVED_LAYOUT_DATA_CACHE.set(id, derived);
  return derived;
}

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

/** Short generic label for a held (non-character) switch, based on which modifier/layer-shift it is — or null if it isn't one of the recognized ones. */
function labelForHeldPosition(
  highlight: HighlightKeyCombination,
  positionCode: number,
): PositionLabel | null {
  const { layerShiftPositionCodeMap, modifierKeyPositionCodeMap } =
    activeDerivedLayoutData();
  if (modifierKeyPositionCodeMap.shift[highlight.layer]?.includes(positionCode)) {
    return toPositionLabel(SHIFT_KEY_LABEL);
  }
  if (
    modifierKeyPositionCodeMap.altGraph[highlight.layer]?.includes(
      positionCode,
    )
  ) {
    return toPositionLabel(ALT_GRAPH_KEY_LABEL);
  }
  if (layerShiftPositionCodeMap.numShift.includes(positionCode)) {
    return toPositionLabel(NUM_SHIFT_KEY_LABEL);
  }
  if (layerShiftPositionCodeMap.fnShift.includes(positionCode)) {
    return toPositionLabel(FN_SHIFT_KEY_LABEL);
  }
  if (layerShiftPositionCodeMap.flagShift.includes(positionCode)) {
    return toPositionLabel(FLAG_SHIFT_KEY_LABEL);
  }
  return null;
}

/**
 * Builds a positionCode -> short display label map for a resolved highlight,
 * for rendering on the layout diagram. `characterLabel` is shown on the
 * character-key switch itself; any other held switches (Shift/layer-shift/
 * AltGr) get a generic short label where recognized; `extra` lets a caller
 * supply additional labels that take precedence.
 */
export function buildPositionLabels(
  highlight: HighlightKeyCombination,
  characterLabel: PositionLabel,
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
  const { layerShiftPositionCodeMap, modifierKeyPositionCodeMap } =
    activeDerivedLayoutData();
  return getHighlightKeyCombinationFromKeyCombinations(
    keyCombinations,
    layerShiftPositionCodeMap,
    modifierKeyPositionCodeMap,
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
  const layout = activeDeviceLayout();
  for (const candidate of candidates) {
    const actionCodes =
      getCharacterActionCodesFromCharacterKeyCode(candidate);
    if (actionCodes.length === 0) {
      continue;
    }
    const keyCombinations = getKeyCombinationsFromActionCodes(
      actionCodes,
      layout,
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
  const layout = activeDeviceLayout();
  for (const candidate of candidates) {
    const actionCodes: CharacterActionCode[] = [
      { actionCode: candidate.codeId, shiftKey: false, altGraphKey: false },
    ];
    const keyCombinations = getKeyCombinationsFromActionCodes(
      actionCodes,
      layout,
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
    activeDeviceLayout(),
  );
  return highlightFromKeyCombinations(keyCombinations);
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

/** Which tilt direction a switch's letter comes from when Ambidextrous Throwover mirrors the opposite hand onto it — center/north/south stay put, east and west swap since the mirror is left-right. */
const MIRROR_DIRECTION: Record<SwitchDirection, SwitchDirection> = {
  c: 'c',
  n: 'n',
  s: 's',
  e: 'w',
  w: 'e',
};

const OPPOSITE_HAND: Record<Hand, Hand> = { left: 'right', right: 'left' };

/** Every letter's switch position in the default (unmirrored) layout. */
export function buildAlphabetLabels(): PositionLabels {
  const labels: PositionLabels = {};
  for (const char of ALPHABET) {
    const highlight = resolveCharacterKeyPosition(char);
    if (highlight) {
      labels[highlight.characterKeyPositionCode] = { text: char.toUpperCase() };
    }
  }
  return labels;
}

/**
 * The alphabet layout as it appears while `activeHand`'s Ambidextrous
 * Throwover switch is held: every switch on that hand takes on the opposite
 * hand's letter at the same finger and mirrored tilt direction (north/south/
 * center unchanged, east/west swapped), and shows nothing if the opposite
 * hand's mirrored switch isn't a letter. The other hand keeps its own
 * default letters.
 */
export function buildAmbidextrousThrowoverLabels(
  activeHand: Hand | null,
): PositionLabels {
  const base = buildAlphabetLabels();
  if (!activeHand) {
    return base;
  }
  const labels: PositionLabels = { ...base };
  const sourceHand = OPPOSITE_HAND[activeHand];
  (Object.keys(POSITION_CODE_LAYOUT[activeHand]) as Finger[]).forEach(
    (finger) => {
      const targetDirections = POSITION_CODE_LAYOUT[activeHand][finger];
      const sourceDirections = POSITION_CODE_LAYOUT[sourceHand][finger];
      (Object.keys(targetDirections) as SwitchDirection[]).forEach(
        (direction) => {
          const targetCode = targetDirections[direction];
          const sourceCode = sourceDirections[MIRROR_DIRECTION[direction]];
          const sourceLabel = base[sourceCode];
          if (sourceLabel) {
            labels[targetCode] = sourceLabel;
          } else {
            delete labels[targetCode];
          }
        },
      );
    },
  );
  return labels;
}

/** On-switch label for each Chord Modifier switch, reusing tangent-cc-lib's labels for the same switches elsewhere (Shift, the Ambidextrous Throwover switches, and the Numeric Layer switches). */
const CHORD_MODIFIER_LABEL: Record<ChordModifierKind, PositionLabel> = {
  capitalization: toPositionLabel(SHIFT_KEY_LABEL),
  presentTense: toPositionLabel(
    NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP.AmbidextrousThrowoverLeft,
  ),
  plural: toPositionLabel(
    NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP.AmbidextrousThrowoverRight,
  ),
  pastTense: toPositionLabel(NUM_SHIFT_KEY_LABEL),
  comparative: toPositionLabel(NUM_SHIFT_KEY_LABEL),
};

/** First position code among `codes` that decodes to `hand`, or null if none does. */
function pickHandPositionCode(codes: number[], hand: Hand): number | null {
  return (
    codes.find((code) => decodePositionCode(code)?.hand === hand) ?? null
  );
}

/**
 * Resolves a Chord Modifier switch to its position code on the active
 * device layout — base layer (1) Shift for Capitalization (either side, left
 * preferred), the left/right Ambidextrous Throwover switches for Present
 * Tense/Plural, and the left/right Numeric Layer switches for Past Tense/
 * Comparative, per the switch mapping confirmed for this site's supported
 * devices.
 */
function resolveChordModifierPositionCode(
  modifier: ChordModifierKind,
): number | null {
  const { layerShiftPositionCodeMap, modifierKeyPositionCodeMap } =
    activeDerivedLayoutData();
  switch (modifier) {
    case 'capitalization':
      return pickHandPositionCode(
        modifierKeyPositionCodeMap.shift[1] ?? [],
        'left',
      );
    case 'presentTense':
      return (
        resolveNonKeyActionPosition('AmbidextrousThrowoverLeft')
          ?.characterKeyPositionCode ?? null
      );
    case 'plural':
      return (
        resolveNonKeyActionPosition('AmbidextrousThrowoverRight')
          ?.characterKeyPositionCode ?? null
      );
    case 'pastTense':
      return pickHandPositionCode(layerShiftPositionCodeMap.numShift, 'left');
    case 'comparative':
      return pickHandPositionCode(
        layerShiftPositionCodeMap.numShift,
        'right',
      );
  }
}

export interface ChordIllustration {
  highlight: HighlightKeyCombination;
  labels: PositionLabels;
}

/**
 * Combines several characters' switch positions into one "press these
 * together" highlight — for showing what a chord's input looks like. Every
 * switch is rendered the same way (as a hold) since a chord has no single
 * "primary" switch the way a modifier combo does. If `modifier` is given, its
 * switch is added to the illustration too (e.g. Present Tense alongside a
 * "work" chord, for "working") — rendered as the "press" one, to stand out
 * from the chord's own switches — and returns null if that switch can't be
 * resolved on the active device layout.
 */
export function resolveChordIllustration(
  chars: string[],
  modifier?: ChordModifierKind,
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
    labels[highlight.characterKeyPositionCode] = { text: char.toUpperCase() };
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
  // Unlike the chord's own switches (none of which is "primary"), the
  // modifier switch is the one thing that's distinct about this
  // illustration, so it's set as characterKeyPositionCode to render it in
  // the "press" color instead of blending in with the chord's "hold" color.
  let modifierPositionCode: number | null = null;
  if (modifier) {
    modifierPositionCode = resolveChordModifierPositionCode(modifier);
    if (modifierPositionCode === null) {
      return null;
    }
    positionCodes.add(modifierPositionCode);
    if (!(modifierPositionCode in labels)) {
      labels[modifierPositionCode] = CHORD_MODIFIER_LABEL[modifier];
    }
  }
  const highlight: HighlightKeyCombination = {
    characterKeyPositionCode: modifierPositionCode ?? -1,
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
    case 'chord':
      return (
        resolveChordIllustration(step.chordChars ?? [], step.chordModifier)
          ?.highlight ?? null
      );
  }
}

/** Builds the on-switch labels for a resolved exercise step highlight. */
export function resolveStepLabels(
  step: ExerciseStep,
  highlight: HighlightKeyCombination,
): PositionLabels {
  if (step.kind === 'character') {
    // Whitespace characters (e.g. Space) render invisibly as text — use
    // Alnitak's 'space_bar' icon instead of the step's own label.
    const characterLabel: PositionLabel =
      step.key.trim() === ''
        ? { text: 'space_bar', icon: true }
        : { text: step.key };
    return buildPositionLabels(highlight, characterLabel);
  }
  if (step.kind === 'named-key') {
    const label = toPositionLabel(
      NON_WSK_CODE_2_RAW_KEY_LABEL_MAP[step.key as NonWSKCode],
    );
    return buildPositionLabels(highlight, label);
  }
  if (step.kind === 'mouse') {
    const label = toPositionLabel(
      NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP[step.key as NonKeyActionName],
    );
    return buildPositionLabels(highlight, label);
  }
  if (step.kind === 'chord') {
    return (
      resolveChordIllustration(step.chordChars ?? [], step.chordModifier)
        ?.labels ?? {}
    );
  }
  return buildPositionLabels(highlight, { text: step.label });
}
