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
import { InputManager } from '../input/InputManager';
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
  private readonly input: InputManager;
  private viewport: ViewportTransform;
  private lastTime = 0;
  private running = false;
  private rafId = 0;
  private disposeResize: () => void;

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
    this.stateManager = new StateManager({
      generator: new CommandGenerator(mulberry32(seed)),
      voice: new VoiceManager(),
      difficulty: defaultDifficulty,
    });

    this.input = new InputManager({
      onAnyKey: code => {
        const sm = this.stateManager;
        if (sm.state.phase === 'IDLE') sm.startRound();
        else if (sm.state.phase === 'GAME_OVER' && code === 'KeyR') sm.restart();
      },
      onFlagKey: (side, pos) => this.stateManager.setFlag(side, pos),
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
    this.input.dispose();
    this.stateManager.stop();
  }

  private render(): void {
    applyViewport(this.ctx, this.viewport);
    this.renderer.draw(this.stateManager.state);
  }
}

function defaultDifficulty(_roundIndex: number): DifficultyParams {
  // Phase 5: still constant. Phase 6 will interpolate by round.
  return {
    timeLimitMs: INITIAL_TIME_LIMIT_MS,
    negationProb: INITIAL_NEGATION_PROB,
    compoundProb: INITIAL_COMPOUND_PROB,
  };
}
