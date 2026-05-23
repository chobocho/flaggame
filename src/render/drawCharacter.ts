import type { FlagPos, FlagSide } from '../types';
import type { GameState } from '../engine/StateManager';
import {
  SKIN_COLOR,
  BODY_COLOR,
  POLE_COLOR,
  HEAD_DY,
  HEAD_RX,
  HEAD_RY,
  BODY_W,
  BODY_H,
  BODY_TOP_DY,
  SHOULDER_DX,
  SHOULDER_DY,
  ARM_LENGTH,
  ARM_WIDTH,
  POLE_LENGTH,
  POLE_WIDTH,
  ARM_ANGLE_UP_DEG,
  ARM_ANGLE_DOWN_DEG,
  ARM_ANGLE_MIDDLE_DEG,
  HAIR_COLOR,
  HAIR_HIGHLIGHT,
  EYE_WHITE,
  EYE_IRIS,
  EYE_PUPIL,
  EYE_HIGHLIGHT,
  BROW_COLOR,
  BLUSH_COLOR,
  MOUTH_COLOR,
  COLLAR_COLOR,
  TIE_COLOR,
  IDLE_BOB_AMPL,
  IDLE_BOB_PERIOD_S,
  BLINK_PERIOD_S,
  BLINK_DURATION_S,
} from '../constants';
import { drawWavingFlag } from './drawFlag';

const DEG_TO_RAD = Math.PI / 180;

type Mood = 'idle' | 'happy' | 'sad' | 'sleep';

function moodFor(state: GameState): Mood {
  if (state.phase === 'JUDGING' && state.outcome === 'SUCCESS') return 'happy';
  if (state.phase === 'JUDGING' && state.outcome === 'FAIL') return 'sad';
  if (state.phase === 'GAME_OVER') return 'sad';
  if (state.paused) return 'sleep';
  return 'idle';
}

function armAngleRad(pos: FlagPos, side: FlagSide): number {
  const outward = side === 'blue' ? -1 : 1;
  const deg = pos === 'UP'
    ? -ARM_ANGLE_UP_DEG
    : pos === 'DOWN'
      ? ARM_ANGLE_DOWN_DEG
      : ARM_ANGLE_MIDDLE_DEG;
  const baseDeg = outward === -1 ? 180 - deg : deg;
  return baseDeg * DEG_TO_RAD;
}

function drawArmAndFlag(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  pos: FlagPos,
  side: FlagSide,
  time: number,
): void {
  const angle = armAngleRad(pos, side);
  const handX = shoulderX + Math.cos(angle) * ARM_LENGTH;
  const handY = shoulderY + Math.sin(angle) * ARM_LENGTH;

  ctx.strokeStyle = SKIN_COLOR;
  ctx.lineWidth = ARM_WIDTH;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  const poleTopY = handY - POLE_LENGTH;
  ctx.strokeStyle = POLE_COLOR;
  ctx.lineWidth = POLE_WIDTH;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(handX, poleTopY);
  ctx.stroke();

  const outward: -1 | 1 = side === 'blue' ? -1 : 1;
  drawWavingFlag(ctx, handX, poleTopY, side, outward, time);
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  mood: Mood,
  time: number,
): void {
  // Back hair silhouette (behind face)
  ctx.fillStyle = HAIR_COLOR;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, HEAD_RX + 8, HEAD_RY + 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = SKIN_COLOR;
  ctx.beginPath();
  ctx.ellipse(cx, cy, HEAD_RX, HEAD_RY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front bangs — a flat fringe along the upper third of the face
  ctx.fillStyle = HAIR_COLOR;
  ctx.beginPath();
  ctx.moveTo(cx - HEAD_RX,     cy - HEAD_RY * 0.45);
  ctx.quadraticCurveTo(cx - HEAD_RX * 0.5, cy - HEAD_RY * 1.05, cx - HEAD_RX * 0.05, cy - HEAD_RY * 0.4);
  ctx.quadraticCurveTo(cx + HEAD_RX * 0.4, cy - HEAD_RY * 0.10, cx + HEAD_RX * 0.95, cy - HEAD_RY * 0.30);
  ctx.lineTo(cx + HEAD_RX,     cy - HEAD_RY);
  ctx.lineTo(cx - HEAD_RX,     cy - HEAD_RY);
  ctx.closePath();
  ctx.fill();

  // Hair highlight stroke for a glossy look
  ctx.strokeStyle = HAIR_HIGHLIGHT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - HEAD_RX * 0.55, cy - HEAD_RY * 0.55);
  ctx.quadraticCurveTo(cx - HEAD_RX * 0.1, cy - HEAD_RY * 0.85, cx + HEAD_RX * 0.55, cy - HEAD_RY * 0.55);
  ctx.stroke();

  // Twin tails (small puffs on each side)
  ctx.fillStyle = HAIR_COLOR;
  ctx.beginPath();
  ctx.ellipse(cx - HEAD_RX - 6, cy + 6, 10, 16, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + HEAD_RX + 6, cy + 6, 10, 16, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeDx = HEAD_RX * 0.42;
  const eyeY = cy + HEAD_RY * 0.05;
  drawEye(ctx, cx - eyeDx, eyeY, mood, time, 'left');
  drawEye(ctx, cx + eyeDx, eyeY, mood, time, 'right');

  // Brows
  ctx.strokeStyle = BROW_COLOR;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  const browY = eyeY - 14;
  const browDx = 8;
  const browTilt = mood === 'sad' ? 4 : (mood === 'happy' ? -2 : 0);
  ctx.beginPath();
  ctx.moveTo(cx - eyeDx - browDx, browY + browTilt);
  ctx.lineTo(cx - eyeDx + browDx, browY - browTilt);
  ctx.moveTo(cx + eyeDx - browDx, browY - browTilt);
  ctx.lineTo(cx + eyeDx + browDx, browY + browTilt);
  ctx.stroke();

  // Blush
  ctx.fillStyle = BLUSH_COLOR;
  ctx.beginPath();
  ctx.ellipse(cx - HEAD_RX * 0.55, cy + HEAD_RY * 0.32, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + HEAD_RX * 0.55, cy + HEAD_RY * 0.32, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  drawMouth(ctx, cx, cy + HEAD_RY * 0.55, mood);
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  mood: Mood,
  time: number,
  _side: 'left' | 'right',
): void {
  const blinkPhase = (time % BLINK_PERIOD_S) / BLINK_PERIOD_S;
  const blinkActive =
    mood === 'sleep' ||
    (blinkPhase < BLINK_DURATION_S / BLINK_PERIOD_S);

  if (blinkActive) {
    ctx.strokeStyle = EYE_PUPIL;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.quadraticCurveTo(cx, cy + 4, cx + 6, cy);
    ctx.stroke();
    return;
  }

  // White
  ctx.fillStyle = EYE_WHITE;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Iris
  ctx.fillStyle = EYE_IRIS;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupil
  ctx.fillStyle = EYE_PUPIL;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1, 2.4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = EYE_HIGHLIGHT;
  ctx.beginPath();
  ctx.arc(cx - 2, cy - 2, 1.7, 0, Math.PI * 2);
  ctx.fill();
  // Outline (eye liner)
  ctx.strokeStyle = EYE_PUPIL;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 7, 9, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawMouth(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  mood: Mood,
): void {
  ctx.strokeStyle = MOUTH_COLOR;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (mood === 'happy') {
    // open smile (filled)
    ctx.fillStyle = MOUTH_COLOR;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.quadraticCurveTo(cx, cy + 10, cx + 8, cy);
    ctx.quadraticCurveTo(cx, cy + 2, cx - 8, cy);
    ctx.fill();
  } else if (mood === 'sad') {
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 3);
    ctx.quadraticCurveTo(cx, cy - 3, cx + 6, cy + 3);
    ctx.stroke();
  } else if (mood === 'sleep') {
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy);
    ctx.lineTo(cx + 4, cy);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy);
    ctx.quadraticCurveTo(cx, cy + 4, cx + 5, cy);
    ctx.stroke();
  }
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
): void {
  // Torso (rounded top)
  const x = originX - BODY_W / 2;
  const y = originY + BODY_TOP_DY;
  ctx.fillStyle = BODY_COLOR;
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + BODY_W - 10, y);
  ctx.quadraticCurveTo(x + BODY_W, y, x + BODY_W, y + 10);
  ctx.lineTo(x + BODY_W, y + BODY_H);
  ctx.lineTo(x, y + BODY_H);
  ctx.lineTo(x, y + 10);
  ctx.quadraticCurveTo(x, y, x + 10, y);
  ctx.closePath();
  ctx.fill();

  // Collar V
  ctx.fillStyle = COLLAR_COLOR;
  ctx.beginPath();
  ctx.moveTo(originX - 16, y);
  ctx.lineTo(originX, y + 22);
  ctx.lineTo(originX + 16, y);
  ctx.closePath();
  ctx.fill();

  // Tie/ribbon under the collar
  ctx.fillStyle = TIE_COLOR;
  ctx.beginPath();
  ctx.moveTo(originX - 10, y + 18);
  ctx.lineTo(originX + 10, y + 18);
  ctx.lineTo(originX + 5, y + 34);
  ctx.lineTo(originX - 5, y + 34);
  ctx.closePath();
  ctx.fill();
}

/** Draw the character centered on (originX, originY). */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  originX: number,
  originY: number,
  time: number,
): void {
  const mood = moodFor(state);
  // Idle bob — suppressed during JUDGING and pause for clearer feedback.
  const bobActive = mood === 'idle';
  const bob = bobActive
    ? Math.sin((time / IDLE_BOB_PERIOD_S) * Math.PI * 2) * IDLE_BOB_AMPL
    : 0;

  ctx.save();
  ctx.translate(0, bob);

  drawBody(ctx, originX, originY);
  drawHead(ctx, originX, originY + HEAD_DY, mood, time);

  drawArmAndFlag(ctx, originX - SHOULDER_DX, originY + SHOULDER_DY, state.flags.blue,  'blue',  time);
  drawArmAndFlag(ctx, originX + SHOULDER_DX, originY + SHOULDER_DY, state.flags.white, 'white', time);

  ctx.restore();
}
