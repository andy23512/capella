import { TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../assets/i18n/en.json';
import { Device } from '../../models/device.models';
import { DeviceCardComponent } from './device-card.component';

const DEVICE: Device = {
  id: 'cc1',
  name: 'CharaChorder One',
  abbreviation: 'CC1',
  taglineKey: 'deviceCard.officialProductPage',
  descriptionKey: 'deviceCard.switchesPerHand',
  switchesPerHand: 9,
  thumbSwitchesPerHand: 3,
};

describe('DeviceCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      ...en,
      test: {
        tagline: 'A tagline',
        description: 'A description',
        notes: 'Some notes',
      },
    });
    translate.use('en');
  });

  function create(overrides: Partial<Device> = {}) {
    const fixture = TestBed.createComponent(DeviceCardComponent);
    fixture.componentRef.setInput('device', {
      ...DEVICE,
      taglineKey: 'test.tagline',
      descriptionKey: 'test.description',
      ...overrides,
    });
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const root = (f: F) => f.nativeElement as HTMLElement;
  const text = (f: F) => root(f).textContent!.replace(/\s+/g, ' ');
  const dots = (f: F) => {
    const hands = Array.from(root(f).querySelectorAll('[aria-hidden] > div'));
    return hands.map((h) => ({
      plain: h.querySelectorAll('.bg-gray-300').length,
      thumb: h.querySelectorAll('.bg-capella-500').length,
    }));
  };

  it('shows the name, the tagline and the description', () => {
    const f = create();
    expect(root(f).querySelector('h3')!.textContent!.trim()).toBe(
      'CharaChorder One',
    );
    expect(text(f)).toContain('A tagline');
    expect(text(f)).toContain('A description');
  });

  it('shows the abbreviation next to a different name, and leaves it out when it is the same', () => {
    expect(text(create())).toContain('CC1');
    const f = create({ name: 'Master Forge', abbreviation: 'Master Forge' });
    expect(root(f).querySelectorAll('h3 + span').length).toBe(0);
    expect(text(f).match(/Master Forge/g)!.length).toBe(1);
  });

  it('draws one dot for each switch of each hand, thumb switches in the accent colour', () => {
    expect(dots(create())).toEqual([
      { plain: 6, thumb: 3 },
      { plain: 6, thumb: 3 },
    ]);
    expect(
      dots(create({ switchesPerHand: 8, thumbSwitchesPerHand: 2 })),
    ).toEqual([
      { plain: 6, thumb: 2 },
      { plain: 6, thumb: 2 },
    ]);
  });

  it('says how many switches and thumb switches each hand has', () => {
    const f = create({ switchesPerHand: 8, thumbSwitchesPerHand: 2 });
    expect(text(f)).toContain('8 switches / hand');
    expect(text(f)).toContain('2 thumb switches / hand');
  });

  describe('notes', () => {
    it('are left out unless there are some', () => {
      expect(root(create()).querySelector('.border-t')).toBeNull();
    });
    it('are shown when there are some', () => {
      const f = create({ notesKey: 'test.notes' });
      expect(root(f).querySelector('.border-t')!.textContent!.trim()).toBe(
        'Some notes',
      );
    });
  });

  describe('product link', () => {
    it('is left out unless there is an address', () => {
      expect(root(create()).querySelector('a')).toBeNull();
    });
    it('opens the address in a new tab, without handing over the opener', () => {
      const f = create({ productUrl: 'https://example.com/cc1' });
      const a = root(f).querySelector('a')!;
      expect(a.getAttribute('href')).toBe('https://example.com/cc1');
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
      expect(a.textContent!.trim()).toBe('Official product page');
    });
  });
});
