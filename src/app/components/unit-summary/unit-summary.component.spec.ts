import { TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../assets/i18n/en.json';
import { Unit } from '../../models/content.models';
import { UNITS } from '../../data/units';
import { UnitSummaryComponent } from './unit-summary.component';

describe('UnitSummaryComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
  });

  function create(unit: Unit = UNITS[0]) {
    const fixture = TestBed.createComponent(UnitSummaryComponent);
    fixture.componentRef.setInput('unit', unit);
    fixture.detectChanges();
    return fixture;
  }
  const root = (f: ReturnType<typeof create>) => f.nativeElement as HTMLElement;

  it('shows the unit title, the heading and the summary', () => {
    const f = create(UNITS[0]);
    expect(root(f).querySelector('p')!.textContent!.trim()).toBe(
      en.units['unit-1'].title,
    );
    expect(root(f).querySelector('h1')!.textContent!.trim()).toBe('Summary');
    expect(root(f).textContent).toContain(en.units['unit-1'].summary);
  });

  it('lists the resources of the unit as links that open in a new tab', () => {
    const f = create(UNITS[0]);
    expect(root(f).querySelector('h2')!.textContent!.trim()).toBe(
      'Other resources',
    );
    const links = Array.from(
      root(f).querySelectorAll('ul li a'),
    ) as HTMLAnchorElement[];
    const resources = en.units['unit-1'].resources;
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      resources.resource1.url,
      resources.resource2.url,
      resources.resource3.url,
    ]);
    expect(links.map((a) => a.textContent!.trim())).toEqual([
      resources.resource1.label,
      resources.resource2.label,
      resources.resource3.label,
    ]);
    for (const a of links) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
    }
  });

  it('leaves the resource list out for a unit without resources', () => {
    for (const resources of [undefined, []]) {
      const f = create({ ...UNITS[0], resources });
      expect(root(f).querySelector('h2')).toBeNull();
      expect(root(f).querySelector('ul')).toBeNull();
    }
  });
});
