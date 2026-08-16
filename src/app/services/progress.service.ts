import { Injectable, signal } from '@angular/core';

const READ_CHAPTERS_KEY = 'capella:read-chapters';
const COMPLETED_EXERCISES_KEY = 'capella:completed-exercises';

function loadSet(key: string): Set<string> {
  if (typeof localStorage === 'undefined') {
    return new Set();
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSet(key: string, value: Set<string>): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(key, JSON.stringify([...value]));
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly readChapters = signal<Set<string>>(
    loadSet(READ_CHAPTERS_KEY),
  );
  private readonly completedExercises = signal<Set<string>>(
    loadSet(COMPLETED_EXERCISES_KEY),
  );

  isChapterRead(chapterId: string): boolean {
    return this.readChapters().has(chapterId);
  }

  isExerciseCompleted(exerciseId: string): boolean {
    return this.completedExercises().has(exerciseId);
  }

  markChapterRead(chapterId: string): void {
    if (this.readChapters().has(chapterId)) {
      return;
    }
    this.readChapters.update((set) => {
      const next = new Set(set).add(chapterId);
      saveSet(READ_CHAPTERS_KEY, next);
      return next;
    });
  }

  markExerciseCompleted(exerciseId: string): void {
    if (this.completedExercises().has(exerciseId)) {
      return;
    }
    this.completedExercises.update((set) => {
      const next = new Set(set).add(exerciseId);
      saveSet(COMPLETED_EXERCISES_KEY, next);
      return next;
    });
  }
}
