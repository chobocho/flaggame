import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, LETTERBOX_COLOR } from '../constants';

export interface ViewportTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  cssWidth: number;
  cssHeight: number;
}

/**
 * Resize the canvas backing store to match its CSS size × devicePixelRatio,
 * then compute a letterbox transform from VIRTUAL_WIDTH × VIRTUAL_HEIGHT to the
 * actual pixel size. The transform is applied before each frame is drawn so
 * the game can use virtual coordinates everywhere.
 *
 * This is the single mechanism that keeps the game playable on both Galaxy
 * Fold 7 cover (tall portrait) and main (near-square) screens — no media
 * queries, just ratio-preserving fit.
 */
export function fitCanvas(canvas: HTMLCanvasElement): ViewportTransform {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  const pxWidth = Math.max(1, Math.floor(cssWidth * dpr));
  const pxHeight = Math.max(1, Math.floor(cssHeight * dpr));

  if (canvas.width !== pxWidth) canvas.width = pxWidth;
  if (canvas.height !== pxHeight) canvas.height = pxHeight;

  const scale = Math.min(pxWidth / VIRTUAL_WIDTH, pxHeight / VIRTUAL_HEIGHT);
  const offsetX = Math.floor((pxWidth - VIRTUAL_WIDTH * scale) / 2);
  const offsetY = Math.floor((pxHeight - VIRTUAL_HEIGHT * scale) / 2);

  return { scale, offsetX, offsetY, cssWidth, cssHeight };
}

export function applyViewport(ctx: CanvasRenderingContext2D, vp: ViewportTransform): void {
  const canvas = ctx.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = LETTERBOX_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(vp.scale, 0, 0, vp.scale, vp.offsetX, vp.offsetY);
}

/** Observe size changes (resize, orientation, fold/unfold) and invoke onResize. */
export function observeResize(canvas: HTMLCanvasElement, onResize: () => void): () => void {
  const ro = new ResizeObserver(onResize);
  ro.observe(canvas);
  window.addEventListener('orientationchange', onResize);
  return () => {
    ro.disconnect();
    window.removeEventListener('orientationchange', onResize);
  };
}
