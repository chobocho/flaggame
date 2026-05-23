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
  START_GUIDE_TITLE,
  START_GUIDE_TITLE_SIZE,
  START_GUIDE_LINE_SIZE,
  START_GUIDE_LINE_GAP,
  START_GUIDE_TOP_OFFSET_RATIO,
  START_GUIDE_COLOR,
  START_GUIDE_KEY_COLOR,
  START_GUIDE_LINES,
  ICON_BTN_BG,
  ICON_BTN_BORDER,
  ICON_BTN_BORDER_ACTIVE,
  ICON_BTN_FONT_SIZE,
  FLAG_BTN_RADIUS,
  FLAG_BTN_BLUE_BG,
  FLAG_BTN_BLUE_BG_ACTIVE,
  FLAG_BTN_WHITE_BG,
  FLAG_BTN_WHITE_BG_ACTIVE,
  FLAG_BTN_LABEL_BLUE,
  FLAG_BTN_LABEL_WHITE,
  FLAG_BTN_BORDER,
  FLAG_BTN_LABEL_FONT_SIZE,
  FLAG_BTN_KEY_FONT_SIZE,
  HELP_OVERLAY_BG,
  HELP_TITLE,
  HELP_TITLE_SIZE,
  HELP_LINE_SIZE,
  HELP_LINE_GAP,
  HELP_HINT,
  HELP_HINT_SIZE,
  HELP_HINT_COLOR,
  PAUSE_OVERLAY_BG,
  PAUSE_TITLE,
  PAUSE_TITLE_SIZE,
  PAUSE_TITLE_COLOR,
  PAUSE_HINT,
  PAUSE_HINT_SIZE,
  PAUSE_HINT_COLOR,
} from '../constants';
import type { GameState } from '../engine/StateManager';
import type { FlagsState } from '../types';
import { computeUiButtons, type Rect, type UiButtons } from './uiLayout';

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  vw: number,
  vh: number,
): void {
  const ui = computeUiButtons(vw, vh);

  if (state.phase === 'IDLE') {
    drawStartPrompt(ctx, vw, vh);
    drawIconButton(ctx, ui.help, '❓', false);
    if (state.helpOpen) drawHelpOverlay(ctx, vw, vh);
    return;
  }

  drawScore(ctx, state.score);
  drawLives(ctx, state.lives, vw);
  if (state.command) drawSubtitle(ctx, state.command.text, vw);
  if (state.phase === 'WAITING') drawTimerBar(ctx, state.timerMs, state.timerTotalMs, vw);
  if (state.phase === 'JUDGING' && state.outcome) drawOutcome(ctx, state.outcome, vw, vh);

  // Mobile/touch flag buttons. Hidden during GAME_OVER (only restart matters).
  if (state.phase !== 'GAME_OVER') {
    drawFlagButtons(ctx, ui, state.flags);
  }

  // Icon buttons (top-right). Pause hidden in GAME_OVER.
  if (state.phase !== 'GAME_OVER') drawIconButton(ctx, ui.pause, state.paused ? '▶' : '⏸', state.paused);
  drawIconButton(ctx, ui.help, '❓', state.helpOpen);

  if (state.phase === 'GAME_OVER') drawGameOver(ctx, state.score, vw, vh);
  if (state.paused) drawPauseOverlay(ctx, vw, vh);
  if (state.helpOpen) drawHelpOverlay(ctx, vw, vh);
}

function drawStartPrompt(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
  drawStartGuide(ctx, vw, vh);

  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${START_PROMPT_SIZE}px ${HUD_FONT}`;
  ctx.fillText(START_PROMPT, vw / 2, vh - START_PROMPT_BOTTOM_OFFSET);
}

function drawStartGuide(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
  const top = vh * START_GUIDE_TOP_OFFSET_RATIO;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `bold ${START_GUIDE_TITLE_SIZE}px ${HUD_FONT}`;
  ctx.fillText(START_GUIDE_TITLE, vw / 2, top);

  ctx.font = `${START_GUIDE_LINE_SIZE}px ${HUD_FONT}`;
  for (let i = 0; i < START_GUIDE_LINES.length; i++) {
    const line = START_GUIDE_LINES[i]!;
    const y = top + START_GUIDE_LINE_GAP * (i + 1) + 6;
    const key = line[0];
    const desc = line[1];
    const keyText = `[${key}]`;
    ctx.fillStyle = START_GUIDE_KEY_COLOR;
    const keyWidth = ctx.measureText(keyText).width;
    const descWidth = ctx.measureText(desc).width;
    const gap = 12;
    const totalW = keyWidth + gap + descWidth;
    const startX = (vw - totalW) / 2;
    ctx.textAlign = 'left';
    ctx.fillText(keyText, startX, y);
    ctx.fillStyle = START_GUIDE_COLOR;
    ctx.fillText(desc, startX + keyWidth + gap, y);
  }
  ctx.textAlign = 'center';
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

function drawIconButton(
  ctx: CanvasRenderingContext2D,
  r: Rect,
  glyph: string,
  active: boolean,
): void {
  ctx.fillStyle = ICON_BTN_BG;
  ctx.strokeStyle = active ? ICON_BTN_BORDER_ACTIVE : ICON_BTN_BORDER;
  ctx.lineWidth = 2;
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = active ? ICON_BTN_BORDER_ACTIVE : TEXT_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${ICON_BTN_FONT_SIZE}px ${HUD_FONT}`;
  ctx.fillText(glyph, r.x + r.w / 2, r.y + r.h / 2 + 1);
}

function drawFlagButtons(
  ctx: CanvasRenderingContext2D,
  ui: UiButtons,
  flags: FlagsState,
): void {
  for (const b of ui.flags) {
    const active = flags[b.side] === b.pos;
    const isBlue = b.side === 'blue';
    const bg = isBlue
      ? (active ? FLAG_BTN_BLUE_BG_ACTIVE : FLAG_BTN_BLUE_BG)
      : (active ? FLAG_BTN_WHITE_BG_ACTIVE : FLAG_BTN_WHITE_BG);
    const labelColor = isBlue ? FLAG_BTN_LABEL_BLUE : FLAG_BTN_LABEL_WHITE;

    ctx.fillStyle = bg;
    ctx.strokeStyle = FLAG_BTN_BORDER;
    ctx.lineWidth = 2;
    roundRect(ctx, b.rect.x, b.rect.y, b.rect.w, b.rect.h, FLAG_BTN_RADIUS);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${FLAG_BTN_LABEL_FONT_SIZE}px ${HUD_FONT}`;
    const arrow = b.pos === 'UP' ? '▲' : '▼';
    ctx.fillText(arrow, b.rect.x + b.rect.w / 2, b.rect.y + b.rect.h / 2 - 8);

    ctx.font = `${FLAG_BTN_KEY_FONT_SIZE}px ${HUD_FONT}`;
    ctx.fillText(b.key, b.rect.x + b.rect.w / 2, b.rect.y + b.rect.h / 2 + 16);
  }
}

function drawHelpOverlay(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
  ctx.fillStyle = HELP_OVERLAY_BG;
  ctx.fillRect(0, 0, vw, vh);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `bold ${HELP_TITLE_SIZE}px ${HUD_FONT}`;
  ctx.fillText(HELP_TITLE, vw / 2, vh * 0.18);

  ctx.font = `${HELP_LINE_SIZE}px ${HUD_FONT}`;
  const lines: ReadonlyArray<readonly [string, string]> = START_GUIDE_LINES;
  const top = vh * 0.30;
  for (let i = 0; i < lines.length; i++) {
    const [key, desc] = lines[i]!;
    const y = top + HELP_LINE_GAP * (i + 1);
    const keyText = `[${key}]`;
    ctx.fillStyle = START_GUIDE_KEY_COLOR;
    const keyWidth = ctx.measureText(keyText).width;
    const descWidth = ctx.measureText(desc).width;
    const gap = 16;
    const totalW = keyWidth + gap + descWidth;
    const startX = (vw - totalW) / 2;
    ctx.textAlign = 'left';
    ctx.fillText(keyText, startX, y);
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText(desc, startX + keyWidth + gap, y);
  }
  ctx.textAlign = 'center';

  ctx.fillStyle = HELP_HINT_COLOR;
  ctx.font = `${HELP_HINT_SIZE}px ${HUD_FONT}`;
  ctx.fillText(HELP_HINT, vw / 2, vh - 56);
}

function drawPauseOverlay(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
  ctx.fillStyle = PAUSE_OVERLAY_BG;
  ctx.fillRect(0, 0, vw, vh);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = PAUSE_TITLE_COLOR;
  ctx.font = `bold ${PAUSE_TITLE_SIZE}px ${HUD_FONT}`;
  ctx.fillText(PAUSE_TITLE, vw / 2, vh / 2 - 20);

  ctx.fillStyle = PAUSE_HINT_COLOR;
  ctx.font = `${PAUSE_HINT_SIZE}px ${HUD_FONT}`;
  ctx.fillText(PAUSE_HINT, vw / 2, vh / 2 + 30);
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
