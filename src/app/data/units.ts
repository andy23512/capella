import { Unit } from '../models/content.models';

export const UNITS: Unit[] = [
  {
    id: 'unit-1',
    titleKey: 'units.unit-1.title',
    shortTitleKey: 'units.unit-1.shortTitle',
    introductionKey: 'units.unit-1.introduction',
    summaryKey: 'units.unit-1.summary',
    resources: [
      {
        labelKey: 'units.unit-1.resources.resource1.label',
        urlKey: 'units.unit-1.resources.resource1.url',
      },
      {
        labelKey: 'units.unit-1.resources.resource2.label',
        urlKey: 'units.unit-1.resources.resource2.url',
      },
    ],
    chapters: [
      {
        id: 'unit-1-introduction',
        unitId: 'unit-1',
        titleKey: 'chapters.unit-1-introduction',
        path: '/unit-1/introduction',
        kind: 'intro',
      },
      {
        id: 'device-introduction',
        unitId: 'unit-1',
        titleKey: 'chapters.device-introduction',
        path: '/unit-1/device-introduction',
      },
      {
        id: '3d-switch-introduction',
        unitId: 'unit-1',
        titleKey: 'chapters.3d-switch-introduction',
        path: '/unit-1/3d-switch-introduction',
      },
      {
        id: 'unit-1-summary',
        unitId: 'unit-1',
        titleKey: 'chapters.unit-1-summary',
        path: '/unit-1/summary',
        kind: 'summary',
      },
    ],
  },
  {
    id: 'unit-2',
    titleKey: 'units.unit-2.title',
    shortTitleKey: 'units.unit-2.shortTitle',
    introductionKey: 'units.unit-2.introduction',
    summaryKey: 'units.unit-2.summary',
    resources: [
      {
        labelKey: 'units.unit-2.resources.resource1.label',
        urlKey: 'units.unit-2.resources.resource1.url',
      },
    ],
    chapters: [
      {
        id: 'unit-2-introduction',
        unitId: 'unit-2',
        titleKey: 'chapters.unit-2-introduction',
        path: '/unit-2/introduction',
        kind: 'intro',
      },
      {
        id: 'letters',
        unitId: 'unit-2',
        titleKey: 'chapters.letters',
        path: '/unit-2/letters',
      },
      {
        id: 'number',
        unitId: 'unit-2',
        titleKey: 'chapters.number',
        path: '/unit-2/number',
      },
      {
        id: 'symbols',
        unitId: 'unit-2',
        titleKey: 'chapters.symbols',
        path: '/unit-2/symbols',
      },
      {
        id: 'functional-keys',
        unitId: 'unit-2',
        titleKey: 'chapters.functional-keys',
        path: '/unit-2/functional-keys',
      },
      {
        id: 'function-keys',
        unitId: 'unit-2',
        titleKey: 'chapters.function-keys',
        path: '/unit-2/function-keys',
      },
      {
        id: 'mouse-features',
        unitId: 'unit-2',
        titleKey: 'chapters.mouse-features',
        path: '/unit-2/mouse-features',
      },
      {
        id: 'unit-2-summary',
        unitId: 'unit-2',
        titleKey: 'chapters.unit-2-summary',
        path: '/unit-2/summary',
        kind: 'summary',
      },
    ],
  },
  {
    id: 'unit-3',
    titleKey: 'units.unit-3.title',
    shortTitleKey: 'units.unit-3.shortTitle',
    introductionKey: 'units.unit-3.introduction',
    summaryKey: 'units.unit-3.summary',
    resources: [
      {
        labelKey: 'units.unit-3.resources.resource1.label',
        urlKey: 'units.unit-3.resources.resource1.url',
      },
    ],
    chapters: [
      {
        id: 'unit-3-introduction',
        unitId: 'unit-3',
        titleKey: 'chapters.unit-3-introduction',
        path: '/unit-3/introduction',
        kind: 'intro',
      },
      {
        id: 'dup',
        unitId: 'unit-3',
        titleKey: 'chapters.dup',
        path: '/unit-3/dup',
      },
      {
        id: 'ambidextrous-throwover',
        unitId: 'unit-3',
        titleKey: 'chapters.ambidextrous-throwover',
        path: '/unit-3/ambidextrous-throwover',
      },
      {
        id: 'unit-3-summary',
        unitId: 'unit-3',
        titleKey: 'chapters.unit-3-summary',
        path: '/unit-3/summary',
        kind: 'summary',
      },
    ],
  },
  {
    id: 'unit-4',
    titleKey: 'units.unit-4.title',
    shortTitleKey: 'units.unit-4.shortTitle',
    introductionKey: 'units.unit-4.introduction',
    summaryKey: 'units.unit-4.summary',
    resources: [
      {
        labelKey: 'units.unit-4.resources.resource1.label',
        urlKey: 'units.unit-4.resources.resource1.url',
      },
      {
        labelKey: 'units.unit-4.resources.resource2.label',
        urlKey: 'units.unit-4.resources.resource2.url',
      },
    ],
    chapters: [
      {
        id: 'unit-4-introduction',
        unitId: 'unit-4',
        titleKey: 'chapters.unit-4-introduction',
        path: '/unit-4/introduction',
        kind: 'intro',
      },
      {
        id: 'simple-chord',
        unitId: 'unit-4',
        titleKey: 'chapters.simple-chord',
        path: '/unit-4/simple-chord',
      },
      {
        id: 'impulse-chord',
        unitId: 'unit-4',
        titleKey: 'chapters.impulse-chord',
        path: '/unit-4/impulse-chord',
      },
      {
        id: 'unit-4-summary',
        unitId: 'unit-4',
        titleKey: 'chapters.unit-4-summary',
        path: '/unit-4/summary',
        kind: 'summary',
      },
    ],
  },
];
