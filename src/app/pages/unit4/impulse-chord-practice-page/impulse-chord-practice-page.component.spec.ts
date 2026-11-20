import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ProgressService } from '../../../services/progress.service';
import {
  IMPULSE_CHORD_PRACTICE_ID,
  ImpulseChordPracticePageComponent,
} from './impulse-chord-practice-page.component';

const OUTPUT = '>I<mpulse output: ';
const INPUT = '>I<mpulse input: ';

describe('ImpulseChordPracticePageComponent', () => {
  let fixture: ComponentFixture<ImpulseChordPracticePageComponent>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslateService()],
    });
    fixture = TestBed.createComponent(ImpulseChordPracticePageComponent);
    fixture.detectChanges();
  });
  afterEach(() => localStorage.clear());

  const el = () => fixture.nativeElement as HTMLElement;
  const input = () => el().querySelector('input') as HTMLInputElement;
  const text = () => el().textContent ?? '';
  const progress = () => TestBed.inject(ProgressService);
  const buttons = () =>
    Array.from(el().querySelectorAll('button')) as HTMLButtonElement[];
  const button = (key: string) =>
    buttons().find((b) => (b.textContent ?? '').includes(key))!;

  /** Types into the box the way the device does: sets the whole value, then fires input. */
  function typeInBox(value: string) {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  describe('at the start', () => {
    it('shows the box and the idle hint, not the result', () => {
      expect(input()).not.toBeNull();
      expect(text()).toContain('impulsePractice.idle');
      expect(text()).not.toContain('impulsePractice.done');
    });

    it('links back to the chapter', () => {
      expect(
        el().querySelector('a[mat-stroked-button]')!.getAttribute('href'),
      ).toBe('/unit-4/impulse-chord');
    });

    it('has not marked the practice done', () => {
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeFalse();
    });
  });

  describe('reading the box', () => {
    it('shows what the device has typed as output so far', () => {
      typeInBox(OUTPUT + 'because');
      expect(text()).toContain('impulsePractice.outputStep');
      expect(text()).toContain('because');
    });

    it('says nothing was typed yet for an empty output', () => {
      typeInBox('>I<mpulse output:');
      expect(text()).toContain('impulsePractice.outputStep');
      expect(text()).toContain('impulsePractice.nothingTyped');
    });

    it('finds the output marker after other text, since a chord may fire first', () => {
      typeInBox('because ' + OUTPUT + 'hello');
      expect(text()).toContain('impulsePractice.outputStep');
      expect(text()).toContain('hello');
      expect(text()).not.toContain('because');
    });

    it('shows the chord input typed so far, and asks to confirm', () => {
      typeInBox(INPUT + 'B + C');
      expect(text()).toContain('impulsePractice.inputStep');
      expect(text()).toContain('B + C');
      expect(text()).toContain('impulsePractice.confirm');
      expect(text()).not.toContain('impulsePractice.chaining');
    });

    it('says nothing was pressed yet for an empty input', () => {
      typeInBox('>I<mpulse input:');
      expect(text()).toContain('impulsePractice.nothingPressed');
    });

    it('reads a trailing bar as waiting for a second combo, and leaves the bar out of the combo', () => {
      typeInBox(INPUT + 'B + C |');
      expect(text()).toContain('impulsePractice.chaining');
      expect(text()).not.toContain('impulsePractice.confirm');
      const combo = el().querySelector('p.font-mono')!.textContent!.trim();
      expect(combo).toBe('B + C');
    });

    it('finds the input marker after other text too', () => {
      typeInBox('because ' + INPUT + 'B + C');
      expect(text()).toContain('impulsePractice.inputStep');
      const combo = el().querySelector('p.font-mono')!.textContent!.trim();
      expect(combo).toBe('B + C');
    });

    it('still reads a bar followed by spaces as waiting for a second combo', () => {
      typeInBox(INPUT + 'B + C |   ');
      expect(text()).toContain('impulsePractice.chaining');
    });

    it('keeps a bar in the middle of the combo', () => {
      typeInBox(INPUT + 'B | C');
      const combo = el().querySelector('p.font-mono')!.textContent!.trim();
      expect(combo).toBe('B | C');
      expect(text()).toContain('impulsePractice.confirm');
    });

    it('prefers the output marker when both are there', () => {
      typeInBox(INPUT + 'x ' + OUTPUT + 'y');
      expect(text()).toContain('impulsePractice.outputStep');
    });

    it('is idle for any other text, and does not show the marker text as output', () => {
      typeInBox('hello');
      expect(text()).toContain('impulsePractice.idle');
    });

    it('keeps what was typed in the box', () => {
      typeInBox(OUTPUT + 'a');
      expect(input().value).toBe(OUTPUT + 'a');
    });
  });

  describe('Enter', () => {
    it('is stopped, so the box never submits or adds a line', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        cancelable: true,
      });
      input().dispatchEvent(event);
      expect(event.defaultPrevented).toBeTrue();
    });

    it('leaves other keys alone', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        cancelable: true,
      });
      input().dispatchEvent(event);
      expect(event.defaultPrevented).toBeFalse();
    });
  });

  describe('finishing', () => {
    it('is done 300 ms after the device leaves the prompt', fakeAsync(() => {
      typeInBox(OUTPUT + 'because');
      typeInBox('because');
      tick(299);
      fixture.detectChanges();
      expect(text()).not.toContain('impulsePractice.done');
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeFalse();
      tick(1);
      fixture.detectChanges();
      expect(text()).toContain('impulsePractice.done');
      expect(text()).toContain('impulsePractice.closed');
      expect(text()).not.toContain('impulsePractice.skipped');
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeTrue();
      expect(input()).toBeNull();
    }));

    it('is not fooled by the device redrawing the prompt (Backspace, then reprint)', fakeAsync(() => {
      typeInBox(OUTPUT + 'be');
      typeInBox('>I<mpulse output');
      tick(200);
      typeInBox(OUTPUT + 'bec');
      tick(1000);
      fixture.detectChanges();
      expect(text()).not.toContain('impulsePractice.done');
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeFalse();
    }));

    it('restarts the wait each time the box changes while off the prompt', fakeAsync(() => {
      typeInBox(INPUT + 'B');
      typeInBox('x');
      tick(200);
      typeInBox('xy');
      tick(200);
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeFalse();
      tick(100);
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeTrue();
    }));

    it('does not finish for text typed before the prompt ever showed up', fakeAsync(() => {
      typeInBox('hello');
      typeInBox('hello world');
      tick(1000);
      fixture.detectChanges();
      expect(text()).not.toContain('impulsePractice.done');
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeFalse();
    }));

    it('also counts the input prompt as a start', fakeAsync(() => {
      typeInBox(INPUT + 'B + C');
      typeInBox('');
      tick(300);
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeTrue();
    }));
  });

  describe('skipping', () => {
    it('finishes at once and says it was skipped', () => {
      button('impulsePractice.skip').click();
      fixture.detectChanges();
      expect(text()).toContain('impulsePractice.done');
      expect(text()).toContain('impulsePractice.skipped');
      expect(text()).not.toContain('impulsePractice.closed');
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeTrue();
    });

    it('stops a pending finish from the device, and keeps the skipped message', fakeAsync(() => {
      typeInBox(OUTPUT + 'a');
      typeInBox('a');
      button('impulsePractice.skip').click();
      tick(1000);
      fixture.detectChanges();
      expect(text()).toContain('impulsePractice.skipped');
    }));
  });

  describe('starting over', () => {
    it('clears the box and the hints with the reset link', () => {
      typeInBox(OUTPUT + 'abc');
      button('impulsePractice.resetBox').click();
      fixture.detectChanges();
      expect(input().value).toBe('');
      expect(text()).toContain('impulsePractice.idle');
    });

    it('forgets that the prompt was seen, so leaving the box does not finish', fakeAsync(() => {
      typeInBox(OUTPUT + 'abc');
      button('impulsePractice.resetBox').click();
      fixture.detectChanges();
      typeInBox('hello');
      tick(1000);
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeFalse();
    }));

    it('cancels a pending finish', fakeAsync(() => {
      typeInBox(OUTPUT + 'abc');
      typeInBox('abc');
      button('impulsePractice.resetBox').click();
      tick(1000);
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeFalse();
    }));

    it('brings back the live box after the result with Redo, while the saved progress stays', () => {
      button('impulsePractice.skip').click();
      fixture.detectChanges();
      button('impulsePractice.redo').click();
      fixture.detectChanges();
      expect(input()).not.toBeNull();
      expect(text()).not.toContain('impulsePractice.done');
      expect(
        progress().isExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID),
      ).toBeTrue();
    });

    it('shows the closed message, not the skipped one, after a skip followed by a real finish', fakeAsync(() => {
      button('impulsePractice.skip').click();
      fixture.detectChanges();
      button('impulsePractice.redo').click();
      fixture.detectChanges();
      typeInBox(OUTPUT + 'a');
      typeInBox('a');
      tick(300);
      fixture.detectChanges();
      expect(text()).toContain('impulsePractice.closed');
      expect(text()).not.toContain('impulsePractice.skipped');
    }));
  });
});
