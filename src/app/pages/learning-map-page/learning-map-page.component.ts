import { Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { exercisesForChapter } from '../../data/exercises';
import { UNITS } from '../../data/units';
import { ChapterMeta } from '../../models/content.models';
import { ProgressService } from '../../services/progress.service';

interface ChapterNode {
  chapter: ChapterMeta;
  read: boolean;
  exerciseTotal: number;
  exerciseCompleted: number;
}

interface UnitGroup {
  id: string;
  title: string;
  nodes: ChapterNode[];
}

@Component({
  selector: 'app-learning-map-page',
  templateUrl: './learning-map-page.component.html',
  standalone: true,
  imports: [RouterLink, MatIcon],
})
export class LearningMapPageComponent {
  private readonly progressService = inject(ProgressService);

  protected readonly unitGroups = computed<UnitGroup[]>(() =>
    UNITS.map((unit) => ({
      id: unit.id,
      title: unit.title,
      nodes: unit.chapters.map((chapter) => {
        const exercises = exercisesForChapter(chapter.id);
        return {
          chapter,
          read: this.progressService.isChapterRead(chapter.id),
          exerciseTotal: exercises.length,
          exerciseCompleted: exercises.filter((exercise) =>
            this.progressService.isExerciseCompleted(exercise.id),
          ).length,
        };
      }),
    })),
  );

  protected readonly totals = computed(() => {
    const chapters = UNITS.flatMap((unit) => unit.chapters);
    const exercises = chapters.flatMap((chapter) =>
      exercisesForChapter(chapter.id),
    );
    return {
      chaptersRead: chapters.filter((chapter) =>
        this.progressService.isChapterRead(chapter.id),
      ).length,
      chaptersTotal: chapters.length,
      exercisesCompleted: exercises.filter((exercise) =>
        this.progressService.isExerciseCompleted(exercise.id),
      ).length,
      exercisesTotal: exercises.length,
    };
  });
}
