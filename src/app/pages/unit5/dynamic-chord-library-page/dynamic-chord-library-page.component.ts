import { Component } from '@angular/core';
import { ChapterNavComponent } from '../../../components/chapter-nav/chapter-nav.component';

@Component({
  selector: 'app-dynamic-chord-library-page',
  templateUrl: './dynamic-chord-library-page.component.html',
  standalone: true,
  imports: [ChapterNavComponent],
})
export class DynamicChordLibraryPageComponent {}
