import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../../assets/i18n/en.json';
import { UNITS } from '../../../data/units';
import { DeviceLayoutService } from '../../../services/device-layout.service';
import { AmbidextrousThrowoverPageComponent } from './ambidextrous-throwover-page.component';

const chapters = UNITS.flatMap((u) => u.chapters);
describe('AmbidextrousThrowoverPageComponent', () => {
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
    const fixture = TestBed.createComponent(AmbidextrousThrowoverPageComponent);
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
    const i = chapters.findIndex((c) => c.id === 'ambidextrous-throwover');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(hrefs(create(), 'app-chapter-nav a')).toEqual(
      [chapters[i - 1], chapters[i + 1]].filter(Boolean).map((c) => c.path),
    );
  });

  it('shows its unit, and its own title as the heading', () => {
    const f = create();
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      en.units['unit-3'].title,
    );
    expect(root(f).querySelector('h1')!.textContent!.trim()).toBe(
      (en.chapters as Record<string, string>)['ambidextrous-throwover'],
    );
  });

  const a = en.atPage;
  const checked = (f: F) =>
    Array.from(root(f).querySelectorAll('mat-button-toggle')).map((t) =>
      String(t.classList.contains('mat-button-toggle-checked')),
    );
  const toggles = (f: F) =>
    Array.from(
      root(f).querySelectorAll('mat-button-toggle button'),
    ) as HTMLButtonElement[];
  const choose = (f: F, i: number) => {
    toggles(f)[i].click();
    f.detectChanges();
  };
  const caption = (f: F) =>
    root(f).querySelector('mat-button-toggle-group + p')!.textContent!.trim();
  const labelTexts = (f: F) =>
    Array.from(root(f).querySelectorAll('app-layout text')).map((t) =>
      t.textContent!.trim(),
    );
  /** Horizontal centre of every switch that is lit. */
  const litCentres = (f: F) =>
    Array.from(root(f).querySelectorAll('g[appGridSwitch]'))
      .filter((g) => g.querySelector('.fill-capella-500, .fill-blue-400'))
      .map((g) =>
        Number(g.querySelector(':scope > circle')!.getAttribute('cx')),
      );

  /** The letters written on the switches of one half, sorted, without AT. */
  const halfLetters = (f: F, side: 'left' | 'right') =>
    Array.from(root(f).querySelectorAll('g[appGridSwitch]'))
      .filter((g) => {
        const x = Number(
          g.querySelector(':scope > circle')!.getAttribute('cx'),
        );
        return side === 'left' ? x < 1108 : x > 1108;
      })
      .flatMap((g) =>
        Array.from(g.querySelectorAll('text')).map((t) =>
          t.textContent!.trim(),
        ),
      )
      .filter((t) => t !== 'AT')
      .sort();

  it('explains the key and how to try it', () => {
    const f = create();
    for (const k of [a.intro1, a.intro2, a.try, a.mirrorNote]) {
      expect(text(f)).toContain(k);
    }
  });

  it('offers three modes, starting with the default', () => {
    const f = create();
    expect(toggles(f).map((b) => b.textContent!.trim())).toEqual([
      a.modeDefault,
      a.modeLeft,
      a.modeRight,
    ]);
    expect(checked(f)).toEqual(['true', 'false', 'false']);
    expect(caption(f)).toBe(a.captionDefault);
  });

  it('shows no highlight and no AT label by default', () => {
    const f = create();
    expect(litCentres(f)).toEqual([]);
    expect(labelTexts(f)).not.toContain('AT');
  });

  it('holding left AT lights switches on the left half and labels one AT', () => {
    const f = create();
    const before = labelTexts(f);
    choose(f, 1);
    expect(caption(f)).toBe(a.captionLeft);
    expect(labelTexts(f).filter((t) => t === 'AT').length).toBe(1);
    const lit = litCentres(f);
    expect(lit.length).toBeGreaterThan(0);
    for (const x of lit) expect(x).toBeLessThan(1108);
    expect(labelTexts(f)).not.toEqual(before);
  });

  it('holding right AT lights switches on the right half and labels one AT', () => {
    const f = create();
    choose(f, 2);
    expect(caption(f)).toBe(a.captionRight);
    expect(labelTexts(f).filter((t) => t === 'AT').length).toBe(1);
    const lit = litCentres(f);
    expect(lit.length).toBeGreaterThan(0);
    for (const x of lit) expect(x).toBeGreaterThan(1108);
  });

  it('holding an AT brings the letters of the other hand onto this one', () => {
    const f = create();
    const left = halfLetters(f, 'left');
    const right = halfLetters(f, 'right');
    expect(left.length).toBeGreaterThan(10);
    expect(left).not.toEqual(right);
    choose(f, 1);
    expect(
      halfLetters(f, 'left').filter((l) => right.includes(l)).length,
    ).toBeGreaterThan(left.filter((l) => right.includes(l)).length);
    expect(halfLetters(f, 'left')).toEqual(
      right.slice(0, halfLetters(f, 'left').length),
    );
    choose(f, 2);
    expect(halfLetters(f, 'right')).toEqual(
      left.slice(0, halfLetters(f, 'right').length),
    );
  });

  it('mirrors differently for each hand, and goes back to the default', () => {
    const f = create();
    const initial = labelTexts(f);
    choose(f, 1);
    const left = labelTexts(f);
    choose(f, 2);
    const right = labelTexts(f);
    expect(left).not.toEqual(right);
    choose(f, 0);
    expect(labelTexts(f)).toEqual(initial);
    expect(caption(f)).toBe(a.captionDefault);
    expect(litCentres(f)).toEqual([]);
  });
});
