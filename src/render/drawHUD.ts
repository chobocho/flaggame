import {
  TEXT_COLOR,
  SUBTITLE_COLOR,
  SUBTITLE_PANEL_BG,
  SUBTITLE_PANEL_BORDER,
  SUBTITLE_PANEL_X,
  SUBTITLE_PANEL_Y,
  SUBTITLE_PANEL_W,
  SUBTITLE_PANEL_H,
  SUBTITLE_FONT_SIZE,
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  START_PROMPT,
  START_PROMPT_SIZE,
} from '../constants';
import type { GameState } from '../engine/StateManager';

export function drawHUD(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.phase === 'IDLE') {
    drawStartPrompt(ctx);
    return;
  }
  if (state.command) drawSubtitle(ctx, state.command.text);
}

function drawStartPrompt(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${START_PROMPT_SIZE}px system-ui, sans-serif`;
  ctx.fillText(START_PROMPT, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT - 60);
}

function drawSubtitle(ctx: CanvasRenderingContext2D, text: string): void {
  ctx.fillStyle = SUBTITLE_PANEL_BG;
  ctx.strokeStyle = SUBTITLE_PANEL_BORDER;
  ctx.lineWidth = 2;
  roundRect(ctx, SUBTITLE_PANEL_X, SUBTITLE_PANEL_Y, SUBTITLE_PANEL_W, SUBTITLE_PANEL_H, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = SUBTITLE_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${SUBTITLE_FONT_SIZE}px system-ui, sans-serif`;
  ctx.fillText(
    text,
    SUBTITLE_PANEL_X + SUBTITLE_PANEL_W / 2,
    SUBTITLE_PANEL_Y + SUBTITLE_PANEL_H / 2,
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
