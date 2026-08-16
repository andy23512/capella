import { Component, computed, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  getAdjacentChapters,
  getChapterNavLabel,
} from '../../utils/chapter-nav.utils';

@Component({
  selector: 'app-chapter-nav',
  templateUrl: './chapter-nav.component.html',
  standalone: true,
  imports: [MatButton, MatIcon, RouterLink],
})
export class ChapterNavComponent {
  readonly chapterId = input.required<string>();

  readonly adjacent = computed(() => getAdjacentChapters(this.chapterId()));

  protected readonly getChapterNavLabel = getChapterNavLabel;
}
