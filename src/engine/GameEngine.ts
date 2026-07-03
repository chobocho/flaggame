import {
  fitCanvas,
  applyViewport,
  observeResize,
  type ViewportTransform,
} from '../util/canvas';
import { Renderer } from '../render/Renderer';
import { EffectsManager } from '../render/effects';
import { StateManager } from './StateManager';
import { CommandGenerator } from '../command/CommandGenerator';
import { VoiceManager } from '../audio/VoiceManager';
import { InputManager } from '../input/InputManager';
import { PointerManager } from '../input/PointerManager';
import { mulberry32 } from '../util/rng';
import { difficultyForRound } from './difficulty';
import { HighScores, type ScoreEntry } from '../highscores/HighScores';
import { HIGHSCORE_TOP_N } from '../constants';

export class GameEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly renderer: Renderer;
  private readonly stateManager: StateManager;
  private readonly input: InputManager;
  private readonly pointer: PointerManager;
  private readonly effects: EffectsManager;
  private readonly highScores: HighScores;
  private topScores: ScoreEntry[] = [];
  private viewport: ViewportTransform;
  private lastTime = 0;
  private elapsed = 0;
  private running = false;
  private rafId = 0;
  private disposeResize: () => void;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.effects = new EffectsManager();
    this.renderer = new Renderer(ctx, this.effects);
    this.viewport = fitCanvas(canvas);
    this.disposeResize = observeResize(canvas, () => {
      this.viewport = fitCanvas(canvas);
    });

    this.highScores = new HighScores();
    void this.refreshTopScores();

    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    this.stateManager = new StateManager({
      generator: new CommandGenerator(mulberry32(seed)),
      voice: new VoiceManager(),
      difficulty: difficultyForRound,
      onOutcome: outcome => {
        if (outcome === 'SUCCESS') this.effects.successBurst();
        else this.effects.failShake();
      },
      onGameOver: finalScore => {
        void this.recordScore(finalScore);
      },
    });

    this.input = new InputManager({
      onAnyKey: code => this.handleStartKey(code),
      onFlagKey: (side, pos) => this.stateManager.setFlag(side, pos),
      onHelpToggle: () => this.stateManager.toggleHelp(),
      onPauseToggle: () => this.stateManager.togglePause(),
    });

    this.pointer = new PointerManager(canvas, () => this.viewport, {
      onTapBackground: () => this.handleBackgroundTap(),
      onFlagButton: (side, pos) => this.stateManager.setFlag(side, pos),
      onHelpToggle: () => this.stateManager.toggleHelp(),
      onPauseToggle: () => this.stateManager.togglePause(),
    });
  }

  private async refreshTopScores(): Promise<void> {
    try {
      this.topScores = await this.highScores.getTop(HIGHSCORE_TOP_N);
    } catch {
      // Keep whatever list we already have; a failed read shouldn't blank the panel.
    }
  }

  private async recordScore(score: number): Promise<void> {
    if (score <= 0) return;
    try {
      await this.highScores.add({ score, date: Date.now() });
    } catch {
      // Swallow — the rendered list will simply not include this score.
    }
    await this.refreshTopScores();
  }

  private handleStartKey(code: string): void {
    const sm = this.stateManager;
    if (sm.state.helpOpen) {
      sm.closeHelp();
      return;
    }
    const isStartKey = code === 'Space' || code === 'Enter';
    if (sm.state.phase === 'IDLE' && isStartKey) sm.startRound();
    else if (sm.state.phase === 'GAME_OVER' && isStartKey) sm.restart();
  }

  private handleBackgroundTap(): void {
    const sm = this.stateManager;
    if (sm.state.helpOpen) {
      sm.closeHelp();
      return;
    }
    if (sm.state.paused) {
      sm.togglePause();
      return;
    }
    if (sm.state.phase === 'IDLE') sm.startRound();
    else if (sm.state.phase === 'GAME_OVER') sm.restart();
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
      if (!this.stateManager.state.paused) {
        this.effects.tick(dt);
        this.elapsed += dt;
      }
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
    this.pointer.dispose();
    this.stateManager.stop();
  }

  private render(): void {
    applyViewport(this.ctx, this.viewport);
    this.renderer.draw(this.stateManager.state, this.viewport, this.elapsed, this.topScores);
  }
}
