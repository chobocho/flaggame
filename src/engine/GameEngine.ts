import {
  fitCanvas,
  applyViewport,
  observeResize,
  type ViewportTransform,
} from '../util/canvas';
import { Renderer } from '../render/Renderer';
import type { FlagsState } from '../types';

export class GameEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly renderer: Renderer;
  private viewport: ViewportTransform;
  private lastTime = 0;
  private running = false;
  private rafId = 0;
  private disposeResize: () => void;

  // Phase 2: flag state is mutated directly via debug keys (Q/A/P/L) so we can
  // visually verify all four combinations. Phase 5 will route the same keys
  // through a proper InputManager + StateManager.
  private flags: FlagsState = { blue: 'DOWN', white: 'DOWN' };
  private disposeKeys: () => void;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.renderer = new Renderer(ctx);
    this.viewport = fitCanvas(canvas);
    this.disposeResize = observeResize(canvas, () => {
      this.viewport = fitCanvas(canvas);
    });

    const onKey = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyQ': this.flags = { ...this.flags, blue: 'UP' }; break;
        case 'KeyA': this.flags = { ...this.flags, blue: 'DOWN' }; break;
        case 'KeyP': this.flags = { ...this.flags, white: 'UP' }; break;
        case 'KeyL': this.flags = { ...this.flags, white: 'DOWN' }; break;
      }
    };
    window.addEventListener('keydown', onKey);
    this.disposeKeys = () => window.removeEventListener('keydown', onKey);
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
    this.disposeKeys();
  }

  private update(_dt: number): void {
    // Phase 2: no time-based state yet.
  }

  private render(): void {
    applyViewport(this.ctx, this.viewport);
    this.renderer.draw({ flags: this.flags });
  }
}
