import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../assets/i18n/en.json';
import { UNITS } from '../../data/units';
import { UnitIntroComponent } from './unit-intro.component';

describe('UnitIntroComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslateService()],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
  });

  function create(unit = UNITS[1]) {
    const fixture = TestBed.createComponent(UnitIntroComponent);
    fixture.componentRef.setInput('unit', unit);
    fixture.detectChanges();
    return fixture;
  }
  const root = (f: ReturnType<typeof create>) => f.nativeElement as HTMLElement;

  it('shows the unit title, the heading and the introduction', () => {
    const f = create(UNITS[1]);
    const unit = (en.units as any)['unit-2'];
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(unit.title);
    expect(root(f).querySelector('h1')!.textContent!.trim()).toBe(
      'Introduction',
    );
    expect(root(f).textContent).toContain(unit.introduction);
    expect(root(f).querySelector('h2')!.textContent!.trim()).toBe(
      'In this unit',
    );
  });

  it('lists the content chapters in order, linking to them, without the introduction and summary', () => {
    for (const unit of UNITS) {
      const f = create(unit);
      const content = unit.chapters.filter((c) => !c.kind);
      const links = Array.from(root(f).querySelectorAll('ol li a'));
      expect(links.map((a) => a.getAttribute('href'))).toEqual(
        content.map((c) => c.path),
      );
      expect(links.map((a) => a.textContent!.trim())).toEqual(
        content.map((c) => (en.chapters as any)[c.id]),
      );
    }
  });

  it('leaves out the introduction and summary chapters', () => {
    const f = create(UNITS[0]);
    expect(UNITS[0].chapters.some((c) => c.kind)).toBeTrue();
    const hrefs = Array.from(root(f).querySelectorAll('ol li a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).not.toContain('/unit-1/introduction');
    expect(hrefs).not.toContain('/unit-1/summary');
    expect(hrefs.length).toBe(UNITS[0].chapters.length - 2);
  });

  it('follows a change of unit', () => {
    const f = create(UNITS[0]);
    f.componentRef.setInput('unit', UNITS[2]);
    f.detectChanges();
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      (en.units as any)['unit-3'].title,
    );
  });
});
