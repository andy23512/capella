import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HighlightKeyCombination } from 'tangent-cc-lib';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ALL_EXERCISES } from '../../data/exercises';
import { UNITS } from '../../data/units';
import { Exercise, ExerciseStep } from '../../models/exercise.models';
import { ProgressService } from '../../services/progress.service';
import {
  PositionLabels,
  resolveStepLabels,
  resolveStepPosition,
} from '../../utils/key-position.utils';

interface ResolvedStep extends ExerciseStep {
  highlight: HighlightKeyCombination | null;
  labels: PositionLabels;
}

/** Expected MouseEvent.button for each mouse click action. */
const MOUSE_CLICK_BUTTON: Partial<Record<string, number>> = {
  MouseLeftClick: 0,
  MouseRightClick: 2,
};

/** Which accumulated-movement axis/sign satisfies each mouse move action. */
const MOUSE_MOVE_AXIS: Partial<Record<string, { axis: 'x' | 'y'; sign: 1 | -1 }>> =
  {
    MouseMoveUp: { axis: 'y', sign: -1 },
    MouseMoveDown: { axis: 'y', sign: 1 },
    MouseMoveLeft: { axis: 'x', sign: -1 },
    MouseMoveRight: { axis: 'x', sign: 1 },
  };
const MOUSE_MOVE_THRESHOLD_PX = 80;

/** Which wheel delta satisfies each mouse scroll action. */
const MOUSE_SCROLL_MATCHER: Partial<Record<string, (event: WheelEvent) => boolean>> =
  {
    MouseScrollCoastUp: (event) => event.deltaY < 0,
    MouseScrollCoastDown: (event) => event.deltaY > 0,
    MouseScrollCoastLeft: (event) => event.deltaX < 0,
    MouseScrollCoastRight: (event) => event.deltaX > 0,
  };

function findExercise(exerciseId: string | null): Exercise | null {
  return ALL_EXERCISES.find((exercise) => exercise.id === exerciseId) ?? null;
}

function findChapterPath(chapterId: string): string {
  for (const unit of UNITS) {
    const chapter = unit.chapters.find((c) => c.id === chapterId);
    if (chapter) {
      return chapter.path;
    }
  }
  return '/learning-map';
}

@Component({
  selector: 'app-exercise-page',
  standalone: true,
  templateUrl: './exercise-page.component.html',
  imports: [MatButton, MatIcon, RouterLink, LayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly progressService = inject(ProgressService);

  protected readonly exercise =
    findExercise(this.route.snapshot.paramMap.get('exerciseId')) ??
    (() => {
      this.router.navigateByUrl('/learning-map');
      return null;
    })();

  protected readonly backPath = this.exercise
    ? findChapterPath(this.exercise.chapterId)
    : '/learning-map';

  protected readonly resolvedSteps: ResolvedStep[] =
    this.exercise?.steps.map((step) => {
      const highlight = resolveStepPosition(step);
      return {
        ...step,
        highlight,
        labels: highlight ? resolveStepLabels(step, highlight) : {},
      };
    }) ?? [];

  protected readonly currentIndex = signal(0);
  protected readonly mistakes = signal(0);
  protected readonly mismatch = signal(false);

  protected readonly completed = computed(
    () => this.currentIndex() >= this.resolvedSteps.length,
  );
  protected readonly currentStep = computed<ResolvedStep | null>(
    () => this.resolvedSteps[this.currentIndex()] ?? null,
  );

  private mismatchTimeout?: ReturnType<typeof setTimeout>;
  private moveDeltaX = 0;
  private moveDeltaY = 0;
  /** Characters typed so far toward the current 'chord' step's output text. */
  protected readonly chordBuffer = signal('');

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (this.completed()) {
      return;
    }
    const step = this.currentStep();
    if (!step || step.kind === 'mouse') {
      return;
    }
    event.preventDefault();
    if (step.kind === 'chord') {
      this.onChordKeydown(event, step.key);
      return;
    }
    const matches =
      step.kind === 'character' || step.kind === 'dup'
        ? event.key.length === 1 &&
          event.key.toLowerCase() === step.key.toLowerCase()
        : // event.code (e.g. 'AltLeft') matches the NonWSKCode a 'named-key'
          // step's key holds; event.key collapses Alt/Control/Meta's
          // left/right switches to one string ('Alt'/'Control'/'Meta') and
          // can't tell them apart.
          event.code === step.key;
    if (matches) {
      this.advance();
      return;
    }
    this.registerMismatch();
  }

  /**
   * A fired chord doesn't arrive as one keystroke — CharaChorder's default
   * behavior types the raw switch characters first (e.g. "bc"), backspaces
   * them, then types the chord's output text followed by a trailing space
   * (so the next word chord can fire without a manual space). So this just
   * tracks keystrokes verbatim (honoring Backspace) and advances once the
   * trimmed buffer matches the output text — no mismatch tracking, since
   * that raw-then-corrected burst would otherwise flag as errors on every
   * fire.
   */
  private onChordKeydown(event: KeyboardEvent, outputText: string) {
    if (event.key === 'Backspace') {
      this.chordBuffer.update((buffer) => buffer.slice(0, -1));
      return;
    }
    if (event.key.length !== 1) {
      return;
    }
    this.chordBuffer.update((buffer) => buffer + event.key);
    if (this.chordBuffer().trim() === outputText) {
      this.chordBuffer.set('');
      this.advance();
    }
  }

  @HostListener('window:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.completed()) {
      return;
    }
    const step = this.currentStep();
    if (!step || step.kind !== 'mouse') {
      return;
    }
    const expectedButton = MOUSE_CLICK_BUTTON[step.key];
    if (expectedButton === undefined) {
      return;
    }
    if (event.button === expectedButton) {
      this.advance();
      return;
    }
    if (event.button === 0 || event.button === 2) {
      this.registerMismatch();
    }
  }

  @HostListener('window:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    if (this.currentStep()?.kind === 'mouse') {
      event.preventDefault();
    }
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (this.completed()) {
      return;
    }
    const step = this.currentStep();
    if (!step || step.kind !== 'mouse') {
      return;
    }
    const matcher = MOUSE_SCROLL_MATCHER[step.key];
    if (!matcher) {
      return;
    }
    event.preventDefault();
    if (matcher(event)) {
      this.advance();
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.completed()) {
      return;
    }
    const step = this.currentStep();
    if (!step || step.kind !== 'mouse') {
      return;
    }
    const move = MOUSE_MOVE_AXIS[step.key];
    if (!move) {
      return;
    }
    this.moveDeltaX += event.movementX;
    this.moveDeltaY += event.movementY;
    const delta = move.axis === 'x' ? this.moveDeltaX : this.moveDeltaY;
    if (delta * move.sign >= MOUSE_MOVE_THRESHOLD_PX) {
      this.advance();
    }
  }

  protected restart() {
    this.currentIndex.set(0);
    this.mistakes.set(0);
    this.moveDeltaX = 0;
    this.moveDeltaY = 0;
    this.chordBuffer.set('');
  }

  private advance() {
    this.currentIndex.update((i) => i + 1);
    this.moveDeltaX = 0;
    this.moveDeltaY = 0;
    if (this.exercise && this.currentIndex() === this.resolvedSteps.length) {
      this.progressService.markExerciseCompleted(this.exercise.id);
    }
  }

  private registerMismatch() {
    this.mistakes.update((m) => m + 1);
    this.mismatch.set(true);
    clearTimeout(this.mismatchTimeout);
    this.mismatchTimeout = setTimeout(() => this.mismatch.set(false), 300);
  }
}
