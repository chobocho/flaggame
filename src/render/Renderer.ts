import { BG_COLOR } from '../constants';
import { drawCharacter } from './drawCharacter';
import { drawHUD } from './drawHUD';
import type { GameState } from '../engine/StateManager';
import type { EffectsManager } from './effects';
import type { ViewportTransform } from '../util/canvas';

export class Renderer {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly effects: EffectsManager,
  ) {}

  draw(state: GameState, vp: ViewportTransform): void {
    const ctx = this.ctx;
    const vw = vp.virtualWidth;
    const vh = vp.virtualHeight;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, vw, vh);

    // Character sits slightly below vertical center so the HUD has room on top.
    const originX = vw / 2;
    const originY = vh * 0.62;

    const shake = this.effects.shakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);
    drawCharacter(ctx, state.flags, originX, originY);
    this.effects.drawParticles(ctx, originX, originY);
    ctx.restore();

    drawHUD(ctx, state, vw, vh);
  }
}
