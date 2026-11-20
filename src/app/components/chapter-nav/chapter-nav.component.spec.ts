import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import en from '../../../assets/i18n/en.json';
import { UNITS } from '../../data/units';
import { ChapterNavComponent } from './chapter-nav.component';

describe('ChapterNavComponent', () => {
  const chapters = UNITS.flatMap((u) => u.chapters);
  const title = (id: string) => (en.chapters as Record<string, string>)[id];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslateService()],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
  });

  function create(chapterId: string) {
    const fixture = TestBed.createComponent(ChapterNavComponent);
    fixture.componentRef.setInput('chapterId', chapterId);
    fixture.detectChanges();
    return fixture;
  }
  type F = ReturnType<typeof create>;
  const buttons = (f: F) =>
    Array.from(f.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
  const text = (a: HTMLElement) =>
    a
      .querySelector('.mdc-button__label')!
      .textContent!.replace(/\s+/g, ' ')
      .trim();

  it('links to the chapter before and the one after, previous on the left', () => {
    const i = chapters.findIndex((c) => c.id === 'device-introduction');
    const f = create('device-introduction');
    const [prev, next] = buttons(f);
    expect(prev.getAttribute('href')).toBe(chapters[i - 1].path);
    expect(next.getAttribute('href')).toBe(chapters[i + 1].path);
    expect(prev.querySelector('mat-icon')!.textContent!.trim()).toBe(
      'arrow_back',
    );
    expect(next.querySelector('mat-icon')!.textContent!.trim()).toBe(
      'arrow_forward',
    );
    expect(prev.classList).toContain('mat-mdc-outlined-button');
    expect(next.classList).toContain('mat-mdc-unelevated-button');
  });

  it('names an ordinary chapter by its title alone', () => {
    const f = create('unit-1-introduction');
    // after the unit introduction comes an ordinary chapter
    expect(text(buttons(f)[0])).toBe(title('device-introduction'));
  });

  it('names an introduction or summary chapter with its unit in front', () => {
    const f = create('device-introduction');
    const [prev] = buttons(f);
    expect(text(prev)).toBe(
      `${en.units['unit-1'].shortTitle}: ${title('unit-1-introduction')}`,
    );
    const g = create('3d-switch-introduction');
    expect(text(buttons(g)[1])).toBe(
      `${en.units['unit-1'].shortTitle}: ${title('unit-1-summary')}`,
    );
  });

  it('has no previous button on the very first chapter, only the next one', () => {
    const f = create(chapters[0].id);
    expect(buttons(f).length).toBe(1);
    expect(buttons(f)[0].getAttribute('href')).toBe(chapters[1].path);
    // an empty spacer keeps the next button on the right
    const row = f.nativeElement.firstElementChild as HTMLElement;
    expect(row.children[0].tagName).toBe('SPAN');
    expect(row.children[0].childElementCount).toBe(0);
    expect(row.children[1]).toBe(buttons(f)[0]);
  });

  it('has no next button on the very last chapter, only the previous one', () => {
    const f = create(chapters.at(-1)!.id);
    expect(buttons(f).length).toBe(1);
    expect(buttons(f)[0].getAttribute('href')).toBe(chapters.at(-2)!.path);
    expect(buttons(f)[0].textContent).toContain('arrow_back');
  });

  it('shows nothing to go to for an unknown chapter', () => {
    expect(buttons(create('no-such-chapter')).length).toBe(0);
  });

  it('follows a change of chapter', () => {
    const f = create(chapters[0].id);
    f.componentRef.setInput('chapterId', chapters[5].id);
    f.detectChanges();
    expect(buttons(f).map((a) => a.getAttribute('href'))).toEqual([
      chapters[4].path,
      chapters[6].path,
    ]);
  });
});
