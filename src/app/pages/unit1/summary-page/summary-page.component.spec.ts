import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../../assets/i18n/en.json';
import { UNITS } from '../../../data/units';
import { DeviceLayoutService } from '../../../services/device-layout.service';
import { Unit1SummaryPageComponent } from './summary-page.component';

const chapters = UNITS.flatMap((u) => u.chapters);
describe('Unit1SummaryPageComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslateService()],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId('cc1-cc2-ccu');
  });
  afterEach(() => {
    TestBed.inject(DeviceLayoutService).setDeviceLayoutId('cc1-cc2-ccu');
    localStorage.clear();
  });

  function create() {
    const fixture = TestBed.createComponent(Unit1SummaryPageComponent);
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const root = (f: F) => f.nativeElement as HTMLElement;
  const text = (f: F) => root(f).textContent!.replace(/\s+/g, ' ');
  const hrefs = (f: F, selector: string) =>
    Array.from(root(f).querySelectorAll(selector)).map((a) =>
      a.getAttribute('href'),
    );

  it('ends with links to the chapters before and after it, in this order', () => {
    const i = chapters.findIndex((c) => c.id === 'unit-1-summary');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(hrefs(create(), 'app-chapter-nav a')).toEqual(
      [chapters[i - 1], chapters[i + 1]].filter(Boolean).map((c) => c.path),
    );
  });

  it('shows the summary of unit-1 and its resources', () => {
    const f = create();
    const u = UNITS.find((x) => x.id === 'unit-1')!;
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      en.units['unit-1'].title,
    );
    expect(root(f).querySelector('h1')!.textContent!.trim()).toBe('Summary');
    expect(text(f)).toContain(en.units['unit-1'].summary);
    expect(u.resources?.length ?? 0).toBeGreaterThan(0);
    expect(root(f).querySelectorAll('app-unit-summary ul li a').length).toBe(
      u.resources!.length,
    );
  });
});
