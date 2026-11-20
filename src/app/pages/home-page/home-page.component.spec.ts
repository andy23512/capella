import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../assets/i18n/en.json';
import zhTw from '../../../assets/i18n/zh-TW.json';
import { UNITS } from '../../data/units';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslateService()],
    });
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.setTranslation('zh-TW', zhTw);
    translate.use('en');
  });

  function create() {
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();
    return fixture;
  }
  const text = (f: ReturnType<typeof create>) =>
    (f.nativeElement as HTMLElement).textContent!.replace(/\s+/g, ' ');

  it('shows the name, the tagline and the description', () => {
    const f = create();
    expect(f.nativeElement.querySelector('h1').textContent.trim()).toBe(
      'Capella',
    );
    expect(text(f)).toContain(en.home.tagline);
    expect(text(f)).toContain(en.home.description);
  });

  it('lists the two assumptions of the tutorial, in order', () => {
    const f = create();
    const items = Array.from(f.nativeElement.querySelectorAll('ol li')).map(
      (li) => (li as HTMLElement).textContent!.trim(),
    );
    expect(text(f)).toContain(en.home.assumptions.title);
    expect(items).toEqual([
      en.home.assumptions.keyboardLayout,
      en.home.assumptions.deviceDefaults,
    ]);
  });

  it('has a start button that opens the first chapter of the first unit', () => {
    const f = create();
    const a = f.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe(UNITS[0].chapters[0].path);
    expect(a.getAttribute('href')).toBe('/unit-1/introduction');
    expect(a.textContent).toContain(
      en.home.start.replace('{{unit}}', en.units['unit-1'].title),
    );
    expect(a.querySelector('mat-icon')!.textContent!.trim()).toBe(
      'arrow_forward',
    );
  });

  it('is written in the chosen language, with the unit title in it', () => {
    translate.use('zh-TW');
    const f = create();
    expect(text(f)).toContain(zhTw.home.description);
    expect(f.nativeElement.querySelector('a').textContent).toContain(
      zhTw.home.start.replace('{{unit}}', zhTw.units['unit-1'].title),
    );
  });
});
