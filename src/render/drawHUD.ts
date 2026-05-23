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
  HUD_FONT,
  HUD_TOP_Y,
  HUD_SCORE_X,
  HUD_SCORE_SIZE,
  HUD_LIFE_X,
  HUD_LIFE_SIZE,
  HUD_LIFE_COLOR,
  TIMER_BAR_X,
  TIMER_BAR_Y,
  TIMER_BAR_W,
  TIMER_BAR_H,
  TIMER_BAR_BG,
  TIMER_BAR_FG,
  OUTCOME_SUCCESS_TEXT,
  OUTCOME_FAIL_TEXT,
  OUTCOME_FONT_SIZE,
  OUTCOME_SUCCESS_COLOR,
  OUTCOME_FAIL_COLOR,
  GAMEOVER_TITLE,
  GAMEOVER_TITLE_SIZE,
  GAMEOVER_TITLE_COLOR,
  GAMEOVER_HINT,
  GAMEOVER_HINT_SIZE,
} from '../constants';
import type { GameState } from '../engine/StateManager';

export function drawHUD(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.phase === 'IDLE') {
    drawStartPrompt(ctx);
    return;
  }
  drawScore(ctx, state.score);
  drawLives(ctx, state.lives);
  if (state.command) drawSubtitle(ctx, state.command.text);
  if (state.phase === 'WAITING') drawTimerBar(ctx, state.timerMs, state.timerTotalMs);
  if (state.phase === 'JUDGING' && state.outcome) drawOutcome(ctx, state.outcome);
  if (state.phase === 'GAME_OVER') drawGameOver(ctx, state.score);
}

function drawStartPrompt(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${START_PROMPT_SIZE}px ${HUD_FONT}`;
  ctx.fillText(START_PROMPT, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT - 60);
}

function drawScore(ctx: CanvasRenderingContext2D, score: number): void {
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `${HUD_SCORE_SIZE}px ${HUD_FONT}`;
  ctx.fillText(`SCORE: ${score.toLocaleString()}`, HUD_SCORE_X, HUD_TOP_Y);
}

function drawLives(ctx: CanvasRenderingContext2D, lives: number): void {
  ctx.fillStyle = HUD_LIFE_COLOR;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = `${HUD_LIFE_SIZE}px ${HUD_FONT}`;
  const hearts = lives > 0 ? '♥ '.repeat(lives).trim() : '–';
  ctx.fillText(`LIFE: ${hearts}`, HUD_LIFE_X, HUD_TOP_Y);
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
  ctx.font = `bold ${SUBTITLE_FONT_SIZE}px ${HUD_FONT}`;
  ctx.fillText(
    text,
    SUBTITLE_PANEL_X + SUBTITLE_PANEL_W / 2,
    SUBTITLE_PANEL_Y + SUBTITLE_PANEL_H / 2,
  );
}

function drawTimerBar(ctx: CanvasRenderingContext2D, remaining: number, total: number): void {
  ctx.fillStyle = TIMER_BAR_BG;
  ctx.fillRect(TIMER_BAR_X, TIMER_BAR_Y, TIMER_BAR_W, TIMER_BAR_H);
  const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  ctx.fillStyle = TIMER_BAR_FG;
  ctx.fillRect(TIMER_BAR_X, TIMER_BAR_Y, TIMER_BAR_W * ratio, TIMER_BAR_H);
}

function drawOutcome(ctx: CanvasRenderingContext2D, outcome: 'SUCCESS' | 'FAIL'): void {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${OUTCOME_FONT_SIZE}px ${HUD_FONT}`;
  ctx.fillStyle = outcome === 'SUCCESS' ? OUTCOME_SUCCESS_COLOR : OUTCOME_FAIL_COLOR;
  const text = outcome === 'SUCCESS' ? OUTCOME_SUCCESS_TEXT : OUTCOME_FAIL_TEXT;
  ctx.fillText(text, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT - 70);
}

function drawGameOver(ctx: CanvasRenderingContext2D, score: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = GAMEOVER_TITLE_COLOR;
  ctx.font = `bold ${GAMEOVER_TITLE_SIZE}px ${HUD_FONT}`;
  ctx.fillText(GAMEOVER_TITLE, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 40);

  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `${HUD_SCORE_SIZE}px ${HUD_FONT}`;
  ctx.fillText(`최종 점수: ${score.toLocaleString()}`, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 20);

  ctx.font = `${GAMEOVER_HINT_SIZE}px ${HUD_FONT}`;
  ctx.fillText(GAMEOVER_HINT, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 70);
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
