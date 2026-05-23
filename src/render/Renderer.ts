import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, BG_COLOR } from '../constants';
import { drawCharacter } from './drawCharacter';
import { drawHUD } from './drawHUD';
import type { GameState } from '../engine/StateManager';

export class Renderer {
  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  draw(state: GameState): void {
    const ctx = this.ctx;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawCharacter(ctx, state.flags);
    drawHUD(ctx, state);
  }
}
