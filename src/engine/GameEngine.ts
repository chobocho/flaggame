import {
  fitCanvas,
  applyViewport,
  observeResize,
  type ViewportTransform,
} from '../util/canvas';
import { Renderer } from '../render/Renderer';
import { StateManager } from './StateManager';
import { CommandGenerator } from '../command/CommandGenerator';
import { VoiceManager } from '../audio/VoiceManager';
import { mulberry32 } from '../util/rng';
import {
  INITIAL_TIME_LIMIT_MS,
  INITIAL_NEGATION_PROB,
  INITIAL_COMPOUND_PROB,
} from '../constants';
import type { DifficultyParams } from '../types';

export class GameEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly renderer: Renderer;
  private readonly stateManager: StateManager;
  private viewport: ViewportTransform;
  private lastTime = 0;
  private running = false;
  private rafId = 0;
  private disposeResize: () => void;
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

    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    this.stateManager = new StateManager(
      {
        generator: new CommandGenerator(mulberry32(seed)),
        voice: new VoiceManager(),
        difficulty: defaultDifficulty,
      },
      { blue: 'DOWN', white: 'DOWN' },
    );

    const onKey = (_e: KeyboardEvent) => this.stateManager.startRound();
    const onPointer = () => this.stateManager.startRound();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    this.disposeKeys = () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.stateManager.tick(dt);
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
    this.stateManager.stop();
  }

  private render(): void {
    applyViewport(this.ctx, this.viewport);
    this.renderer.draw(this.stateManager.state);
  }
}

function defaultDifficulty(_roundIndex: number): DifficultyParams {
  // Phase 4: constant difficulty. Phase 6 will interpolate by round.
  return {
    timeLimitMs: INITIAL_TIME_LIMIT_MS,
    negationProb: INITIAL_NEGATION_PROB,
    compoundProb: INITIAL_COMPOUND_PROB,
  };
}
