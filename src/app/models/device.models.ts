export interface Device {
  id: string;
  name: string;
  abbreviation: string;
  tagline: string;
  description: string;
  switchesPerHand: number;
  thumbSwitchesPerHand: number;
  notes?: string;
  productUrl?: string;
}
