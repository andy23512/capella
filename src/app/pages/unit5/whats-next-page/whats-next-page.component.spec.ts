import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../../assets/i18n/en.json';
import { UNITS } from '../../../data/units';
import { DeviceLayoutService } from '../../../services/device-layout.service';
import { WhatsNextPageComponent } from './whats-next-page.component';

const chapters = UNITS.flatMap((u) => u.chapters);
describe('WhatsNextPageComponent', () => {
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
    const fixture = TestBed.createComponent(WhatsNextPageComponent);
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
    const i = chapters.findIndex((c) => c.id === 'whats-next');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(hrefs(create(), 'app-chapter-nav a')).toEqual(
      [chapters[i - 1], chapters[i + 1]].filter(Boolean).map((c) => c.path),
    );
  });

  const w = en.whatsNext;

  it('shows the last unit and the closing words', () => {
    const f = create();
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      en.units['unit-5'].title,
    );
    expect(root(f).querySelector('h1')!.textContent!.trim()).toBe(w.title);
    expect(text(f)).toContain(w.lead);
    expect(text(f)).toContain(w.nextDescription);
  });

  it('recaps units 1 to 4, each linking to the first chapter of the unit', () => {
    const f = create();
    const items = Array.from(root(f).querySelectorAll('ul li'));
    const recaps = [w.recap.unit1, w.recap.unit2, w.recap.unit3, w.recap.unit4];
    const unitIds = ['unit-1', 'unit-2', 'unit-3', 'unit-4'] as const;
    expect(items.length).toBe(4);
    items.forEach((li, i) => {
      const u = UNITS.find((x) => x.id === unitIds[i])!;
      const a = li.querySelector('a')!;
      expect(a.getAttribute('href')).toBe(u.chapters[0].path);
      expect(a.textContent!.trim()).toBe(en.units[unitIds[i]].title);
      expect(li.textContent).toContain(recaps[i]);
    });
  });

  it('points to the next-step article, opening in a new tab', () => {
    const f = create();
    const a = root(f).querySelector('.bg-gray-700 a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe(w.article.url);
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toContain('noopener');
    expect(a.textContent!.trim()).toBe(w.article.cta);
    expect(text(f)).toContain(w.article.title);
    expect(text(f)).toContain(w.article.description);
  });
});
