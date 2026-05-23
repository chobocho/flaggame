import {
  fitCanvas,
  applyViewport,
  observeResize,
  type ViewportTransform,
} from '../util/canvas';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  BG_COLOR,
  TEXT_COLOR,
  ACCENT_COLOR,
  BOOT_TITLE,
  BOOT_SUBTITLE,
  BOOT_TITLE_SIZE,
  BOOT_SUBTITLE_SIZE,
} from '../constants';

export class GameEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private viewport: ViewportTransform;
  private lastTime = 0;
  private running = false;
  private rafId = 0;
  private disposeResize: () => void;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.viewport = fitCanvas(canvas);
    this.disposeResize = observeResize(canvas, () => {
      this.viewport = fitCanvas(canvas);
    });
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.update(dt);
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.disposeResize();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private update(_dt: number): void {
    // Phase 1: no game state yet.
  }

  private render(): void {
    const ctx = this.ctx;
    applyViewport(ctx, this.viewport);

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = `bold ${BOOT_TITLE_SIZE}px system-ui, sans-serif`;
    ctx.fillText(BOOT_TITLE, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 40);

    ctx.fillStyle = ACCENT_COLOR;
    ctx.font = `${BOOT_SUBTITLE_SIZE}px system-ui, sans-serif`;
    ctx.fillText(BOOT_SUBTITLE, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 40);
  }
}
