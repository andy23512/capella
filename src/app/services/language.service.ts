import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type UiLanguage = 'en' | 'zh-TW';

export const SUPPORTED_LANGUAGES: readonly UiLanguage[] = ['en', 'zh-TW'];

const DEFAULT_LANGUAGE: UiLanguage = 'en';
const STORAGE_KEY = 'capella:ui-language';

function isUiLanguage(value: string | null): value is UiLanguage {
  return SUPPORTED_LANGUAGES.includes(value as UiLanguage);
}

/**
 * Maps a browser culture code (e.g. "zh-TW", "zh-Hant-TW", "zh-HK") to a
 * supported UI language. Anything unrecognised falls back to English.
 */
function resolveBrowserLanguage(cultureLang: string | undefined): UiLanguage {
  if (!cultureLang) {
    return DEFAULT_LANGUAGE;
  }
  if (isUiLanguage(cultureLang)) {
    return cultureLang;
  }
  const lower = cultureLang.toLowerCase();
  if (
    lower.startsWith('zh') &&
    (lower.includes('hant') ||
      lower.endsWith('-tw') ||
      lower.endsWith('-hk') ||
      lower.endsWith('-mo'))
  ) {
    return 'zh-TW';
  }
  return DEFAULT_LANGUAGE;
}

function loadStoredLanguage(): UiLanguage | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return isUiLanguage(stored) ? stored : null;
}

function saveLanguage(language: UiLanguage): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, language);
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translateService = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  private readonly languageSignal = signal<UiLanguage>(
    loadStoredLanguage() ??
      resolveBrowserLanguage(this.translateService.getBrowserCultureLang()),
  );

  readonly language = this.languageSignal.asReadonly();

  constructor() {
    effect(() => {
      const language = this.languageSignal();
      this.translateService.use(language);
      this.document.documentElement.lang = language;
    });
  }

  setLanguage(language: UiLanguage): void {
    this.languageSignal.set(language);
    saveLanguage(language);
  }
}
