import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../assets/i18n/en.json';
import { ALL_EXERCISES } from '../../data/exercises';
import { DeviceLayoutService } from '../../services/device-layout.service';
import { ProgressService } from '../../services/progress.service';
import { ExerciseCardComponent } from './exercise-card.component';

describe('ExerciseCardComponent', () => {
  let layouts: DeviceLayoutService;
  let progress: ProgressService;
  const az = ALL_EXERCISES.find((e) => e.id === 'az')!;
  const mouse = ALL_EXERCISES.find((e) => e.id === 'mouse-clicks')!;
  const ex = (id: string) => (en.exercises as any)[id];

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslateService()],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    layouts = TestBed.inject(DeviceLayoutService);
    progress = TestBed.inject(ProgressService);
    layouts.setDeviceLayoutId('cc1-cc2-ccu');
  });
  afterEach(() => {
    layouts.setDeviceLayoutId('cc1-cc2-ccu');
    localStorage.clear();
  });

  function create(exercise = az) {
    const fixture = TestBed.createComponent(ExerciseCardComponent);
    fixture.componentRef.setInput('exercise', exercise);
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const root = (f: F) => f.nativeElement as HTMLElement;
  const text = (f: F) => root(f).textContent!.replace(/\s+/g, ' ').trim();

  describe('an available exercise', () => {
    it('is a link to its page, with title, description and step count', () => {
      const f = create();
      const a = root(f).querySelector('a')!;
      expect(a.getAttribute('href')).toBe('/exercise/az');
      expect(text(f)).toContain(ex('az').title);
      expect(text(f)).toContain(ex('az').description);
      expect(text(f)).toContain(`${az.steps.length} steps`);
      expect(root(f).querySelector('mat-icon')).toBeNull();
      expect(root(f).querySelector('[aria-disabled]')).toBeNull();
    });

    it('shows a check mark and "Completed" in the accent colour once completed', () => {
      progress.markExerciseCompleted('az');
      const f = create();
      expect(root(f).querySelector('mat-icon')!.textContent!.trim()).toBe(
        'check_circle',
      );
      const status = root(f).querySelector('a > span')!;
      expect(status.textContent!.trim()).toBe('Completed');
      expect(status.classList).toContain('text-capella-500');
      expect(status.classList).not.toContain('text-capella-400');
      expect(text(f)).not.toContain('steps');
    });

    it('does not mix up exercises', () => {
      progress.markExerciseCompleted('quick-brown-fox');
      expect(root(create()).querySelector('mat-icon')).toBeNull();
    });

    it('updates when the exercise is completed while shown', () => {
      const f = create();
      progress.markExerciseCompleted('az');
      f.detectChanges();
      expect(text(f)).toContain('Completed');
    });
  });

  describe('an exercise the device layout cannot do', () => {
    it('is shown on a layout that can do it', () => {
      expect(root(create(mouse)).querySelector('a')).not.toBeNull();
    });

    it('is not a link, is marked disabled, and says why', () => {
      layouts.setDeviceLayoutId('m4g');
      const f = create(mouse);
      expect(root(f).querySelector('a')).toBeNull();
      expect(root(f).querySelector('[aria-disabled="true"]')).not.toBeNull();
      expect(text(f)).toContain(ex('mouse-clicks').title);
      expect(text(f)).toContain(ex('mouse-clicks').description);
      expect(text(f)).toContain(en.exerciseCard.disabledOnM4g);
      expect(text(f)).not.toContain('steps');
    });

    it('shows no check mark even if it was completed on another layout', () => {
      progress.markExerciseCompleted('mouse-clicks');
      layouts.setDeviceLayoutId('m4g');
      expect(root(create(mouse)).querySelector('mat-icon')).toBeNull();
    });

    it('follows a change of layout while shown', () => {
      const f = create(mouse);
      layouts.setDeviceLayoutId('m4g');
      f.detectChanges();
      expect(root(f).querySelector('a')).toBeNull();
    });

    it('does not affect an exercise every layout can do', () => {
      layouts.setDeviceLayoutId('m4g');
      expect(root(create(az)).querySelector('a')).not.toBeNull();
    });
  });
});
