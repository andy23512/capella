import {
  decodePositionCode,
  resolveCharacterKeyPosition,
  resolveChordIllustration,
  resolveStepLabels,
  resolveStepPosition,
} from './key-position.utils';
import { ExerciseStep } from '../models/exercise.models';

describe('decodePositionCode', () => {
  it('decodes a known position code to its hand/finger/direction', () => {
    // From tangent-cc-lib's POSITION_CODE_LAYOUT: left index, center press.
    expect(decodePositionCode(15)).toEqual({
      hand: 'left',
      finger: 'index',
      direction: 'c',
    });
  });

  it('decodes a right-hand position code, including mirrored e/w tilts', () => {
    // From tangent-cc-lib's POSITION_CODE_LAYOUT: right index tilts west/east.
    expect(decodePositionCode(61)).toEqual({
      hand: 'right',
      finger: 'index',
      direction: 'w',
    });
  });

  it('returns null for a code outside the known layout', () => {
    expect(decodePositionCode(-1)).toBeNull();
    expect(decodePositionCode(99999)).toBeNull();
  });
});

describe('resolveCharacterKeyPosition', () => {
  it('resolves a lowercase letter to a switch highlight', () => {
    const highlight = resolveCharacterKeyPosition('a');
    expect(highlight).not.toBeNull();
    expect(decodePositionCode(highlight!.characterKeyPositionCode)).not.toBeNull();
  });

  it('resolves the same character to the same switch every time', () => {
    const first = resolveCharacterKeyPosition('b');
    const second = resolveCharacterKeyPosition('b');
    expect(first!.characterKeyPositionCode).toBe(second!.characterKeyPositionCode);
  });
});

describe('resolveChordIllustration', () => {
  it('combines each character switch into one highlight, labeled by its own letter', () => {
    const illustration = resolveChordIllustration(['b', 'c']);
    expect(illustration).not.toBeNull();
    const bCode = resolveCharacterKeyPosition('b')!.characterKeyPositionCode;
    const cCode = resolveCharacterKeyPosition('c')!.characterKeyPositionCode;
    expect(illustration!.highlight.positionCodes).toContain(bCode);
    expect(illustration!.highlight.positionCodes).toContain(cCode);
    expect(illustration!.labels[bCode]).toEqual({ text: 'B' });
    expect(illustration!.labels[cCode]).toEqual({ text: 'C' });
  });

  it('refuses to illustrate two characters that land on the same switch', () => {
    // Same character twice always resolves to the same switch/direction.
    expect(resolveChordIllustration(['a', 'a'])).toBeNull();
  });

  it('adds the modifier switch as the character position, distinct from the chord switches', () => {
    const illustration = resolveChordIllustration(['o', 'r', 'w'], 'presentTense');
    expect(illustration).not.toBeNull();
    expect(illustration!.highlight.characterKeyPositionCode).not.toBe(-1);
    expect(
      illustration!.highlight.positionCodes.includes(
        illustration!.highlight.characterKeyPositionCode,
      ),
    ).toBe(true);
  });
});

describe('resolveStepPosition / resolveStepLabels', () => {
  it('resolves a character step to its own switch, labeled with the typed character', () => {
    const step: ExerciseStep = { kind: 'character', key: 'r', label: 'r' };
    const highlight = resolveStepPosition(step);
    expect(highlight).not.toBeNull();
    const labels = resolveStepLabels(step, highlight!);
    expect(labels[highlight!.characterKeyPositionCode]).toEqual({ text: 'r' });
  });

  it('labels a whitespace character step with the space icon instead of blank text', () => {
    const step: ExerciseStep = { kind: 'character', key: ' ', label: 'space' };
    const highlight = resolveStepPosition(step);
    expect(highlight).not.toBeNull();
    const labels = resolveStepLabels(step, highlight!);
    expect(labels[highlight!.characterKeyPositionCode]).toEqual({
      text: 'space_bar',
      icon: true,
    });
  });

  it('resolves a chord step the same way resolveChordIllustration would', () => {
    const step: ExerciseStep = {
      kind: 'chord',
      key: 'because',
      label: 'B + C',
      chordChars: ['b', 'c'],
    };
    const highlight = resolveStepPosition(step);
    const direct = resolveChordIllustration(['b', 'c']);
    expect(highlight).toEqual(direct!.highlight);
    expect(resolveStepLabels(step, highlight!)).toEqual(direct!.labels);
  });
});
