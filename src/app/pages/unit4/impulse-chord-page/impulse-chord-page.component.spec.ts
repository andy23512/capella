import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ProgressService } from '../../../services/progress.service';
import { IMPULSE_CHORD_PRACTICE_ID } from '../impulse-chord-practice-page/impulse-chord-practice-page.component';
import { ImpulseChordPageComponent } from './impulse-chord-page.component';

describe('ImpulseChordPageComponent', () => {
  let fixture: ComponentFixture<ImpulseChordPageComponent>;

  function create() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslateService()],
    });
    fixture = TestBed.createComponent(ImpulseChordPageComponent);
    fixture.detectChanges();
  }
  const el = () => fixture.nativeElement as HTMLElement;
  const card = () =>
    el().querySelector('a[href="/unit-4/impulse-chord/practice"]')!;

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('links to the practice page, and invites the user to try it', () => {
    create();
    expect(card()).not.toBeNull();
    expect(card().textContent).toContain('impulsePage.interactive');
    expect(card().textContent).not.toContain('impulsePage.completed');
    expect(card().querySelector('mat-icon')).toBeNull();
  });

  it('shows a check and "completed" once the practice has been done', () => {
    localStorage.setItem(
      'capella:completed-exercises',
      JSON.stringify([IMPULSE_CHORD_PRACTICE_ID]),
    );
    create();
    expect(card().textContent).toContain('impulsePage.completed');
    expect(card().textContent).not.toContain('impulsePage.interactive');
    expect(card().querySelector('mat-icon')!.textContent).toContain(
      'check_circle',
    );
  });

  it('does not count another exercise as this practice', () => {
    localStorage.setItem('capella:completed-exercises', JSON.stringify(['az']));
    create();
    expect(card().textContent).toContain('impulsePage.interactive');
  });

  it('updates the card when the practice gets done while the page is open', () => {
    create();
    TestBed.inject(ProgressService).markExerciseCompleted(
      IMPULSE_CHORD_PRACTICE_ID,
    );
    fixture.detectChanges();
    expect(card().textContent).toContain('impulsePage.completed');
  });

  it('has the four steps of the flow, and the chapter navigation', () => {
    create();
    expect(el().querySelectorAll('ol > li:not([aria-hidden])').length).toBe(4);
    expect(el().querySelector('app-chapter-nav')).not.toBeNull();
  });
});
