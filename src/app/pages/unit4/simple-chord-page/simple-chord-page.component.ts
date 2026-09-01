import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { resolveChordIllustration } from '../../../utils/key-position.utils';

@Component({
  selector: 'app-simple-chord-page',
  templateUrl: './simple-chord-page.component.html',
  standalone: true,
  imports: [LayoutComponent, ChapterNavComponent],
})
export class SimpleChordPageComponent {
  protected readonly exampleChord = resolveChordIllustration(['b', 'c']);
}
