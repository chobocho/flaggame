import {
  TEXT_COLOR,
  SUBTITLE_COLOR,
  SUBTITLE_PANEL_BG,
  SUBTITLE_PANEL_BORDER,
  SUBTITLE_PANEL_TOP,
  SUBTITLE_PANEL_H,
  SUBTITLE_PANEL_MAX_W,
  SUBTITLE_PANEL_MIN_SIDE_PAD,
  SUBTITLE_FONT_SIZE,
  HUD_EDGE_PAD,
  HUD_FONT,
  HUD_SCORE_SIZE,
  HUD_LIFE_SIZE,
  HUD_LIFE_COLOR,
  TIMER_BAR_TOP,
  TIMER_BAR_W,
  TIMER_BAR_H,
  TIMER_BAR_BG,
  TIMER_BAR_FG,
  OUTCOME_SUCCESS_TEXT,
  OUTCOME_FAIL_TEXT,
  OUTCOME_FONT_SIZE,
  OUTCOME_SUCCESS_COLOR,
  OUTCOME_FAIL_COLOR,
  OUTCOME_BOTTOM_OFFSET,
  GAMEOVER_TITLE,
  GAMEOVER_TITLE_SIZE,
  GAMEOVER_TITLE_COLOR,
  GAMEOVER_HINT,
  GAMEOVER_HINT_SIZE,
  START_PROMPT,
  START_PROMPT_SIZE,
  START_PROMPT_BOTTOM_OFFSET,
} from '../constants';
import type { GameState } from '../engine/StateManager';

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  vw: number,
  vh: number,
): void {
  if (state.phase === 'IDLE') {
    drawStartPrompt(ctx, vw, vh);
    return;
  }
  drawScore(ctx, state.score);
  drawLives(ctx, state.lives, vw);
  if (state.command) drawSubtitle(ctx, state.command.text, vw);
  if (state.phase === 'WAITING') drawTimerBar(ctx, state.timerMs, state.timerTotalMs, vw);
  if (state.phase === 'JUDGING' && state.outcome) drawOutcome(ctx, state.outcome, vw, vh);
  if (state.phase === 'GAME_OVER') drawGameOver(ctx, state.score, vw, vh);
}

function drawStartPrompt(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${START_PROMPT_SIZE}px ${HUD_FONT}`;
  ctx.fillText(START_PROMPT, vw / 2, vh - START_PROMPT_BOTTOM_OFFSET);
}

function drawScore(ctx: CanvasRenderingContext2D, score: number): void {
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${HUD_SCORE_SIZE}px ${HUD_FONT}`;
  ctx.fillText(`SCORE: ${score.toLocaleString()}`, HUD_EDGE_PAD, HUD_EDGE_PAD);
}

function drawLives(ctx: CanvasRenderingContext2D, lives: number, vw: number): void {
  ctx.fillStyle = HUD_LIFE_COLOR;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.font = `${HUD_LIFE_SIZE}px ${HUD_FONT}`;
  const hearts = lives > 0 ? '♥ '.repeat(lives).trim() : '–';
  ctx.fillText(`LIFE: ${hearts}`, vw - HUD_EDGE_PAD, HUD_EDGE_PAD);
}

function drawSubtitle(ctx: CanvasRenderingContext2D, text: string, vw: number): void {
  const w = Math.min(SUBTITLE_PANEL_MAX_W, vw - SUBTITLE_PANEL_MIN_SIDE_PAD * 2);
  const x = (vw - w) / 2;
  ctx.fillStyle = SUBTITLE_PANEL_BG;
  ctx.strokeStyle = SUBTITLE_PANEL_BORDER;
  ctx.lineWidth = 2;
  roundRect(ctx, x, SUBTITLE_PANEL_TOP, w, SUBTITLE_PANEL_H, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = SUBTITLE_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${SUBTITLE_FONT_SIZE}px ${HUD_FONT}`;
  ctx.fillText(text, vw / 2, SUBTITLE_PANEL_TOP + SUBTITLE_PANEL_H / 2);
}

function drawTimerBar(
  ctx: CanvasRenderingContext2D,
  remaining: number,
  total: number,
  vw: number,
): void {
  const w = Math.min(TIMER_BAR_W, vw - SUBTITLE_PANEL_MIN_SIDE_PAD * 2);
  const x = (vw - w) / 2;
  ctx.fillStyle = TIMER_BAR_BG;
  ctx.fillRect(x, TIMER_BAR_TOP, w, TIMER_BAR_H);
  const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  ctx.fillStyle = TIMER_BAR_FG;
  ctx.fillRect(x, TIMER_BAR_TOP, w * ratio, TIMER_BAR_H);
}

function drawOutcome(
  ctx: CanvasRenderingContext2D,
  outcome: 'SUCCESS' | 'FAIL',
  vw: number,
  vh: number,
): void {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${OUTCOME_FONT_SIZE}px ${HUD_FONT}`;
  ctx.fillStyle = outcome === 'SUCCESS' ? OUTCOME_SUCCESS_COLOR : OUTCOME_FAIL_COLOR;
  const text = outcome === 'SUCCESS' ? OUTCOME_SUCCESS_TEXT : OUTCOME_FAIL_TEXT;
  ctx.fillText(text, vw / 2, vh - OUTCOME_BOTTOM_OFFSET);
}

function drawGameOver(ctx: CanvasRenderingContext2D, score: number, vw: number, vh: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, vw, vh);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = GAMEOVER_TITLE_COLOR;
  ctx.font = `bold ${GAMEOVER_TITLE_SIZE}px ${HUD_FONT}`;
  ctx.fillText(GAMEOVER_TITLE, vw / 2, vh / 2 - 40);

  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `${HUD_SCORE_SIZE}px ${HUD_FONT}`;
  ctx.fillText(`최종 점수: ${score.toLocaleString()}`, vw / 2, vh / 2 + 20);

  ctx.font = `${GAMEOVER_HINT_SIZE}px ${HUD_FONT}`;
  ctx.fillText(GAMEOVER_HINT, vw / 2, vh / 2 + 70);
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
