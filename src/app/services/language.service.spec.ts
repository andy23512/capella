import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { LanguageService, SUPPORTED_LANGUAGES } from './language.service';

const KEY = 'capella:ui-language';

describe('LanguageService', () => {
  function create(browserLang: string | undefined): LanguageService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    spyOn(
      TestBed.inject(TranslateService),
      'getBrowserCultureLang',
    ).and.returnValue(browserLang as string);
    const service = TestBed.inject(LanguageService);
    TestBed.tick();
    return service;
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    TestBed.inject(DOCUMENT).documentElement.lang = '';
  });

  it('supports English and Traditional Chinese', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'zh-TW']);
  });

  describe('first visit, following the browser', () => {
    const cases: [string | undefined, string][] = [
      ['en', 'en'],
      ['zh-TW', 'zh-TW'],
      ['zh-Hant-TW', 'zh-TW'],
      ['zh-Hant', 'zh-TW'],
      ['zh-HK', 'zh-TW'],
      ['zh-MO', 'zh-TW'],
      ['ZH-tw', 'zh-TW'],
      ['zh-CN', 'en'],
      ['zh-Hans', 'en'],
      ['zh', 'en'],
      ['ja', 'en'],
      ['en-US', 'en'],
      ['', 'en'],
      [undefined, 'en'],
    ];
    for (const [browser, expected] of cases) {
      it(`${JSON.stringify(browser)} -> ${expected}`, () => {
        expect(create(browser).language()).toBe(expected as 'en');
      });
    }
  });

  describe('a saved choice', () => {
    it('wins over the browser language', () => {
      localStorage.setItem(KEY, 'en');
      expect(create('zh-TW').language()).toBe('en');
      localStorage.setItem(KEY, 'zh-TW');
      expect(create('en').language()).toBe('zh-TW');
    });

    it('is ignored when it is not a supported language', () => {
      localStorage.setItem(KEY, 'fr');
      expect(create('zh-TW').language()).toBe('zh-TW');
    });
  });

  describe('setLanguage', () => {
    it('changes the language, saves it and sets the page language', () => {
      const service = create('en');
      service.setLanguage('zh-TW');
      TestBed.tick();
      expect(service.language()).toBe('zh-TW');
      expect(localStorage.getItem(KEY)).toBe('zh-TW');
      expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('zh-TW');
      expect(TestBed.inject(TranslateService).getCurrentLang()).toBe('zh-TW');
    });

    it('sets the page language at the start, too', () => {
      create('zh-TW');
      expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('zh-TW');
    });
  });

  it('puts the translated descriptions into the page meta tags', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', { meta: { description: 'D', ogDescription: 'OG' } });
    spyOn(t, 'getBrowserCultureLang').and.returnValue('en');
    TestBed.inject(LanguageService);
    TestBed.tick();
    const meta = TestBed.inject(Meta);
    expect(meta.getTag('name="description"')?.content).toBe('D');
    expect(meta.getTag('property="og:description"')?.content).toBe('OG');
  });
});
