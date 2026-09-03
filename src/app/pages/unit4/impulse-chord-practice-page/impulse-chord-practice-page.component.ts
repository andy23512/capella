import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../../services/progress.service';

/** Also referenced from impulse-chord-page to check/mark completion. */
export const IMPULSE_CHORD_PRACTICE_ID = 'impulse-chord-practice';

const OUTPUT_MARKER_RE = /^>I<mpulse output:\s*(.*)$/;
const INPUT_MARKER_RE = /^>I<mpulse input:\s*(.*)$/;

interface ImpulsePracticePhase {
  kind: 'idle' | 'output' | 'input' | 'done';
  /** Output text typed so far — only meaningful when kind is 'output'. */
  text: string;
  /** Chord input combo so far — only meaningful when kind is 'input'. */
  combo: string;
  /** Whether the device is waiting for a second combo to chain — only meaningful when kind is 'input'. */
  chaining: boolean;
}

@Component({
  selector: 'app-impulse-chord-practice-page',
  templateUrl: './impulse-chord-practice-page.component.html',
  standalone: true,
  imports: [MatButton, MatIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpulseChordPracticePageComponent {
  private readonly progressService = inject(ProgressService);

  protected readonly value = signal('');
  /** Set once the field first matches a GTM marker, to tell 'idle' apart from 'done' (both look like "no marker match"). */
  private readonly hasStarted = signal(false);

  /**
   * The whole state is derived straight from the current field value — the
   * real device already redraws it from scratch (print, then Backspace the
   * old text, then reprint) on every step, so there is no need to track
   * transitions ourselves.
   */
  protected readonly phase = computed<ImpulsePracticePhase>(() => {
    const raw = this.value();

    const outputMatch = OUTPUT_MARKER_RE.exec(raw);
    if (outputMatch) {
      return { kind: 'output', text: outputMatch[1], combo: '', chaining: false };
    }

    const inputMatch = INPUT_MARKER_RE.exec(raw);
    if (inputMatch) {
      const rest = inputMatch[1].trimEnd();
      const chaining = rest.endsWith('|');
      const combo = (chaining ? rest.slice(0, -1) : rest).trim();
      return { kind: 'input', text: '', combo, chaining };
    }

    return {
      kind: this.hasStarted() ? 'done' : 'idle',
      text: '',
      combo: '',
      chaining: false,
    };
  });

  protected onInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    this.value.set(raw);
    if (OUTPUT_MARKER_RE.test(raw) || INPUT_MARKER_RE.test(raw)) {
      this.hasStarted.set(true);
    } else if (this.hasStarted()) {
      this.progressService.markExerciseCompleted(IMPULSE_CHORD_PRACTICE_ID);
    }
  }

  /** The real device may or may not emit its own Enter keydown here — either way, this box must never submit/newline on it. */
  protected onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  protected reset() {
    this.value.set('');
    this.hasStarted.set(false);
  }
}
