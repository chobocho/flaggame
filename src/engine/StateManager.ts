import type { Command, DifficultyParams, FlagsState } from '../types';
import { CommandGenerator } from '../command/CommandGenerator';
import { VoiceManager } from '../audio/VoiceManager';

export type Phase = 'IDLE' | 'SPEAKING' | 'WAITING' | 'JUDGING' | 'GAME_OVER';

export interface GameState {
  phase: Phase;
  flags: FlagsState;
  command: Command | null;
  /** Remaining ms in WAITING phase (decrements each tick). */
  timerMs: number;
  timerTotalMs: number;
  score: number;
  lives: number;
  roundIndex: number;
}

export interface StateManagerDeps {
  generator: CommandGenerator;
  voice: VoiceManager;
  difficulty: (roundIndex: number) => DifficultyParams;
}

/**
 * Owns the round-level FSM. Phase 4 implements IDLE → SPEAKING → WAITING
 * → (next round). Phase 5 will add JUDGING/GAME_OVER, score, and lives.
 */
export class StateManager {
  readonly state: GameState;
  private readonly deps: StateManagerDeps;
  private loopAbort = false;

  constructor(deps: StateManagerDeps, initialFlags: FlagsState) {
    this.deps = deps;
    this.state = {
      phase: 'IDLE',
      flags: initialFlags,
      command: null,
      timerMs: 0,
      timerTotalMs: 0,
      score: 0,
      lives: 3,
      roundIndex: 0,
    };
  }

  /** Called by GameEngine on the first user gesture (autoplay policy). */
  startRound(): void {
    if (this.state.phase !== 'IDLE') return;
    this.loopAbort = false;
    void this.runLoop();
  }

  stop(): void {
    this.loopAbort = true;
    this.deps.voice.cancel();
  }

  /** Per-frame tick: decrement the waiting timer. */
  tick(dt: number): void {
    if (this.state.phase === 'WAITING') {
      this.state.timerMs = Math.max(0, this.state.timerMs - dt * 1000);
    }
  }

  private async runLoop(): Promise<void> {
    while (!this.loopAbort) {
      const params = this.deps.difficulty(this.state.roundIndex);
      const cmd = this.deps.generator.next(this.state.flags, params);
      this.state.command = cmd;

      this.state.phase = 'SPEAKING';
      await this.deps.voice.speak(cmd.text);
      if (this.loopAbort) return;

      this.state.phase = 'WAITING';
      this.state.timerMs = params.timeLimitMs;
      this.state.timerTotalMs = params.timeLimitMs;
      await this.waitTimer();
      if (this.loopAbort) return;

      // Phase 5 will add JUDGING here. For now, just bump the round.
      this.state.roundIndex += 1;
    }
  }

  /** Resolves when the WAITING timer reaches 0. Driven by tick(). */
  private waitTimer(): Promise<void> {
    return new Promise<void>(resolve => {
      const check = () => {
        if (this.loopAbort || this.state.timerMs <= 0) {
          resolve();
          return;
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
  }
}
