import { Device } from '../models/device.models';

export const DEVICES: Device[] = [
  {
    id: 'cc1',
    name: 'CharaChorder One',
    abbreviation: 'CC1',
    tagline: 'The original — fully assembled',
    description:
      'The device that started it all. Two halves are joined by a removable machined-aluminum center bar and talk to each other over a 3.5mm TRS cable, with a single USB-C-to-USB-A cable for power and data. Plug-and-play, with three configurable layers (plus shift) stored on the device itself.',
    switchesPerHand: 9,
    thumbSwitchesPerHand: 3,
    notes:
      'The pinky switch is flatter and wider than the rest for easier reach.',
  },
  {
    id: 'cc2',
    name: 'CharaChorder Two',
    abbreviation: 'CC2',
    tagline: 'Lighter, quieter, more durable',
    description:
      'A refined second generation on the same split, cabled form factor as CC1. Switches are nearly twice as light to actuate, over four times quieter, and rated to last five times longer — with keycaps you can actually replace.',
    switchesPerHand: 9,
    thumbSwitchesPerHand: 3,
    productUrl: 'https://www.charachorder.com/products/cc2',
  },
  {
    id: 'ccu',
    name: 'CCU',
    abbreviation: 'CCU',
    tagline: 'Build your own, powered by CC2 electronics',
    description:
      'A 3D-printable kit built around the same PCB as CC2. Pick a preconfigured shell or tailor your own with an online CAD tool, print the case yourself, and assemble it — the most customizable and affordable way to get CC2-level switch technology in your own hands.',
    switchesPerHand: 9,
    thumbSwitchesPerHand: 3,
    productUrl: 'https://www.charachorder.com/products/ccu',
  },
  {
    id: 'master-forge',
    name: 'Master Forge',
    abbreviation: 'M4G',
    tagline: 'A digitizer-based design for hybrid chorded entry',
    description:
      "Built from two independent 'digitizers' joined by a mechanical and electrical bridge connector rather than a cable, Master Forge introduced CharaChorder's first layout designed for hybrid character and chorded entry. Each digitizer has 8 switches instead of 9 — only 2 per hand are dedicated to the thumb, down from 3 on CC1/CC2/CCU. As you'll see in the next chapter, its switches are also oriented differently from earlier devices.",
    switchesPerHand: 8,
    thumbSwitchesPerHand: 2,
    notes:
      "Pressing straight down isn't sensed as its own state the way it is on CC1/CC2/CCU — it's read as all four cardinal directions firing at once.",
    productUrl: 'https://www.charachorder.com/products/master-forge-1',
  },
];
