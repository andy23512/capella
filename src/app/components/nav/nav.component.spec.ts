import { BreakpointObserver } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSidenavContent } from '@angular/material/sidenav';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import en from '../../../assets/i18n/en.json';
import { UNITS } from '../../data/units';
import { NavComponent } from './nav.component';

@Component({ template: 'page' })
class PageComponent {}

describe('NavComponent', () => {
  let handset: BehaviorSubject<{ matches: boolean }>;
  let queries: string[];

  beforeEach(() => {
    handset = new BehaviorSubject<{ matches: boolean }>({ matches: false });
    queries = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: PageComponent }]),
        provideTranslateService(),
        {
          provide: BreakpointObserver,
          useValue: {
            observe: (q: string) => {
              queries.push(q);
              return handset;
            },
          },
        },
      ],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
  });

  async function create(isHandset = false) {
    handset.next({ matches: isHandset });
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }
  type F = Awaited<ReturnType<typeof create>>;
  const root = (f: F) => f.nativeElement as HTMLElement;
  const links = (f: F) =>
    Array.from(
      root(f).querySelectorAll('mat-nav-list a'),
    ) as HTMLAnchorElement[];
  const sidenav = (f: F) => root(f).querySelector('mat-sidenav') as HTMLElement;
  const menuButton = (f: F) =>
    root(f).querySelector(
      'button[mat-icon-button]',
    ) as HTMLButtonElement | null;

  describe('content', () => {
    it('lists the learning map and settings first, then every chapter under its unit, then the source code', async () => {
      const f = await create();
      const texts = links(f).map((a) =>
        a.textContent!.replace(/\s+/g, ' ').trim(),
      );
      const chapters = UNITS.flatMap((u) =>
        u.chapters.map((c) => (en.chapters as any)[c.id] as string),
      );
      expect(texts).toEqual([
        'map Learning Map',
        'settings Settings',
        ...chapters,
        'code Source Code',
      ]);
    });

    it('links each entry to its page', async () => {
      const f = await create();
      const hrefs = links(f).map((a) => a.getAttribute('href'));
      expect(hrefs.slice(0, 2)).toEqual(['/learning-map', '/settings']);
      expect(hrefs.slice(2, -1)).toEqual(
        UNITS.flatMap((u) => u.chapters.map((c) => c.path)),
      );
    });

    it('opens the source code in a new tab, without handing over the opener', async () => {
      const f = await create();
      const a = links(f).at(-1)!;
      expect(a.getAttribute('href')).toBe(
        'https://github.com/andy23512/capella',
      );
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
    });

    it('puts a heading for each unit', async () => {
      const f = await create();
      const heads = Array.from(root(f).querySelectorAll('h4')).map((h) =>
        h.textContent!.trim(),
      );
      expect(heads).toEqual(UNITS.map((u) => (en.units as any)[u.id].title));
    });

    it('has a header that links home', async () => {
      const f = await create();
      const a = root(f).querySelector('header a') as HTMLAnchorElement;
      expect(a.getAttribute('href')).toBe('/');
      expect(a.textContent).toContain('Capella');
    });

    it('marks the learning map and a chapter as active when they are the current page', async () => {
      const f = await create();
      const router = TestBed.inject(Router);
      const chapter = UNITS[1].chapters[0].path;
      for (const url of ['/learning-map', chapter]) {
        await router.navigateByUrl(url);
        f.detectChanges();
        const active = links(f).filter((a) =>
          a.classList.contains('list-item-active'),
        );
        expect(active.map((a) => a.getAttribute('href'))).toEqual([url]);
      }
    });

    it('marks the link of the current page as active', async () => {
      const f = await create();
      await TestBed.inject(Router).navigateByUrl('/settings');
      f.detectChanges();
      const active = links(f).filter((a) =>
        a.classList.contains('list-item-active'),
      );
      expect(active.map((a) => a.getAttribute('href'))).toEqual(['/settings']);
    });
  });

  describe('on a wide screen', () => {
    it('keeps the menu open beside the page, as navigation, with no menu button', async () => {
      const f = await create(false);
      expect(sidenav(f).classList).toContain('mat-drawer-side');
      expect(sidenav(f).classList).toContain('mat-drawer-opened');
      expect(sidenav(f).getAttribute('role')).toBe('navigation');
      expect(menuButton(f)).toBeNull();
    });

    it('does not close the menu when a link is clicked', async () => {
      const f = await create(false);
      links(f)[0].dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
      f.detectChanges();
      expect(f.componentInstance.drawer.opened).toBeTrue();
    });
  });

  describe('on a narrow screen', () => {
    it('hides the menu over the page, as a dialog, with a button to open it', async () => {
      const f = await create(true);
      expect(sidenav(f).classList).toContain('mat-drawer-over');
      expect(f.componentInstance.drawer.opened).toBeFalse();
      expect(sidenav(f).getAttribute('role')).toBe('dialog');
      expect(menuButton(f)).not.toBeNull();
      expect(menuButton(f)!.getAttribute('aria-label')).toBe('Open side menu');
    });

    it('opens the menu from the button, and then no longer shows the button', async () => {
      const f = await create(true);
      menuButton(f)!.click();
      f.detectChanges();
      await f.whenStable();
      f.detectChanges();
      expect(f.componentInstance.drawer.opened).toBeTrue();
      expect(menuButton(f)).toBeNull();
    });

    it('closes the menu when a link is clicked', async () => {
      const f = await create(true);
      await f.componentInstance.drawer.open();
      links(f)[0].dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
      f.detectChanges();
      await f.whenStable();
      expect(f.componentInstance.drawer.opened).toBeFalse();
    });

    it('closes the menu whichever entry is clicked, except the external source link', async () => {
      const f = await create(true);
      const internal = links(f).slice(0, -1);
      expect(internal.length).toBeGreaterThan(3);
      for (const a of internal) {
        await f.componentInstance.drawer.open();
        a.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
        await f.whenStable();
        expect(f.componentInstance.drawer.opened)
          .withContext(a.getAttribute('href')!)
          .toBeFalse();
      }
    });

    it('closes the menu when the header link is clicked', async () => {
      const f = await create(true);
      await f.componentInstance.drawer.open();
      (root(f).querySelector('header a') as HTMLElement).dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
      await f.whenStable();
      expect(f.componentInstance.drawer.opened).toBeFalse();
    });
  });

  it('decides "narrow" by width only, below 960px', async () => {
    await create();
    expect(queries).toEqual(['(max-width: 959.98px)']);
  });

  it('follows the screen when it becomes narrow or wide', async () => {
    const f = await create(false);
    handset.next({ matches: true });
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(sidenav(f).classList).toContain('mat-drawer-over');
    expect(menuButton(f)).not.toBeNull();
  });

  describe('scrolling', () => {
    it('goes back to the top of the page content after each navigation', async () => {
      const f = await create();
      const content = f.debugElement.query(By.directive(MatSidenavContent))
        .componentInstance as MatSidenavContent;
      const scrollTo = spyOn(content, 'scrollTo');
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/a');
      await router.navigateByUrl('/b');
      expect(scrollTo).toHaveBeenCalledTimes(2);
      expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
    });

    it('stays where it is when a navigation does not finish', async () => {
      const f = await create();
      const content = f.debugElement.query(By.directive(MatSidenavContent))
        .componentInstance as MatSidenavContent;
      const scrollTo = spyOn(content, 'scrollTo');
      const router = TestBed.inject(Router);
      router.resetConfig([
        { path: 'no', component: PageComponent, canActivate: [() => false] },
      ]);
      await router.navigateByUrl('/no');
      expect(scrollTo).not.toHaveBeenCalled();
    });
  });
});
