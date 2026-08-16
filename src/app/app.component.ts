import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavComponent } from './components/nav/nav.component';
import { UNITS } from './data/units';
import { ProgressService } from './services/progress.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [NavComponent],
})
export class AppComponent {
  private readonly progressService = inject(ProgressService);

  constructor() {
    const router = inject(Router);
    const chapters = UNITS.flatMap((unit) => unit.chapters);
    router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      )
      .subscribe((event) => {
        const chapter = chapters.find(
          (c) => c.path === event.urlAfterRedirects,
        );
        if (chapter) {
          this.progressService.markChapterRead(chapter.id);
        }
      });
  }
}
