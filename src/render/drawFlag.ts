import {
  FLAG_W,
  FLAG_H,
  FLAG_WAVE_SEGMENTS,
  FLAG_WAVE_AMPL,
  FLAG_WAVE_FREQ,
  FLAG_WAVE_SPEED,
  FLAG_FOLD_LINES,
  FLAG_FOLD_COLOR,
  FLAG_WHITE_SHADE,
  FLAG_OUTLINE,
  BLUE_FLAG_COLOR,
  WHITE_FLAG_COLOR,
} from '../constants';
import type { FlagSide } from '../types';

/**
 * Draw a waving cloth-style flag anchored to the pole at `(poleX, poleTopY)`.
 * `outward` is +1 for the right hand (white), -1 for the left hand (blue) —
 * the flag fabric extends from the pole in that direction. Wave amplitude
 * ramps up across the flag's length so the pole-side edge stays steady.
 */
export function drawWavingFlag(
  ctx: CanvasRenderingContext2D,
  poleX: number,
  poleTopY: number,
  side: FlagSide,
  outward: -1 | 1,
  time: number,
): void {
  const baseColor = side === 'blue' ? BLUE_FLAG_COLOR : WHITE_FLAG_COLOR;
  const segments = FLAG_WAVE_SEGMENTS;
  const segW = FLAG_W / segments;

  // Build top and bottom edges as polylines with a sine-wave Y offset whose
  // amplitude grows with distance from the pole (the cloth flaps more at the
  // free edge).
  const top: Array<{ x: number; y: number }> = [];
  const bot: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const xLocal = i * segW * outward;
    const x = poleX + xLocal;
    const ampl = FLAG_WAVE_AMPL * t;
    const phase = time * FLAG_WAVE_SPEED - t * FLAG_WAVE_FREQ * Math.PI;
    const dy = Math.sin(phase) * ampl;
    top.push({ x, y: poleTopY + dy });
    bot.push({ x, y: poleTopY + FLAG_H + dy });
  }

  // Fabric fill
  ctx.beginPath();
  ctx.moveTo(top[0]!.x, top[0]!.y);
  for (let i = 1; i <= segments; i++) ctx.lineTo(top[i]!.x, top[i]!.y);
  for (let i = segments; i >= 0; i--) ctx.lineTo(bot[i]!.x, bot[i]!.y);
  ctx.closePath();
  ctx.fillStyle = baseColor;
  ctx.fill();

  // Shading for the white flag — pure white has no contrast against light
  // shadows; tint slightly so folds read.
  if (side === 'white') {
    ctx.fillStyle = FLAG_WHITE_SHADE;
    ctx.fill();
  }

  // Vertical fold/shadow lines for cloth feel
  ctx.strokeStyle = FLAG_FOLD_COLOR;
  ctx.lineWidth = 1.5;
  for (let f = 1; f <= FLAG_FOLD_LINES; f++) {
    const tf = f / (FLAG_FOLD_LINES + 1);
    const i = Math.round(tf * segments);
    const a = top[i]!;
    const b = bot[i]!;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // Outline
  ctx.strokeStyle = FLAG_OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(top[0]!.x, top[0]!.y);
  for (let i = 1; i <= segments; i++) ctx.lineTo(top[i]!.x, top[i]!.y);
  for (let i = segments; i >= 0; i--) ctx.lineTo(bot[i]!.x, bot[i]!.y);
  ctx.closePath();
  ctx.stroke();
}
