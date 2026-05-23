import type { FlagsState, FlagPos, FlagSide } from '../types';
import {
  SKIN_COLOR,
  BODY_COLOR,
  POLE_COLOR,
  BLUE_FLAG_COLOR,
  WHITE_FLAG_COLOR,
  FLAG_OUTLINE,
  HEAD_DY,
  HEAD_R,
  BODY_W,
  BODY_H,
  BODY_TOP_DY,
  SHOULDER_DX,
  SHOULDER_DY,
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
  const outward = side === 'blue' ? -1 : 1;
  const deg = pos === 'UP' ? -ARM_ANGLE_UP_DEG : ARM_ANGLE_DOWN_DEG;
  const baseDeg = outward === -1 ? 180 - deg : deg;
  return baseDeg * DEG_TO_RAD;
}

function drawArmAndFlag(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  pos: FlagPos,
  side: FlagSide,
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

  const outward = side === 'blue' ? -1 : 1;
  const flagX = outward === -1 ? handX - FLAG_W : handX;
  const flagY = poleTopY;
  ctx.fillStyle = side === 'blue' ? BLUE_FLAG_COLOR : WHITE_FLAG_COLOR;
  ctx.fillRect(flagX, flagY, FLAG_W, FLAG_H);
  ctx.strokeStyle = FLAG_OUTLINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(flagX, flagY, FLAG_W, FLAG_H);
}

/** Draw the character centered on (originX, originY). */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  flags: FlagsState,
  originX: number,
  originY: number,
): void {
  ctx.fillStyle = BODY_COLOR;
  ctx.fillRect(originX - BODY_W / 2, originY + BODY_TOP_DY, BODY_W, BODY_H);

  ctx.fillStyle = SKIN_COLOR;
  ctx.beginPath();
  ctx.arc(originX, originY + HEAD_DY, HEAD_R, 0, Math.PI * 2);
  ctx.fill();

  drawArmAndFlag(ctx, originX - SHOULDER_DX, originY + SHOULDER_DY, flags.blue, 'blue');
  drawArmAndFlag(ctx, originX + SHOULDER_DX, originY + SHOULDER_DY, flags.white, 'white');
}
