import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, BG_COLOR } from '../constants';
import { drawCharacter } from './drawCharacter';
import type { FlagsState } from '../types';

export interface RenderState {
  flags: FlagsState;
}

export class Renderer {
  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  draw(state: RenderState): void {
    const ctx = this.ctx;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawCharacter(ctx, state.flags);
  }
}
