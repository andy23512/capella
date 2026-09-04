import { Route } from '@angular/router';

export const APP_ROUTES: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/home-page/home-page.component').then(
        (m) => m.HomePageComponent,
      ),
  },
  {
    path: 'learning-map',
    loadComponent: () =>
      import(
        './pages/learning-map-page/learning-map-page.component'
      ).then((m) => m.LearningMapPageComponent),
  },
  {
    path: 'unit-1/introduction',
    loadComponent: () =>
      import(
        './pages/unit1/introduction-page/introduction-page.component'
      ).then((m) => m.Unit1IntroductionPageComponent),
  },
  {
    path: 'unit-1/device-introduction',
    loadComponent: () =>
      import(
        './pages/unit1/device-introduction-page/device-introduction-page.component'
      ).then((m) => m.DeviceIntroductionPageComponent),
  },
  {
    path: 'unit-1/3d-switch-introduction',
    loadComponent: () =>
      import(
        './pages/unit1/switch-introduction-page/switch-introduction-page.component'
      ).then((m) => m.SwitchIntroductionPageComponent),
  },
  {
    path: 'unit-1/summary',
    loadComponent: () =>
      import('./pages/unit1/summary-page/summary-page.component').then(
        (m) => m.Unit1SummaryPageComponent,
      ),
  },
  {
    path: 'unit-2/introduction',
    loadComponent: () =>
      import(
        './pages/unit2/introduction-page/introduction-page.component'
      ).then((m) => m.Unit2IntroductionPageComponent),
  },
  {
    path: 'unit-2/letters',
    loadComponent: () =>
      import('./pages/unit2/letters-page/letters-page.component').then(
        (m) => m.LettersPageComponent,
      ),
  },
  {
    path: 'unit-2/number',
    loadComponent: () =>
      import('./pages/unit2/number-page/number-page.component').then(
        (m) => m.NumberPageComponent,
      ),
  },
  {
    path: 'unit-2/symbols',
    loadComponent: () =>
      import('./pages/unit2/symbols-page/symbols-page.component').then(
        (m) => m.SymbolsPageComponent,
      ),
  },
  {
    path: 'unit-2/functional-keys',
    loadComponent: () =>
      import(
        './pages/unit2/functional-keys-page/functional-keys-page.component'
      ).then((m) => m.FunctionalKeysPageComponent),
  },
  {
    path: 'unit-2/function-keys',
    loadComponent: () =>
      import(
        './pages/unit2/function-keys-page/function-keys-page.component'
      ).then((m) => m.FunctionKeysPageComponent),
  },
  {
    path: 'unit-2/mouse-features',
    loadComponent: () =>
      import(
        './pages/unit2/mouse-features-page/mouse-features-page.component'
      ).then((m) => m.MouseFeaturesPageComponent),
  },
  {
    path: 'unit-2/summary',
    loadComponent: () =>
      import('./pages/unit2/summary-page/summary-page.component').then(
        (m) => m.Unit2SummaryPageComponent,
      ),
  },
  {
    path: 'unit-3/introduction',
    loadComponent: () =>
      import(
        './pages/unit3/introduction-page/introduction-page.component'
      ).then((m) => m.Unit3IntroductionPageComponent),
  },
  {
    path: 'unit-3/dup',
    loadComponent: () =>
      import('./pages/unit3/dup-page/dup-page.component').then(
        (m) => m.DupPageComponent,
      ),
  },
  {
    path: 'unit-3/ambidextrous-throwover',
    loadComponent: () =>
      import(
        './pages/unit3/ambidextrous-throwover-page/ambidextrous-throwover-page.component'
      ).then((m) => m.AmbidextrousThrowoverPageComponent),
  },
  {
    path: 'unit-3/summary',
    loadComponent: () =>
      import('./pages/unit3/summary-page/summary-page.component').then(
        (m) => m.Unit3SummaryPageComponent,
      ),
  },
  {
    path: 'unit-4/introduction',
    loadComponent: () =>
      import(
        './pages/unit4/introduction-page/introduction-page.component'
      ).then((m) => m.Unit4IntroductionPageComponent),
  },
  {
    path: 'unit-4/simple-chord',
    loadComponent: () =>
      import(
        './pages/unit4/simple-chord-page/simple-chord-page.component'
      ).then((m) => m.SimpleChordPageComponent),
  },
  {
    path: 'unit-4/impulse-chord',
    loadComponent: () =>
      import(
        './pages/unit4/impulse-chord-page/impulse-chord-page.component'
      ).then((m) => m.ImpulseChordPageComponent),
  },
  {
    path: 'unit-4/impulse-chord/practice',
    loadComponent: () =>
      import(
        './pages/unit4/impulse-chord-practice-page/impulse-chord-practice-page.component'
      ).then((m) => m.ImpulseChordPracticePageComponent),
  },
  {
    path: 'unit-4/chord-modifier',
    loadComponent: () =>
      import(
        './pages/unit4/chord-modifier-page/chord-modifier-page.component'
      ).then((m) => m.ChordModifierPageComponent),
  },
  {
    path: 'unit-4/summary',
    loadComponent: () =>
      import('./pages/unit4/summary-page/summary-page.component').then(
        (m) => m.Unit4SummaryPageComponent,
      ),
  },
  {
    path: 'unit-5/introduction',
    loadComponent: () =>
      import(
        './pages/unit5/introduction-page/introduction-page.component'
      ).then((m) => m.Unit5IntroductionPageComponent),
  },
  {
    path: 'unit-5/compound-chord',
    loadComponent: () =>
      import(
        './pages/unit5/compound-chord-page/compound-chord-page.component'
      ).then((m) => m.CompoundChordPageComponent),
  },
  {
    path: 'unit-5/dynamic-chord-library',
    loadComponent: () =>
      import(
        './pages/unit5/dynamic-chord-library-page/dynamic-chord-library-page.component'
      ).then((m) => m.DynamicChordLibraryPageComponent),
  },
  {
    path: 'unit-5/summary',
    loadComponent: () =>
      import('./pages/unit5/summary-page/summary-page.component').then(
        (m) => m.Unit5SummaryPageComponent,
      ),
  },
  {
    path: 'exercise/:exerciseId',
    loadComponent: () =>
      import('./pages/exercise-page/exercise-page.component').then(
        (m) => m.ExercisePageComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings-page/settings-page.component').then(
        (m) => m.SettingsPageComponent,
      ),
  },
];
