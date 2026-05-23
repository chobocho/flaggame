import {
  HUD_EDGE_PAD,
  ICON_BTN_SIZE,
  ICON_BTN_GAP,
  ICON_BTN_TOP,
  FLAG_BTN_SIZE,
  FLAG_BTN_GAP,
  FLAG_BTN_BOTTOM_OFFSET,
  FLAG_BTN_SIDE_OFFSET,
} from '../constants';
import type { FlagSide, FlagPos } from '../types';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UiButtons {
  help: Rect;
  pause: Rect;
  flags: Array<{ rect: Rect; side: FlagSide; pos: FlagPos; key: string }>;
}

/** All button rectangles in virtual-viewport coordinates. */
export function computeUiButtons(vw: number, vh: number): UiButtons {
  const right = vw - HUD_EDGE_PAD;
  const help: Rect = {
    x: right - ICON_BTN_SIZE,
    y: ICON_BTN_TOP,
    w: ICON_BTN_SIZE,
    h: ICON_BTN_SIZE,
  };
  const pause: Rect = {
    x: help.x - ICON_BTN_GAP - ICON_BTN_SIZE,
    y: ICON_BTN_TOP,
    w: ICON_BTN_SIZE,
    h: ICON_BTN_SIZE,
  };

  const colW = FLAG_BTN_SIZE;
  const colH = FLAG_BTN_SIZE * 2 + FLAG_BTN_GAP;
  const bottomY = vh - FLAG_BTN_BOTTOM_OFFSET;
  const topY = bottomY - colH;

  const blueX = FLAG_BTN_SIDE_OFFSET;
  const whiteX = vw - FLAG_BTN_SIDE_OFFSET - colW;

  const flags: UiButtons['flags'] = [
    {
      rect: { x: blueX,  y: topY,                                w: colW, h: FLAG_BTN_SIZE },
      side: 'blue',  pos: 'UP',   key: 'Q',
    },
    {
      rect: { x: blueX,  y: topY + FLAG_BTN_SIZE + FLAG_BTN_GAP, w: colW, h: FLAG_BTN_SIZE },
      side: 'blue',  pos: 'DOWN', key: 'A',
    },
    {
      rect: { x: whiteX, y: topY,                                w: colW, h: FLAG_BTN_SIZE },
      side: 'white', pos: 'UP',   key: 'P',
    },
    {
      rect: { x: whiteX, y: topY + FLAG_BTN_SIZE + FLAG_BTN_GAP, w: colW, h: FLAG_BTN_SIZE },
      side: 'white', pos: 'DOWN', key: 'L',
    },
  ];

  return { help, pause, flags };
}

export function hitTest(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
