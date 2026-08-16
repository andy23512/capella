import { Component, input } from '@angular/core';
import {
  FingerMap,
  HandMap,
  HighlightKeyCombination,
  POSITION_CODE_LAYOUT,
} from 'tangent-cc-lib';
import { PositionLabels } from '../../utils/key-position.utils';
import { GridSwitchComponent } from '../grid-switch/grid-switch.component';

type Hand = keyof HandMap<unknown>;
type Finger = keyof FingerMap<unknown>;

const CELL_SIZE = 200;
const GAP = 24;
const GRID_COLUMNS = 10;
const GRID_ROWS = 5;
const SWITCHES: Finger[] = [
  'little',
  'ring',
  'ringMid',
  'middle',
  'middleMid',
  'index',
  'thumbTip',
  'thumbMid',
  'thumbEnd',
];
const SIDES: Hand[] = ['left', 'right'];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [GridSwitchComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  readonly highlight = input<HighlightKeyCombination | null>(null);
  readonly labels = input<PositionLabels>({});

  protected readonly sides = SIDES;
  protected readonly switches = SWITCHES;
  protected readonly positionCodeLayout = POSITION_CODE_LAYOUT;
  protected readonly viewBoxWidth =
    CELL_SIZE * GRID_COLUMNS + GAP * (GRID_COLUMNS - 1);
  protected readonly viewBoxHeight =
    CELL_SIZE * GRID_ROWS + GAP * (GRID_ROWS - 1);

  private gridX(column: number): number {
    return column * (CELL_SIZE + GAP) + CELL_SIZE / 2;
  }

  private gridY(row: number): number {
    return row * (CELL_SIZE + GAP) + CELL_SIZE / 2;
  }

  protected switchCenter(sw: Finger, side: Hand): { x: number; y: number } {
    let position: { x: number; y: number };
    switch (sw) {
      case 'little':
        position = { x: this.gridX(0), y: this.gridY(0.5) };
        break;
      case 'ring':
        position = { x: this.gridX(1), y: this.gridY(0) };
        break;
      case 'ringMid':
        position = { x: this.gridX(1), y: this.gridY(1) };
        break;
      case 'middle':
        position = { x: this.gridX(2), y: this.gridY(0) };
        break;
      case 'middleMid':
        position = { x: this.gridX(2), y: this.gridY(1) };
        break;
      case 'index':
        position = { x: this.gridX(3), y: this.gridY(0.5) };
        break;
      case 'thumbTip':
        position = { x: this.gridX(4) - CELL_SIZE / 4, y: this.gridY(2) };
        break;
      case 'thumbMid':
        position = { x: this.gridX(4) - CELL_SIZE / 2, y: this.gridY(3) };
        break;
      case 'thumbEnd':
        position = { x: this.gridX(4) - (CELL_SIZE * 3) / 4, y: this.gridY(4) };
        break;
    }
    if (side === 'right') {
      position = { ...position, x: this.viewBoxWidth - position.x };
    }
    return position;
  }
}
