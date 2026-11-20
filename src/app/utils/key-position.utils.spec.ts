import { TestBed } from '@angular/core/testing';
import {
  Layer,
  NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP,
  NON_WSK_CODE_2_RAW_KEY_LABEL_MAP,
  NonKeyActionName,
  NonWSKCode,
} from 'tangent-cc-lib';
import { ALL_EXERCISES, isExerciseAvailable } from '../data/exercises';
import { DeviceLayoutService } from '../services/device-layout.service';
import {
  buildAlphabetLabels,
  buildAmbidextrousThrowoverLabels,
  buildPositionLabels,
  decodePositionCode,
  resolveNamedKeyPosition,
  resolveNonKeyActionPosition,
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
    expect(
      decodePositionCode(highlight!.characterKeyPositionCode),
    ).not.toBeNull();
  });

  it('resolves the same character to the same switch every time', () => {
    const first = resolveCharacterKeyPosition('b');
    const second = resolveCharacterKeyPosition('b');
    expect(first!.characterKeyPositionCode).toBe(
      second!.characterKeyPositionCode,
    );
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

describe('more key positions', () => {
  let layouts: DeviceLayoutService;

  beforeEach(() => {
    layouts = TestBed.inject(DeviceLayoutService);
    layouts.setDeviceLayoutId('cc1-cc2-ccu');
  });
  afterEach(() => {
    layouts.setDeviceLayoutId('cc1-cc2-ccu');
    localStorage.clear();
  });

  describe('resolveCharacterKeyPosition', () => {
    it('presses a lowercase letter alone', () => {
      const a = resolveCharacterKeyPosition('a')!;
      expect(a.shiftKey).toBeFalse();
      expect(a.positionCodes).toEqual([a.characterKeyPositionCode]);
    });

    it('holds a Shift switch for the capital of the same letter', () => {
      const a = resolveCharacterKeyPosition('a')!;
      const capital = resolveCharacterKeyPosition('A')!;
      expect(capital.characterKeyPositionCode).toBe(a.characterKeyPositionCode);
      expect(capital.shiftKey).toBeTrue();
      expect(capital.positionCodes.length).toBe(2);
      expect(capital.positionCodes).toContain(a.characterKeyPositionCode);
    });

    it('holds a layer switch for a digit, which is on another layer', () => {
      const a = resolveCharacterKeyPosition('a')!;
      const one = resolveCharacterKeyPosition('1')!;
      expect(one.layer).not.toBe(a.layer);
      expect(one.positionCodes.length).toBe(2);
      expect(one.shiftKey).toBeFalse();
    });

    it('holds both Shift and the layer switch for a shifted symbol', () => {
      const bang = resolveCharacterKeyPosition('!')!;
      expect(bang.shiftKey).toBeTrue();
      expect(bang.positionCodes.length).toBe(3);
    });

    it('resolves every letter, digit and printable ASCII symbol of the exercises', () => {
      const chars = ALL_EXERCISES.flatMap((e) => e.steps)
        .filter((s) => s.kind === 'character')
        .map((s) => s.key);
      expect(chars.length).toBeGreaterThan(40);
      for (const char of chars) {
        expect(resolveCharacterKeyPosition(char))
          .withContext(JSON.stringify(char))
          .not.toBeNull();
      }
    });

    it('has nothing for a character the device cannot type', () => {
      expect(resolveCharacterKeyPosition('é')).toBeNull();
      expect(resolveCharacterKeyPosition('')).toBeNull();
    });
  });

  describe('resolveNamedKeyPosition', () => {
    it('presses Enter and the arrows on their own switches', () => {
      const enter = resolveNamedKeyPosition('Enter' as NonWSKCode)!;
      const up = resolveNamedKeyPosition('ArrowUp' as NonWSKCode)!;
      expect(enter.positionCodes).toEqual([enter.characterKeyPositionCode]);
      expect(up.positionCodes).toEqual([up.characterKeyPositionCode]);
      expect(enter.characterKeyPositionCode).not.toBe(
        up.characterKeyPositionCode,
      );
    });

    it('has nothing for a key name that does not exist', () => {
      expect(resolveNamedKeyPosition('NotAKey' as NonWSKCode)).toBeNull();
    });
  });

  describe('resolveNonKeyActionPosition', () => {
    it('finds Dup and a mouse click', () => {
      expect(
        resolveNonKeyActionPosition('Dup' as NonKeyActionName),
      ).not.toBeNull();
      expect(
        resolveNonKeyActionPosition('MouseLeftClick' as NonKeyActionName),
      ).not.toBeNull();
    });

    it('has nothing for an action that does not exist', () => {
      expect(
        resolveNonKeyActionPosition('Nope' as NonKeyActionName),
      ).toBeNull();
    });

    it('needs another switch held for the same click on the Master Forge layout', () => {
      const click = 'MouseLeftClick' as NonKeyActionName;
      const onCc = resolveNonKeyActionPosition(click)!;
      layouts.setDeviceLayoutId('m4g');
      const onM4g = resolveNonKeyActionPosition(click)!;
      expect(onCc.positionCodes.length).toBe(1);
      expect(onM4g.positionCodes.length).toBe(2);
      expect(onM4g.layer).not.toBe(onCc.layer);
    });
  });

  describe('device layouts', () => {
    it('can show every exercise step of the default layout', () => {
      for (const exercise of ALL_EXERCISES) {
        for (const step of exercise.steps) {
          expect(resolveStepPosition(step))
            .withContext(`${exercise.id}: ${step.label}`)
            .not.toBeNull();
        }
      }
    });

    it('can show every step of an exercise that is available on the Master Forge layout', () => {
      layouts.setDeviceLayoutId('m4g');
      for (const exercise of ALL_EXERCISES.filter((e) =>
        isExerciseAvailable(e, 'm4g'),
      )) {
        const unresolved = exercise.steps.filter(
          (step) => resolveStepPosition(step) === null,
        );
        expect(unresolved.map((s) => s.label))
          .withContext(exercise.id)
          .toEqual([]);
      }
    });

    it('cannot show some steps of the exercises ruled out on the Master Forge layout', () => {
      layouts.setDeviceLayoutId('m4g');
      const ruledOut = ALL_EXERCISES.filter(
        (e) => !isExerciseAvailable(e, 'm4g'),
      );
      const withGaps = ruledOut
        .filter((e) => e.steps.some((s) => resolveStepPosition(s) === null))
        .map((e) => e.id);
      expect(withGaps).toContain('mouse-movement');
      // Intended: the mouse features are only taught complete. Scrolling alone
      // would work here, but nobody should switch to another mouse to move the
      // pointer and come back to the Master Forge to scroll, so it stays off too.
      expect(ruledOut.map((e) => e.id)).toContain('mouse-scroll');
      expect(withGaps).not.toContain('mouse-scroll');
    });

    it('types a digit with the same switches on both layouts', () => {
      const onCc = resolveCharacterKeyPosition('1')!;
      layouts.setDeviceLayoutId('m4g');
      expect(resolveCharacterKeyPosition('1')).toEqual(onCc);
    });
  });

  describe('buildPositionLabels', () => {
    it('puts the character label on the character switch and a Shift icon on the held Shift', () => {
      const capital = resolveCharacterKeyPosition('A')!;
      const labels = buildPositionLabels(capital, { text: 'A' });
      expect(labels[capital.characterKeyPositionCode]).toEqual({ text: 'A' });
      const held = capital.positionCodes.find(
        (c) => c !== capital.characterKeyPositionCode,
      )!;
      expect(labels[held]).toEqual({ text: 'shift', icon: true });
      expect(Object.keys(labels).length).toBe(2);
    });

    it('labels a held layer switch differently from Shift', () => {
      const one = resolveCharacterKeyPosition('1')!;
      const labels = buildPositionLabels(one, { text: '1' });
      const held = one.positionCodes.find(
        (c) => c !== one.characterKeyPositionCode,
      )!;
      expect(labels[held]).toBeDefined();
      expect(labels[held]).not.toEqual({ text: 'shift', icon: true });
    });

    it('lets the caller override a label, even the character switch', () => {
      const capital = resolveCharacterKeyPosition('A')!;
      const held = capital.positionCodes.find(
        (c) => c !== capital.characterKeyPositionCode,
      )!;
      const labels = buildPositionLabels(
        capital,
        { text: 'A' },
        {
          [held]: { text: 'mine' },
          [capital.characterKeyPositionCode]: { text: 'X' },
        },
      );
      expect(labels[held]).toEqual({ text: 'mine' });
      expect(labels[capital.characterKeyPositionCode]).toEqual({ text: 'X' });
    });

    it('leaves out a held switch it does not recognise', () => {
      const a = resolveCharacterKeyPosition('a')!;
      const labels = buildPositionLabels(
        { ...a, positionCodes: [...a.positionCodes, 9999] },
        { text: 'a' },
      );
      expect(Object.keys(labels)).toEqual([String(a.characterKeyPositionCode)]);
    });
  });

  describe('buildPositionLabels, other held switches', () => {
    const base = () => resolveCharacterKeyPosition('a')!;

    it('labels a held Fn Shift switch', () => {
      const labels = buildPositionLabels(
        { ...base(), positionCodes: [61, 30] },
        { text: 'a' },
      );
      expect(labels[30]).toEqual(
        jasmine.objectContaining({ text: jasmine.any(String) }),
      );
      expect(labels[30]).not.toEqual({ text: 'shift', icon: true });
    });

    it('labels a held AltGr switch, but only on the layers it works on', () => {
      const onLayer1 = buildPositionLabels(
        { ...base(), layer: Layer.Primary, positionCodes: [61, 77] },
        { text: 'a' },
      );
      expect(onLayer1[77]).toBeDefined();
      const onLayer4 = buildPositionLabels(
        { ...base(), layer: Layer.Quaternary, positionCodes: [61, 77] },
        { text: 'a' },
      );
      expect(onLayer4[77]).toBeUndefined();
    });
  });

  describe('chord layer', () => {
    it('follows the first character of the chord', () => {
      const lower = resolveCharacterKeyPosition('b')!;
      const upper = resolveCharacterKeyPosition('4')!;
      expect(lower.layer).not.toBe(upper.layer);
      expect(resolveChordIllustration(['b', '4'])!.highlight.layer).toBe(
        lower.layer,
      );
      expect(resolveChordIllustration(['4', 'b'])!.highlight.layer).toBe(
        upper.layer,
      );
    });
  });

  describe('buildAlphabetLabels', () => {
    it('gives each of the 26 letters its own switch, in capitals', () => {
      const labels = buildAlphabetLabels();
      const texts = Object.values(labels).map((l) => l.text);
      expect(texts.sort().join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      for (const [code, label] of Object.entries(labels)) {
        expect(
          resolveCharacterKeyPosition(label.text.toLowerCase())!
            .characterKeyPositionCode,
        ).toBe(Number(code));
      }
    });
  });

  describe('buildAmbidextrousThrowoverLabels', () => {
    const base = () => buildAlphabetLabels();
    const decoded = (code: string) => decodePositionCode(Number(code))!;

    it('is the plain alphabet when no throwover switch is held', () => {
      expect(buildAmbidextrousThrowoverLabels(null)).toEqual(base());
    });

    it('gives the held hand the letters of the other hand, and leaves the other hand alone', () => {
      const labels = buildAmbidextrousThrowoverLabels('left');
      for (const [code, label] of Object.entries(base())) {
        if (decoded(code).hand === 'right') {
          expect(labels[Number(code)]).toEqual(label);
        }
      }
      const rightTexts = Object.entries(base())
        .filter(([code]) => decoded(code).hand === 'right')
        .map(([, l]) => l.text);
      for (const [code, label] of Object.entries(labels)) {
        if (decoded(code).hand === 'left') {
          expect(rightTexts).toContain(label.text);
        }
      }
    });

    it('mirrors east and west, and keeps centre, north and south', () => {
      const labels = buildAmbidextrousThrowoverLabels('left');
      const rightByPosition = new Map<string, string>();
      for (const [code, label] of Object.entries(base())) {
        const d = decoded(code);
        if (d.hand === 'right') {
          rightByPosition.set(`${d.finger}-${d.direction}`, label.text);
        }
      }
      const mirror = { c: 'c', n: 'n', s: 's', e: 'w', w: 'e' } as const;
      for (const [code, label] of Object.entries(labels)) {
        const d = decoded(code);
        if (d.hand === 'left') {
          expect(label.text)
            .withContext(code)
            .toBe(rightByPosition.get(`${d.finger}-${mirror[d.direction]}`)!);
        }
      }
    });

    it('shows nothing on a switch whose mirror has no letter', () => {
      const labels = buildAmbidextrousThrowoverLabels('left');
      const rightLetterPositions = new Set(
        Object.keys(base())
          .map(decoded)
          .filter((d) => d.hand === 'right')
          .map((d) => `${d.finger}-${d.direction}`),
      );
      const mirror = { c: 'c', n: 'n', s: 's', e: 'w', w: 'e' } as const;
      for (const code of Object.keys(base())) {
        const d = decoded(code);
        if (
          d.hand === 'left' &&
          !rightLetterPositions.has(`${d.finger}-${mirror[d.direction]}`)
        ) {
          expect(labels[Number(code)]).withContext(code).toBeUndefined();
        }
      }
    });

    it('works the same way for the right hand', () => {
      const labels = buildAmbidextrousThrowoverLabels('right');
      for (const [code, label] of Object.entries(base())) {
        if (decoded(code).hand === 'left') {
          expect(labels[Number(code)]).toEqual(label);
        }
      }
      expect(labels).not.toEqual(base());
    });
  });

  describe('resolveChordIllustration', () => {
    it('has nothing when one of the characters cannot be typed', () => {
      expect(resolveChordIllustration(['b', 'é'])).toBeNull();
    });

    it('is not tied to one character switch, and holds every switch once', () => {
      const chord = resolveChordIllustration(['b', 'c', 'd'])!;
      expect(chord.highlight.characterKeyPositionCode).toBe(-1);
      expect(chord.highlight.positionCodes.length).toBe(3);
      expect(new Set(chord.highlight.positionCodes).size).toBe(3);
    });

    it('takes the layer of the first character and also shows a held Shift', () => {
      const chord = resolveChordIllustration(['A', 'b'])!;
      expect(chord.highlight.layer).toBe(
        resolveCharacterKeyPosition('A')!.layer,
      );
      expect(Object.values(chord.labels)).toContain(
        jasmine.objectContaining({ text: 'shift', icon: true }),
      );
    });
  });

  describe('resolveStepPosition / resolveStepLabels by kind', () => {
    it('resolves a named key and labels it with its key cap', () => {
      const step: ExerciseStep = {
        kind: 'named-key',
        key: 'Enter',
        label: 'Enter',
      };
      const highlight = resolveStepPosition(step)!;
      expect(highlight).toEqual(
        resolveNamedKeyPosition('Enter' as NonWSKCode)!,
      );
      const raw = NON_WSK_CODE_2_RAW_KEY_LABEL_MAP['Enter' as NonWSKCode];
      expect(
        resolveStepLabels(step, highlight)[highlight.characterKeyPositionCode]
          .text,
      ).toBe(raw.c as string);
    });

    it('resolves a mouse step and labels it from the library', () => {
      const step: ExerciseStep = {
        kind: 'mouse',
        key: 'MouseLeftClick',
        label: 'Left click',
      };
      const highlight = resolveStepPosition(step)!;
      expect(highlight).toEqual(
        resolveNonKeyActionPosition('MouseLeftClick' as NonKeyActionName)!,
      );
      const raw =
        NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP[
          'MouseLeftClick' as NonKeyActionName
        ];
      expect(
        resolveStepLabels(step, highlight)[highlight.characterKeyPositionCode]
          .text,
      ).toBe(raw.c as string);
    });

    it('resolves a dup step to the Dup switch whatever its key is, and labels it with the step label', () => {
      const step: ExerciseStep = { kind: 'dup', key: 't', label: 'DUP (t)' };
      const highlight = resolveStepPosition(step)!;
      expect(highlight).toEqual(
        resolveNonKeyActionPosition('Dup' as NonKeyActionName)!,
      );
      expect(
        resolveStepLabels(step, highlight)[highlight.characterKeyPositionCode],
      ).toEqual({ text: 'DUP (t)' });
    });

    it('has nothing for a step whose key does not exist', () => {
      expect(
        resolveStepPosition({ kind: 'named-key', key: 'Nope', label: 'x' }),
      ).toBeNull();
      expect(
        resolveStepPosition({ kind: 'mouse', key: 'Nope', label: 'x' }),
      ).toBeNull();
      expect(
        resolveStepPosition({ kind: 'character', key: 'é', label: 'x' }),
      ).toBeNull();
    });

    it('gives a chord step without switches no illustration (current behavior: it throws)', () => {
      const step: ExerciseStep = { kind: 'chord', key: 'because', label: 'x' };
      expect(() => resolveStepPosition(step)).toThrow();
    });
  });
});
