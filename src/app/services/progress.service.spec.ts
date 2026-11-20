import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';

const READ = 'capella:read-chapters';
const DONE = 'capella:completed-exercises';

describe('ProgressService', () => {
  function create(): ProgressService {
    TestBed.resetTestingModule();
    return TestBed.inject(ProgressService);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('starts with nothing read or completed', () => {
    const service = create();
    expect(service.isChapterRead('a')).toBeFalse();
    expect(service.isExerciseCompleted('a')).toBeFalse();
  });

  it('remembers a chapter as read, and saves it', () => {
    const service = create();
    service.markChapterRead('a');
    expect(service.isChapterRead('a')).toBeTrue();
    expect(service.isChapterRead('b')).toBeFalse();
    expect(JSON.parse(localStorage.getItem(READ)!)).toEqual(['a']);
  });

  it('remembers a completed exercise, and saves it', () => {
    const service = create();
    service.markExerciseCompleted('e1');
    expect(service.isExerciseCompleted('e1')).toBeTrue();
    expect(JSON.parse(localStorage.getItem(DONE)!)).toEqual(['e1']);
  });

  it('keeps chapters and exercises apart, even with the same id', () => {
    const service = create();
    service.markChapterRead('same');
    expect(service.isExerciseCompleted('same')).toBeFalse();
    service.markExerciseCompleted('other');
    expect(service.isChapterRead('other')).toBeFalse();
  });

  it('keeps every id it has been given, without duplicates', () => {
    const service = create();
    service.markChapterRead('a');
    service.markChapterRead('b');
    service.markChapterRead('a');
    expect(JSON.parse(localStorage.getItem(READ)!)).toEqual(['a', 'b']);
  });

  it('does not write again for something already marked', () => {
    const service = create();
    service.markChapterRead('a');
    const setItem = spyOn(localStorage, 'setItem').and.callThrough();
    service.markChapterRead('a');
    service.markExerciseCompleted('e');
    service.markExerciseCompleted('e');
    expect(setItem).toHaveBeenCalledTimes(1);
  });

  it('loads the saved progress in a new session', () => {
    localStorage.setItem(READ, JSON.stringify(['a', 'b']));
    localStorage.setItem(DONE, JSON.stringify(['e']));
    const service = create();
    expect(service.isChapterRead('b')).toBeTrue();
    expect(service.isExerciseCompleted('e')).toBeTrue();
  });

  it('starts empty when the saved value is not valid JSON', () => {
    localStorage.setItem(READ, '{not json');
    const service = create();
    expect(service.isChapterRead('a')).toBeFalse();
    service.markChapterRead('a');
    expect(JSON.parse(localStorage.getItem(READ)!)).toEqual(['a']);
  });
});
