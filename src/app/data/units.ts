import { Unit } from '../models/content.models';

export const UNITS: Unit[] = [
  {
    id: 'unit-1',
    title: 'Unit 1: Introduction',
    introduction:
      "This unit lays the groundwork before you touch a device: what a CharaChorder 3D input device actually is, and the 5-way switch mechanic that every device in the lineup is built around. You'll meet the four current devices, then get hands-on with an interactive switch diagram that shows how tilt direction — and its orientation — changes what a single switch can do.",
    summary:
      "You've now seen the four CharaChorder 3D input devices — CC1, CC2, CCU, and Master Forge — and how their shared 5-way switch mechanic turns one physical switch into up to five inputs. You also saw that switch orientation is not universal: CC1/CC2/CCU align with natural finger movement, while Master Forge aligns with the digitizer edge instead. With that foundation in place, Unit 2 moves on to actually practicing the standard key set.",
    resources: [
      {
        label: 'CharaChorder Docs',
        url: 'https://docs.charachorder.com/',
      },
      {
        label: "Tangent's review of Master Forge",
        url: 'https://andy23512.github.io/blog/tangent-s-review-to-master-forge/',
      },
    ],
    chapters: [
      {
        id: 'unit-1-introduction',
        unitId: 'unit-1',
        title: 'Introduction',
        path: '/unit-1/introduction',
        kind: 'intro',
      },
      {
        id: 'device-introduction',
        unitId: 'unit-1',
        title: 'Chapter 1: Device introduction',
        path: '/unit-1/device-introduction',
      },
      {
        id: '3d-switch-introduction',
        unitId: 'unit-1',
        title: 'Chapter 2: 3D switch introduction',
        path: '/unit-1/3d-switch-introduction',
      },
      {
        id: 'unit-1-summary',
        unitId: 'unit-1',
        title: 'Summary',
        path: '/unit-1/summary',
        kind: 'summary',
      },
    ],
  },
  {
    id: 'unit-2',
    title: 'Unit 2: Standard Keys',
    introduction:
      "With the switch mechanic down, it's time to put it to work. This unit drills the standard key set you already know from a regular keyboard — letters, numbers, symbols, functional keys like Enter and Backspace, and the F1–F12 function keys — but on the CharaChorder's 5-way switches. It closes with the device's built-in mouse features, all without leaving the switches. Each chapter pairs a short exercise with a live layout diagram that lights up exactly which switch to press.",
    summary:
      "You've now practiced the full standard key set on the CharaChorder's switches — letters, numbers, symbols, functional keys, the F1–F12 row, and the built-in mouse features — using the same layout diagram and highlight mechanic throughout. That coverage is the foundation for everything else the device can do, including the chorded shortcuts and word output that make CharaChorder devices distinct from a regular keyboard.",
    resources: [
      {
        label:
          "Tangent's suggestions for learning English character entry on CharaChorder 3D input devices",
        url: 'https://andy23512.github.io/blog/tangent-s-suggestions-for-learning-english-character-entry-on-charachorder-3d-input-devices/',
      },
    ],
    chapters: [
      {
        id: 'unit-2-introduction',
        unitId: 'unit-2',
        title: 'Introduction',
        path: '/unit-2/introduction',
        kind: 'intro',
      },
      {
        id: 'letters',
        unitId: 'unit-2',
        title: 'Chapter 1: Letters',
        path: '/unit-2/letters',
      },
      {
        id: 'number',
        unitId: 'unit-2',
        title: 'Chapter 2: Number',
        path: '/unit-2/number',
      },
      {
        id: 'symbols',
        unitId: 'unit-2',
        title: 'Chapter 3: Symbols',
        path: '/unit-2/symbols',
      },
      {
        id: 'functional-keys',
        unitId: 'unit-2',
        title: 'Chapter 4: Functional Keys',
        path: '/unit-2/functional-keys',
      },
      {
        id: 'function-keys',
        unitId: 'unit-2',
        title: 'Chapter 5: Function Keys',
        path: '/unit-2/function-keys',
      },
      {
        id: 'mouse-features',
        unitId: 'unit-2',
        title: 'Chapter 6: Mouse Features',
        path: '/unit-2/mouse-features',
      },
      {
        id: 'unit-2-summary',
        unitId: 'unit-2',
        title: 'Summary',
        path: '/unit-2/summary',
        kind: 'summary',
      },
    ],
  },
  {
    id: 'unit-3',
    title: 'Unit 3: CharaChorder Special Keys',
    introduction:
      "Beyond the standard key set, CharaChorder devices add a few features unique to chorded input. This unit covers two of them: DUP, which repeats your last input — handy for double letters — and Ambidextrous Throwover, a one-handed entry mode that mirrors the opposite hand's characters onto the hand using it.",
    summary:
      "You've now seen DUP and Ambidextrous Throwover — two features with no equivalent on a regular keyboard. DUP saves a repeat press by echoing your last input, while Ambidextrous Throwover lets a single hand reach the full character set when the other is occupied. Together with the standard key set from Unit 2, that covers the core building blocks the CharaChorder's chorded shortcuts and word output build on next.",
    resources: [
      {
        label: 'CharaChorder Docs — Glossary',
        url: 'https://docs.charachorder.com/Glossary.html',
      },
    ],
    chapters: [
      {
        id: 'unit-3-introduction',
        unitId: 'unit-3',
        title: 'Introduction',
        path: '/unit-3/introduction',
        kind: 'intro',
      },
      {
        id: 'dup',
        unitId: 'unit-3',
        title: 'Chapter 1: DUP',
        path: '/unit-3/dup',
      },
      {
        id: 'ambidextrous-throwover',
        unitId: 'unit-3',
        title: 'Chapter 2: Ambidextrous Throwover',
        path: '/unit-3/ambidextrous-throwover',
      },
      {
        id: 'unit-3-summary',
        unitId: 'unit-3',
        title: 'Summary',
        path: '/unit-3/summary',
        kind: 'summary',
      },
    ],
  },
  {
    id: 'unit-4',
    title: 'Unit 4: Basic Chording',
    introduction:
      "Every unit so far has been character entry — one switch at a time. This unit introduces the CharaChorder's other mode: chording, where pressing several switches together produces something other than those characters in sequence, like a whole word. You'll see the basic mechanic, an on-the-fly variant called an impulse chord, and how modifiers change a chord's output — arpeggiated in right after it, a quick tap rather than a hold, without slowing you down.",
    summary:
      "You've now seen the core chording mechanic: pressing multiple switches together for one output, impulse chords for training something on the spot, and chord modifiers for changing a chord's prefix, suffix, capitalization, and more — arpeggiated in with a quick tap right after the chord rather than a hold. Together with the standard key set and special keys from Units 2 and 3, that's the complete toolkit this tutorial covers for getting text and commands out through a CharaChorder's switches.",
    resources: [
      {
        label: 'CharaChorder Docs — Glossary',
        url: 'https://docs.charachorder.com/Glossary.html',
      },
    ],
    chapters: [
      {
        id: 'unit-4-introduction',
        unitId: 'unit-4',
        title: 'Introduction',
        path: '/unit-4/introduction',
        kind: 'intro',
      },
      {
        id: 'simple-chord',
        unitId: 'unit-4',
        title: 'Chapter 1: Simple Chord',
        path: '/unit-4/simple-chord',
      },
      {
        id: 'impulse-chord',
        unitId: 'unit-4',
        title: 'Chapter 2: Impulse Chord',
        path: '/unit-4/impulse-chord',
      },
      {
        id: 'chord-modifier',
        unitId: 'unit-4',
        title: 'Chapter 3: Chord Modifier',
        path: '/unit-4/chord-modifier',
      },
      {
        id: 'unit-4-summary',
        unitId: 'unit-4',
        title: 'Summary',
        path: '/unit-4/summary',
        kind: 'summary',
      },
    ],
  },
];
