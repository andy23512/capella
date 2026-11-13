/**
 * Device names and abbreviations are product names, so they stay literal.
 * The descriptive text is stored as translation keys (see src/assets/i18n).
 */
export interface Device {
  id: string;
  name: string;
  abbreviation: string;
  taglineKey: string;
  descriptionKey: string;
  switchesPerHand: number;
  thumbSwitchesPerHand: number;
  notesKey?: string;
  productUrl?: string;
}
