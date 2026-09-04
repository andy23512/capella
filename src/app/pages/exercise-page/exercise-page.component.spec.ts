import { ActivatedRoute, provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExercisePageComponent } from './exercise-page.component';

/** because-chord's steps are all chordStep(['b', 'c'], 'because') — see src/app/data/exercises.ts. */
const EXERCISE_ID = 'because-chord';

interface ExercisePageInternals {
  currentIndex: () => number;
  mistakes: () => number;
  chordBuffer: () => string;
}

function internals(fixture: ComponentFixture<ExercisePageComponent>) {
  return fixture.componentInstance as unknown as ExercisePageInternals;
}

function press(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

function pressCode(code: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { code }));
}

function type(text: string) {
  for (const char of text) {
    press(char);
  }
}

describe('ExercisePageComponent chord step handling', () => {
  let fixture: ComponentFixture<ExercisePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExercisePageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => EXERCISE_ID } },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ExercisePageComponent);
    fixture.detectChanges();
  });

  it('advances once the buffer matches the chord output text exactly', () => {
    type('because');
    expect(internals(fixture).currentIndex()).toBe(1);
    expect(internals(fixture).chordBuffer()).toBe('');
  });

  it('trims a trailing auto-inserted space before comparing, mirroring real device output', () => {
    type('because ');
    expect(internals(fixture).currentIndex()).toBe(1);
  });

  it('mirrors the raw-switch-characters-then-backspace burst a real chord fire produces', () => {
    // "bc" typed raw, then backspaced out, then the chord's real output.
    type('bc');
    press('Backspace');
    press('Backspace');
    type('because');
    expect(internals(fixture).currentIndex()).toBe(1);
  });

  it('pops the buffer on Backspace so a mistyped character can be corrected', () => {
    // "becauze" -> backspace off the wrong "ze" tail -> retype the right "se".
    type('becauze');
    press('Backspace');
    press('Backspace');
    type('se');
    expect(internals(fixture).currentIndex()).toBe(1);
  });

  it('does not advance, and does not count a mistake, while the buffer is still wrong', () => {
    type('wrong');
    expect(internals(fixture).currentIndex()).toBe(0);
    expect(internals(fixture).mistakes()).toBe(0);
    expect(internals(fixture).chordBuffer()).toBe('wrong');
  });
});

describe('ExercisePageComponent named-key step handling', () => {
  // modifier-keys' first step expects AltLeft — see src/app/data/exercises.ts.
  const MODIFIER_KEYS_EXERCISE_ID = 'modifier-keys';
  let fixture: ComponentFixture<ExercisePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExercisePageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => MODIFIER_KEYS_EXERCISE_ID } },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ExercisePageComponent);
    fixture.detectChanges();
  });

  it('matches by event.code so left/right modifier switches can be told apart, since event.key collapses both to one string ("Alt")', () => {
    pressCode('AltRight');
    expect(internals(fixture).currentIndex()).toBe(0);
    pressCode('AltLeft');
    expect(internals(fixture).currentIndex()).toBe(1);
  });
});
