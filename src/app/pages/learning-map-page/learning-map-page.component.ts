import { Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  exercisesForChapter,
  isExerciseAvailable,
} from '../../data/exercises';
import { UNITS } from '../../data/units';
import { ChapterMeta } from '../../models/content.models';
import { DeviceLayoutService } from '../../services/device-layout.service';
import { ProgressService } from '../../services/progress.service';

interface ChapterNode {
  chapter: ChapterMeta;
  read: boolean;
  exerciseTotal: number;
  exerciseCompleted: number;
  /** The chapter has exercises, but the selected device layout disables all of them. */
  exercisesDisabled: boolean;
}

interface UnitGroup {
  id: string;
  titleKey: string;
  nodes: ChapterNode[];
}

@Component({
  selector: 'app-learning-map-page',
  templateUrl: './learning-map-page.component.html',
  standalone: true,
  imports: [RouterLink, MatIcon, TranslatePipe],
})
export class LearningMapPageComponent {
  private readonly progressService = inject(ProgressService);
  private readonly deviceLayoutService = inject(DeviceLayoutService);

  protected readonly unitGroups = computed<UnitGroup[]>(() =>
    UNITS.map((unit) => ({
      id: unit.id,
      titleKey: unit.titleKey,
      nodes: unit.chapters.map((chapter) => {
        const allExercises = exercisesForChapter(chapter.id);
        const layoutId = this.deviceLayoutService.deviceLayoutId();
        const exercises = allExercises.filter((exercise) =>
          isExerciseAvailable(exercise, layoutId),
        );
        return {
          chapter,
          read: this.progressService.isChapterRead(chapter.id),
          exercisesDisabled:
            allExercises.length > 0 && exercises.length === 0,
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
    const layoutId = this.deviceLayoutService.deviceLayoutId();
    const exercises = chapters
      .flatMap((chapter) => exercisesForChapter(chapter.id))
      .filter((exercise) => isExerciseAvailable(exercise, layoutId));
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
