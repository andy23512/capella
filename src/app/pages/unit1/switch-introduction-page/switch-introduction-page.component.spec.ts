import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../../assets/i18n/en.json';
import { UNITS } from '../../../data/units';
import { DeviceLayoutService } from '../../../services/device-layout.service';
import { SwitchIntroductionPageComponent } from './switch-introduction-page.component';

const chapters = UNITS.flatMap((u) => u.chapters);
describe('SwitchIntroductionPageComponent', () => {
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
    const fixture = TestBed.createComponent(SwitchIntroductionPageComponent);
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
    const i = chapters.findIndex((c) => c.id === '3d-switch-introduction');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(hrefs(create(), 'app-chapter-nav a')).toEqual(
      [chapters[i - 1], chapters[i + 1]].filter(Boolean).map((c) => c.path),
    );
  });

  it('shows its unit, and its own title as the heading', () => {
    const f = create();
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      en.units['unit-1'].title,
    );
    expect(root(f).querySelector('h1')!.textContent!.trim()).toBe(
      (en.chapters as Record<string, string>)['3d-switch-introduction'],
    );
  });

  const s = en.switchIntro;
  const checked = (f: F) =>
    Array.from(root(f).querySelectorAll('mat-button-toggle')).map((t) =>
      String(t.classList.contains('mat-button-toggle-checked')),
    );
  const toggles = (f: F) =>
    Array.from(
      root(f).querySelectorAll('mat-button-toggle button'),
    ) as HTMLButtonElement[];
  const photo = (f: F) =>
    root(f).querySelector('figure:last-of-type img') as HTMLImageElement;
  const orientationText = (f: F) =>
    root(f).querySelector('mat-button-toggle-group + p')!.textContent!.trim();

  it('introduces the 5-way switch, with the key term in bold', () => {
    const f = create();
    expect(root(f).querySelector('p.mt-6 strong')!.textContent).toBe(
      '5-way switch',
    );
  });

  it('lists the seven switch names, in order from the outside in', () => {
    const f = create();
    expect(
      Array.from(root(f).querySelectorAll('ol li')).map((li) =>
        li.textContent!.trim(),
      ),
    ).toEqual([
      s.names.pinky,
      s.names.ring,
      s.names.middle,
      s.names.index,
      s.names.thumb1,
      s.names.thumb2,
      s.names.thumb3,
    ]);
  });

  it('shows the thumb switch photo with its alt text and caption', () => {
    const f = create();
    const img = root(f).querySelector('figure img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(
      'assets/switch-orientation/thumb-switch-orientation.png',
    );
    expect(img.alt).toBe(s.thumbAlt);
    expect(text(f)).toContain(s.thumbPhotoCaption);
  });

  describe('orientation', () => {
    it('starts with the CC1 / CC2 / CCU explanation and photo', () => {
      const f = create();
      expect(orientationText(f)).toBe(s.ccOrientation);
      expect(photo(f).getAttribute('src')).toBe(
        'assets/switch-orientation/cc-switch-orientation.jpg',
      );
      expect(photo(f).alt).toBe(s.ccAlt);
      expect(toggles(f).map((b) => b.textContent!.trim())).toEqual([
        'CC1 / CC2 / CCU',
        'Master Forge',
      ]);
      expect(checked(f)).toEqual(['true', 'false']);
    });

    it('switches to the Master Forge explanation and photo, and back', () => {
      const f = create();
      toggles(f)[1].click();
      f.detectChanges();
      expect(orientationText(f)).toBe(s.forgeOrientation);
      expect(photo(f).getAttribute('src')).toBe(
        'assets/switch-orientation/forge-switch-orientation.png',
      );
      expect(photo(f).alt).toBe(s.forgeAlt);
      expect(checked(f)).toEqual(['false', 'true']);
      toggles(f)[0].click();
      f.detectChanges();
      expect(orientationText(f)).toBe(s.ccOrientation);
      expect(photo(f).alt).toBe(s.ccAlt);
    });

    it('links the photo credit and the quote to the review, in a new tab', () => {
      const f = create();
      const links = Array.from(
        root(f).querySelectorAll('figcaption a, blockquote a'),
      ) as HTMLAnchorElement[];
      expect(links.length).toBe(2);
      for (const a of links) {
        expect(a.getAttribute('href')).toBe(s.reviewUrl);
        expect(a.getAttribute('target')).toBe('_blank');
        expect(a.getAttribute('rel')).toContain('noopener');
      }
    });
  });

  it('closes with the two notes about natural direction and the centre press', () => {
    const f = create();
    expect(text(f)).toContain(s.naturalVaries);
    expect(text(f)).toContain(s.centerPress);
  });
});
