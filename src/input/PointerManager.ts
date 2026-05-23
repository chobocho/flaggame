import type { ViewportTransform } from '../util/canvas';
import { computeUiButtons, hitTest } from '../render/uiLayout';
import type { FlagSide, FlagPos } from '../types';

export interface PointerHandlers {
  /** Tap anywhere outside any UI button — used to start/restart the game and close help. */
  onTapBackground: () => void;
  onFlagButton: (side: FlagSide, pos: FlagPos) => void;
  onHelpToggle: () => void;
  onPauseToggle: () => void;
}

/** Maps pointer/touch events to UI button hits in virtual viewport coordinates. */
export class PointerManager {
  private readonly canvas: HTMLCanvasElement;
  private readonly handlers: PointerHandlers;
  private readonly getViewport: () => ViewportTransform;
  private readonly onPointerDown: (e: PointerEvent) => void;

  constructor(
    canvas: HTMLCanvasElement,
    getViewport: () => ViewportTransform,
    handlers: PointerHandlers,
  ) {
    this.canvas = canvas;
    this.handlers = handlers;
    this.getViewport = getViewport;
    this.onPointerDown = (e: PointerEvent) => this.handlePointer(e);
    canvas.addEventListener('pointerdown', this.onPointerDown);
  }

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
  }

  private handlePointer(e: PointerEvent): void {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    const vp = this.getViewport();
    // Canvas backing-store px = cssPx × dpr; virtual px = backing / scale.
    const dpr = this.canvas.width / Math.max(1, rect.width);
    const dpry = this.canvas.height / Math.max(1, rect.height);
    const vx = (cssX * dpr) / vp.scale;
    const vy = (cssY * dpry) / vp.scale;

    const ui = computeUiButtons(vp.virtualWidth, vp.virtualHeight);

    if (hitTest(ui.help, vx, vy)) {
      this.handlers.onHelpToggle();
      return;
    }
    if (hitTest(ui.pause, vx, vy)) {
      this.handlers.onPauseToggle();
      return;
    }
    for (const b of ui.flags) {
      if (hitTest(b.rect, vx, vy)) {
        this.handlers.onFlagButton(b.side, b.pos);
        return;
      }
    }
    this.handlers.onTapBackground();
  }
}
