import type { FlagsState, FlagPos, FlagSide } from '../types';
import {
  SKIN_COLOR,
  BODY_COLOR,
  POLE_COLOR,
  BLUE_FLAG_COLOR,
  WHITE_FLAG_COLOR,
  FLAG_OUTLINE,
  CHAR_HEAD_X,
  CHAR_HEAD_Y,
  CHAR_HEAD_R,
  CHAR_BODY_W,
  CHAR_BODY_H,
  CHAR_BODY_TOP,
  SHOULDER_DX,
  SHOULDER_Y,
  ARM_LENGTH,
  ARM_WIDTH,
  POLE_LENGTH,
  POLE_WIDTH,
  FLAG_W,
  FLAG_H,
  ARM_ANGLE_UP_DEG,
  ARM_ANGLE_DOWN_DEG,
} from '../constants';

const DEG_TO_RAD = Math.PI / 180;

function armAngleRad(pos: FlagPos, side: FlagSide): number {
  // Outward = -X for blue (left), +X for white (right).
  // UP raises the arm above horizontal (negative Y); DOWN lowers it (positive Y).
  const outward = side === 'blue' ? -1 : 1;
  const deg = pos === 'UP' ? -ARM_ANGLE_UP_DEG : ARM_ANGLE_DOWN_DEG;
  // angle from +X axis toward the hand
  const baseDeg = outward === -1 ? 180 - deg : deg;
  return baseDeg * DEG_TO_RAD;
}

function drawArmAndFlag(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  pos: FlagPos,
  side: FlagSide,
): void {
  const angle = armAngleRad(pos, side);
  const handX = shoulderX + Math.cos(angle) * ARM_LENGTH;
  const handY = SHOULDER_Y + Math.sin(angle) * ARM_LENGTH;

  // Arm
  ctx.strokeStyle = SKIN_COLOR;
  ctx.lineWidth = ARM_WIDTH;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(shoulderX, SHOULDER_Y);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Pole extends straight up from the hand.
  const poleTopY = handY - POLE_LENGTH;
  ctx.strokeStyle = POLE_COLOR;
  ctx.lineWidth = POLE_WIDTH;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(handX, poleTopY);
  ctx.stroke();

  // Flag attaches to the pole on the outward side so blue/white never overlap the body.
  const outward = side === 'blue' ? -1 : 1;
  const flagX = outward === -1 ? handX - FLAG_W : handX;
  const flagY = poleTopY;
  ctx.fillStyle = side === 'blue' ? BLUE_FLAG_COLOR : WHITE_FLAG_COLOR;
  ctx.fillRect(flagX, flagY, FLAG_W, FLAG_H);
  ctx.strokeStyle = FLAG_OUTLINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(flagX, flagY, FLAG_W, FLAG_H);
}

export function drawCharacter(ctx: CanvasRenderingContext2D, flags: FlagsState): void {
  // Body (drawn first so arms overlay it)
  ctx.fillStyle = BODY_COLOR;
  ctx.fillRect(CHAR_HEAD_X - CHAR_BODY_W / 2, CHAR_BODY_TOP, CHAR_BODY_W, CHAR_BODY_H);

  // Head
  ctx.fillStyle = SKIN_COLOR;
  ctx.beginPath();
  ctx.arc(CHAR_HEAD_X, CHAR_HEAD_Y, CHAR_HEAD_R, 0, Math.PI * 2);
  ctx.fill();

  // Arms + flags (blue = left, white = right — always)
  drawArmAndFlag(ctx, CHAR_HEAD_X - SHOULDER_DX, flags.blue, 'blue');
  drawArmAndFlag(ctx, CHAR_HEAD_X + SHOULDER_DX, flags.white, 'white');
}
