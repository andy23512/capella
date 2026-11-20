import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../assets/i18n/en.json';
import { UNITS } from './data/units';
import { ProgressService } from './services/progress.service';
import { AppComponent } from './app.component';

@Component({ template: 'page' })
class PageComponent {}

describe('AppComponent', () => {
  let progress: ProgressService;
  let router: Router;
  const chapters = UNITS.flatMap((u) => u.chapters);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'old-intro', redirectTo: '/unit-1/introduction' },
          { path: '**', component: PageComponent },
        ]),
        provideTranslateService(),
      ],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    progress = TestBed.inject(ProgressService);
    router = TestBed.inject(Router);
  });
  afterEach(() => localStorage.clear());

  function create() {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return fixture;
  }
  const readIds = () =>
    chapters.filter((c) => progress.isChapterRead(c.id)).map((c) => c.id);

  it('contains the navigation', () => {
    const f = create();
    expect(f.nativeElement.querySelector('app-nav')).not.toBeNull();
  });

  it('marks a chapter as read when it is opened', async () => {
    create();
    await router.navigateByUrl('/unit-1/device-introduction');
    expect(readIds()).toEqual(['device-introduction']);
  });

  it('keeps every chapter that has been opened', async () => {
    create();
    await router.navigateByUrl('/unit-1/introduction');
    await router.navigateByUrl('/unit-2/introduction');
    expect(readIds()).toEqual(['unit-1-introduction', 'unit-2-introduction']);
  });

  it('does not mark anything for a page that is not a chapter', async () => {
    create();
    for (const url of ['/', '/settings', '/learning-map', '/exercise/az']) {
      await router.navigateByUrl(url);
    }
    expect(readIds()).toEqual([]);
  });

  it('goes by the page actually reached after a redirect', async () => {
    create();
    await router.navigateByUrl('/old-intro');
    expect(readIds()).toEqual(['unit-1-introduction']);
  });

  it('does nothing before navigation starts', () => {
    create();
    expect(readIds()).toEqual([]);
  });
});
