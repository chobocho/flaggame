import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, BG_COLOR } from '../constants';
import { drawCharacter } from './drawCharacter';
import { drawHUD } from './drawHUD';
import type { GameState } from '../engine/StateManager';
import type { EffectsManager } from './effects';

export class Renderer {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly effects: EffectsManager,
  ) {}

  draw(state: GameState): void {
    const ctx = this.ctx;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Screen-shake displaces the scene but not the HUD overlays, so save/restore.
    const shake = this.effects.shakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);
    drawCharacter(ctx, state.flags);
    this.effects.drawParticles(ctx);
    ctx.restore();

    drawHUD(ctx, state);
  }
}
