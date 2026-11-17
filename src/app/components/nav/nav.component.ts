import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import {
  MatListItem,
  MatListSubheaderCssMatStyler,
  MatNavList,
} from '@angular/material/list';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { UNITS } from '../../data/units';

/**
 * Width only, on purpose: Breakpoints.Handset also depends on orientation,
 * so narrowing a desktop window flips between portrait and landscape
 * thresholds and makes the sidebar close, reopen, then close again.
 */
const HANDSET_QUERY = '(max-width: 959.98px)';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MatIcon,
    MatListItem,
    MatListSubheaderCssMatStyler,
    MatNavList,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TranslatePipe,
  ],
})
export class NavComponent {
  public units = UNITS;

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  @ViewChild('drawer') public drawer!: MatSidenav;
  @ViewChild(MatSidenavContent) private content?: MatSidenavContent;

  constructor() {
    // The scroll container is mat-sidenav-content, not window, so the router's
    // scrollPositionRestoration does not apply; reset it manually.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.content?.scrollTo({ top: 0 }));
  }

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(HANDSET_QUERY)
    .pipe(
      map((result) => result.matches),
      shareReplay(1),
    );

  onNavLinkClick() {
    this.isHandset$.subscribe((isHandset) => {
      if (isHandset) {
        this.drawer.close();
      }
    });
  }
}
