import type {
  Command,
  DifficultyParams,
  FlagPos,
  FlagSide,
  FlagsState,
  Outcome,
} from '../types';
import { CommandGenerator } from '../command/CommandGenerator';
import { VoiceManager } from '../audio/VoiceManager';
import { INITIAL_LIVES, JUDGE_HOLD_MS, SCORE_PER_ROUND, SCORE_PER_COMBO } from '../constants';

export type Phase = 'IDLE' | 'SPEAKING' | 'WAITING' | 'JUDGING' | 'GAME_OVER';

export interface GameState {
  phase: Phase;
  flags: FlagsState;
  command: Command | null;
  /** Remaining ms in WAITING phase (decrements each tick). */
  timerMs: number;
  timerTotalMs: number;
  /** Remaining ms holding the JUDGING outcome banner. */
  outcomeMs: number;
  outcome: Outcome | null;
  score: number;
  lives: number;
  roundIndex: number;
  combo: number;
}

export interface StateManagerDeps {
  generator: CommandGenerator;
  voice: VoiceManager;
  difficulty: (roundIndex: number) => DifficultyParams;
  /** Notified once per round, immediately after judgment. */
  onOutcome?: (outcome: Outcome) => void;
}

const INITIAL_FLAGS: FlagsState = { blue: 'DOWN', white: 'DOWN' };

export class StateManager {
  readonly state: GameState;
  private readonly deps: StateManagerDeps;
  private loopAbort = false;

  constructor(deps: StateManagerDeps) {
    this.deps = deps;
    this.state = this.freshState();
  }

  private freshState(): GameState {
    return {
      phase: 'IDLE',
      flags: { ...INITIAL_FLAGS },
      command: null,
      timerMs: 0,
      timerTotalMs: 0,
      outcomeMs: 0,
      outcome: null,
      score: 0,
      lives: INITIAL_LIVES,
      roundIndex: 0,
      combo: 0,
    };
  }

  /** Called by InputManager on the first key (autoplay policy gate). */
  startRound(): void {
    if (this.state.phase !== 'IDLE') return;
    this.loopAbort = false;
    void this.runLoop();
  }

  /** Reset and restart after GAME_OVER. */
  restart(): void {
    if (this.state.phase !== 'GAME_OVER') return;
    this.loopAbort = true;
    this.deps.voice.cancel();
    Object.assign(this.state, this.freshState());
    this.startRound();
  }

  /** Player flag input — only accepted while the WAITING timer is running. */
  setFlag(side: FlagSide, pos: FlagPos): void {
    if (this.state.phase !== 'WAITING') return;
    this.state.flags = { ...this.state.flags, [side]: pos };
  }

  stop(): void {
    this.loopAbort = true;
    this.deps.voice.cancel();
  }

  /** Per-frame tick: drive the WAITING and JUDGING timers. */
  tick(dt: number): void {
    const ms = dt * 1000;
    if (this.state.phase === 'WAITING') {
      this.state.timerMs = Math.max(0, this.state.timerMs - ms);
    } else if (this.state.phase === 'JUDGING') {
      this.state.outcomeMs = Math.max(0, this.state.outcomeMs - ms);
    }
  }

  private async runLoop(): Promise<void> {
    while (!this.loopAbort) {
      const params = this.deps.difficulty(this.state.roundIndex);
      const cmd = this.deps.generator.next(this.state.flags, params);
      this.state.command = cmd;
      this.state.outcome = null;

      this.state.phase = 'SPEAKING';
      await this.deps.voice.speak(cmd.text);
      if (this.loopAbort) return;

      this.state.phase = 'WAITING';
      this.state.timerMs = params.timeLimitMs;
      this.state.timerTotalMs = params.timeLimitMs;
      await this.waitFor(() => this.state.timerMs <= 0);
      if (this.loopAbort) return;

      this.judge(cmd.target);

      this.state.phase = 'JUDGING';
      this.state.outcomeMs = JUDGE_HOLD_MS;
      await this.waitFor(() => this.state.outcomeMs <= 0);
      if (this.loopAbort) return;

      if (this.state.lives <= 0) {
        this.state.phase = 'GAME_OVER';
        return;
      }
      this.state.roundIndex += 1;
    }
  }

  private judge(target: FlagsState): void {
    const ok = this.state.flags.blue === target.blue && this.state.flags.white === target.white;
    if (ok) {
      this.state.outcome = 'SUCCESS';
      this.state.combo += 1;
      this.state.score += SCORE_PER_ROUND + this.state.combo * SCORE_PER_COMBO;
    } else {
      this.state.outcome = 'FAIL';
      this.state.combo = 0;
      this.state.lives -= 1;
    }
    this.deps.onOutcome?.(this.state.outcome);
  }

  /** Wait until the predicate becomes true; ticks come from tick(). */
  private waitFor(done: () => boolean): Promise<void> {
    return new Promise<void>(resolve => {
      const check = () => {
        if (this.loopAbort || done()) {
          resolve();
          return;
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
  }
}
