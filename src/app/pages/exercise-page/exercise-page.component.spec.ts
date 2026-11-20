import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DeviceLayoutService } from '../../services/device-layout.service';
import { ProgressService } from '../../services/progress.service';
import { provideTranslateService } from '@ngx-translate/core';
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
        provideTranslateService(),
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
        provideTranslateService(),
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

describe('ExercisePageComponent', () => {
  let fixture: ComponentFixture<ExercisePageComponent>;
  let navigate: jasmine.Spy;

  function create(exerciseId: string | null, layout?: 'm4g'): void {
    TestBed.resetTestingModule();
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [ExercisePageComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => exerciseId } } },
        },
      ],
    });
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId(
      layout ?? 'cc1-cc2-ccu',
    );
    navigate = spyOn(TestBed.inject(Router), 'navigateByUrl');
    fixture = TestBed.createComponent(ExercisePageComponent);
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent ?? '';
  const page = () => internals(fixture);
  const dispatch = (event: Event) => {
    window.dispatchEvent(event);
    fixture.detectChanges();
  };
  const key = (k: string) =>
    dispatch(new KeyboardEvent('keydown', { key: k, cancelable: true }));
  const code = (c: string) =>
    dispatch(new KeyboardEvent('keydown', { code: c, cancelable: true }));
  const mouseDown = (button: number) =>
    dispatch(new MouseEvent('mousedown', { button }));
  const move = (movementX: number, movementY: number) =>
    dispatch(new MouseEvent('mousemove', { movementX, movementY }));
  const wheel = (deltaX: number, deltaY: number) =>
    dispatch(new WheelEvent('wheel', { deltaX, deltaY, cancelable: true }));
  const progress = () => TestBed.inject(ProgressService);

  afterEach(() => {
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId('cc1-cc2-ccu');
    localStorage.clear();
  });

  describe('opening', () => {
    it('shows the exercise title key, its first step and no mistakes', () => {
      create('az');
      expect(text()).toContain('exercises.az.title');
      expect(text()).toContain('exercisePage.press');
      expect(page().currentIndex()).toBe(0);
      expect(page().mistakes()).toBe(0);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('goes to the learning map for an exercise that does not exist', () => {
      create('nope');
      expect(navigate).toHaveBeenCalledOnceWith('/learning-map');
      expect(el().querySelector('h1')).toBeNull();
    });

    it('goes to the learning map without an exercise id', () => {
      create(null);
      expect(navigate).toHaveBeenCalledOnceWith('/learning-map');
    });

    it('sends an exercise the device layout cannot do back to its chapter', () => {
      create('mouse-clicks', 'm4g');
      expect(navigate).toHaveBeenCalledOnceWith('/unit-2/mouse-features');
      expect(el().querySelector('h1')).toBeNull();
    });

    it('links back to the chapter of the exercise', () => {
      create('az');
      const back = el().querySelector('a[mat-stroked-button]')!;
      expect(back.getAttribute('href')).toBe('/unit-2/letters');
    });

    it('lists every step, and marks the first as the current one', () => {
      create('az');
      const chips = el().querySelectorAll('div.flex-wrap > span');
      expect(chips.length).toBe(26);
      expect(chips[0].classList).toContain('bg-capella-500');
      expect(chips[1].classList).toContain('opacity-40');
    });
  });

  describe('character steps', () => {
    it('advances on the right character, in either case', () => {
      create('az');
      key('a');
      expect(page().currentIndex()).toBe(1);
      key('B');
      expect(page().currentIndex()).toBe(2);
      expect(page().mistakes()).toBe(0);
    });

    it('counts a mistake for the wrong key and stays on the step', () => {
      create('az');
      key('x');
      expect(page().currentIndex()).toBe(0);
      expect(page().mistakes()).toBe(1);
      expect(text()).toContain('exercisePage.mistakes');
    });

    it('does not accept a named key such as Enter for a character step', () => {
      create('az');
      key('Enter');
      expect(page().currentIndex()).toBe(0);
      expect(page().mistakes()).toBe(1);
    });

    it('stops the browser from acting on the key', () => {
      create('az');
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        cancelable: true,
      });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBeTrue();
    });

    it('shows the red ring for a moment after a mistake', fakeAsync(() => {
      create('az');
      key('x');
      expect(el().querySelector('.ring-2')).not.toBeNull();
      tick(299);
      fixture.detectChanges();
      expect(el().querySelector('.ring-2')).not.toBeNull();
      tick(1);
      fixture.detectChanges();
      expect(el().querySelector('.ring-2')).toBeNull();
    }));

    it('keeps the ring for 300 ms after the latest mistake', fakeAsync(() => {
      create('az');
      key('x');
      tick(200);
      key('y');
      tick(200);
      fixture.detectChanges();
      expect(el().querySelector('.ring-2')).not.toBeNull();
      tick(100);
      fixture.detectChanges();
      expect(el().querySelector('.ring-2')).toBeNull();
    }));

    it('types a space for the space step', () => {
      create('quick-brown-fox');
      for (const c of 'The') {
        key(c);
      }
      expect(page().currentIndex()).toBe(3);
      key(' ');
      expect(page().currentIndex()).toBe(4);
    });

    it('ignores a multi-character key name even if it starts with the right letter', () => {
      create('az');
      key('a');
      key('Backspace');
      expect(page().currentIndex()).toBe(1);
      expect(page().mistakes()).toBe(1);
    });
  });

  describe('dup steps', () => {
    it('expects the character, then the same character again for DUP', () => {
      create('double-letters');
      key('t');
      expect(page().currentIndex()).toBe(1);
      key('s');
      expect(page().currentIndex()).toBe(1);
      expect(page().mistakes()).toBe(1);
      key('t');
      expect(page().currentIndex()).toBe(2);
    });
  });

  describe('named-key steps', () => {
    it('does not take the character a key makes, only its code', () => {
      create('modifier-keys');
      key('Alt');
      expect(page().currentIndex()).toBe(0);
      expect(page().mistakes()).toBe(1);
    });
  });

  describe('mouse steps', () => {
    it('ignores the keyboard completely, without counting mistakes', () => {
      create('mouse-clicks');
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        cancelable: true,
      });
      window.dispatchEvent(event);
      expect(page().currentIndex()).toBe(0);
      expect(page().mistakes()).toBe(0);
      expect(event.defaultPrevented).toBeFalse();
    });

    it('does not say "press" for a mouse step', () => {
      create('mouse-clicks');
      expect(text()).not.toContain('exercisePage.press');
    });

    it('advances on the left click, then the right click', () => {
      create('mouse-clicks');
      mouseDown(0);
      expect(page().currentIndex()).toBe(1);
      mouseDown(2);
      expect(page().currentIndex()).toBe(2);
      expect(page().mistakes()).toBe(0);
    });

    it('counts a mistake when the other button is clicked', () => {
      create('mouse-clicks');
      mouseDown(2);
      expect(page().currentIndex()).toBe(0);
      expect(page().mistakes()).toBe(1);
    });

    it('does not count the middle button as a mistake', () => {
      create('mouse-clicks');
      mouseDown(1);
      expect(page().currentIndex()).toBe(0);
      expect(page().mistakes()).toBe(0);
    });

    it('keeps the context menu from opening during a mouse step only', () => {
      create('mouse-clicks');
      const during = new MouseEvent('contextmenu', { cancelable: true });
      window.dispatchEvent(during);
      expect(during.defaultPrevented).toBeTrue();
      create('az');
      const outside = new MouseEvent('contextmenu', { cancelable: true });
      window.dispatchEvent(outside);
      expect(outside.defaultPrevented).toBeFalse();
    });

    it('ignores clicks during a keyboard step', () => {
      create('az');
      mouseDown(0);
      expect(page().currentIndex()).toBe(0);
      expect(page().mistakes()).toBe(0);
    });

    describe('moving', () => {
      it('adds up the movement until it reaches 80 px in the asked direction', () => {
        create('mouse-movement'); // up, down, left, right
        move(0, -50);
        expect(page().currentIndex()).toBe(0);
        move(0, -29);
        expect(page().currentIndex()).toBe(0);
        move(0, -1);
        expect(page().currentIndex()).toBe(1);
      });

      it('does not count movement in the other direction, and takes it off what was gathered', () => {
        create('mouse-movement');
        move(0, 100);
        expect(page().currentIndex()).toBe(0);
        move(0, -100);
        expect(page().currentIndex()).toBe(0);
        move(0, -80);
        expect(page().currentIndex()).toBe(1);
      });

      it('starts counting again for each step', () => {
        create('mouse-movement');
        move(0, -200);
        expect(page().currentIndex()).toBe(1);
        move(0, 79);
        expect(page().currentIndex()).toBe(1);
        move(0, 1);
        expect(page().currentIndex()).toBe(2);
      });

      it('does not mix up the two axes', () => {
        create('mouse-movement');
        move(-500, 0);
        expect(page().currentIndex()).toBe(0);
        move(0, -80);
        expect(page().currentIndex()).toBe(1);
      });

      it('goes through up, down, left and right', () => {
        create('mouse-movement');
        move(0, -80);
        move(0, 80);
        move(-80, 0);
        move(80, 0);
        expect(page().currentIndex()).toBe(4);
      });
    });

    describe('scrolling', () => {
      // mouse-scroll is only open on the Master Forge-less layout
      it('goes through up, down, left and right by the wheel direction', () => {
        create('mouse-scroll');
        wheel(0, -10);
        expect(page().currentIndex()).toBe(1);
        wheel(0, 10);
        expect(page().currentIndex()).toBe(2);
        wheel(-10, 0);
        expect(page().currentIndex()).toBe(3);
        wheel(10, 0);
        expect(page().currentIndex()).toBe(4);
      });

      it('does not advance on the wrong direction, or count a mistake', () => {
        create('mouse-scroll');
        wheel(0, 10);
        expect(page().currentIndex()).toBe(0);
        expect(page().mistakes()).toBe(0);
      });

      it('asks the browser not to scroll the page, but the browser ignores it (current behavior)', () => {
        // A wheel listener on window is passive by default in Chrome, so
        // preventDefault() has no effect there and the page still scrolls.
        create('mouse-scroll');
        const event = new WheelEvent('wheel', { deltaY: 10, cancelable: true });
        window.dispatchEvent(event);
        expect(event.defaultPrevented).toBeFalse();
      });

      it('lets the wheel scroll the page during a keyboard step', () => {
        create('az');
        const event = new WheelEvent('wheel', { deltaY: 10, cancelable: true });
        window.dispatchEvent(event);
        expect(event.defaultPrevented).toBeFalse();
      });
    });
  });

  describe('chord steps', () => {
    it('shows what has been typed so far', () => {
      create('because-chord');
      key('b');
      key('c');
      expect(el().querySelector('p.font-mono')!.textContent).toContain('bc');
    });

    it('does not show the typing line for other steps', () => {
      create('az');
      expect(el().querySelector('p.font-mono')).toBeNull();
    });

    it('ignores non-character keys such as Shift', () => {
      create('because-chord');
      key('Shift');
      key('Enter');
      expect(page().chordBuffer()).toBe('');
    });
  });

  describe('finishing', () => {
    function finishAz() {
      for (const c of 'abcdefghijklmnopqrstuvwxyz') {
        key(c);
      }
    }

    it('does not mark the exercise done before the last step', () => {
      create('az');
      for (const c of 'abcdefghijklmnopqrstuvwxy') {
        key(c);
      }
      expect(progress().isExerciseCompleted('az')).toBeFalse();
    });

    it('marks the exercise done and shows the result after the last step', () => {
      create('az');
      key('x');
      finishAz();
      expect(progress().isExerciseCompleted('az')).toBeTrue();
      expect(text()).toContain('exercisePage.allCorrect');
      expect(text()).toContain('exercisePage.mistakeCountOne');
      expect(text()).not.toContain('exercisePage.press');
      expect(el().querySelector('app-layout')).toBeNull();
    });

    it('uses the plural text for no mistakes or several', () => {
      create('az');
      finishAz();
      expect(text()).toContain('exercisePage.mistakeCountOther');
      create('az');
      key('x');
      key('x');
      finishAz();
      expect(text()).toContain('exercisePage.mistakeCountOther');
      expect(text()).not.toContain('exercisePage.mistakeCountOne');
    });

    it('ignores every input once it is done', () => {
      create('az');
      finishAz();
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        cancelable: true,
      });
      window.dispatchEvent(event);
      mouseDown(0);
      move(0, 500);
      wheel(0, 10);
      expect(event.defaultPrevented).toBeFalse();
      expect(page().mistakes()).toBe(0);
      expect(page().currentIndex()).toBe(26);
    });

    it('starts over with Redo, with the mistakes cleared and the progress kept', () => {
      create('az');
      key('x');
      finishAz();
      const redo = el().querySelector(
        'button[mat-stroked-button]',
      ) as HTMLElement;
      redo.click();
      fixture.detectChanges();
      expect(page().currentIndex()).toBe(0);
      expect(page().mistakes()).toBe(0);
      expect(text()).toContain('exercisePage.press');
      expect(progress().isExerciseCompleted('az')).toBeTrue();
    });

    it('forgets half-typed chords and half-made mouse movement on Redo', () => {
      create('because-chord');
      key('b');
      expect(page().chordBuffer()).toBe('b');
      (page() as unknown as { restart: () => void }).restart();
      expect(page().chordBuffer()).toBe('');
      create('mouse-movement');
      move(0, -70);
      (page() as unknown as { restart: () => void }).restart();
      move(0, -70);
      expect(page().currentIndex()).toBe(0);
      move(0, -9);
      expect(page().currentIndex()).toBe(0);
      move(0, -1);
      expect(page().currentIndex()).toBe(1);
    });

    it('goes back to the chapter from the result page', () => {
      create('az');
      finishAz();
      const back = el().querySelector('a[mat-flat-button]')!;
      expect(back.getAttribute('href')).toBe('/unit-2/letters');
    });
  });
});
