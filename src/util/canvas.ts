import { BASE_WIDTH, BASE_HEIGHT, LETTERBOX_COLOR } from '../constants';

export interface ViewportTransform {
  scale: number;
  /** Virtual width in logical units; stretches with the screen aspect. */
  virtualWidth: number;
  /** Virtual height in logical units; stretches with the screen aspect. */
  virtualHeight: number;
}

/**
 * Resize the canvas backing store to match its CSS size × devicePixelRatio,
 * then compute a virtual coordinate system that always contains a minimum
 * BASE_WIDTH × BASE_HEIGHT playable area and stretches to match the actual
 * screen aspect on the larger axis. Content positions itself relative to
 * the virtual viewport, so portrait (Galaxy Fold cover) and near-square
 * (Fold main) layouts are both fully used without large letterbox bars.
 */
export function fitCanvas(canvas: HTMLCanvasElement): ViewportTransform {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  const pxWidth = Math.max(1, Math.floor(cssWidth * dpr));
  const pxHeight = Math.max(1, Math.floor(cssHeight * dpr));

  if (canvas.width !== pxWidth) canvas.width = pxWidth;
  if (canvas.height !== pxHeight) canvas.height = pxHeight;

  const scale = Math.min(pxWidth / BASE_WIDTH, pxHeight / BASE_HEIGHT);
  const virtualWidth = pxWidth / scale;
  const virtualHeight = pxHeight / scale;

  return { scale, virtualWidth, virtualHeight };
}

export function applyViewport(ctx: CanvasRenderingContext2D, vp: ViewportTransform): void {
  const canvas = ctx.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = LETTERBOX_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(vp.scale, 0, 0, vp.scale, 0, 0);
}

export function observeResize(canvas: HTMLCanvasElement, onResize: () => void): () => void {
  const ro = new ResizeObserver(onResize);
  ro.observe(canvas);
  window.addEventListener('orientationchange', onResize);
  window.addEventListener('resize', onResize);
  // Galaxy Fold's fold/unfold and software keyboards reshape visualViewport
  // without firing the canvas ResizeObserver until the next layout — listen
  // explicitly so the canvas re-fits the moment the hinge state changes.
  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  vv?.addEventListener('resize', onResize);
  vv?.addEventListener('scroll', onResize);
  // Cover/main display switches can also fire as devicePixelRatio changes;
  // matchMedia watchers re-evaluate when DPR crosses an integer boundary.
  const dprMql = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    : null;
  const onDprChange = () => onResize();
  dprMql?.addEventListener?.('change', onDprChange);
  return () => {
    ro.disconnect();
    window.removeEventListener('orientationchange', onResize);
    window.removeEventListener('resize', onResize);
    vv?.removeEventListener('resize', onResize);
    vv?.removeEventListener('scroll', onResize);
    dprMql?.removeEventListener?.('change', onDprChange);
  };
}
