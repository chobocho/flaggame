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
  /** True while the player has paused; tick(), timer, and TTS all freeze. */
  paused: boolean;
  /** True while the help overlay is shown; does not stop the game loop. */
  helpOpen: boolean;
}

export interface StateManagerDeps {
  generator: CommandGenerator;
  voice: VoiceManager;
  difficulty: (roundIndex: number) => DifficultyParams;
  /** Notified once per round, immediately after judgment. */
  onOutcome?: (outcome: Outcome) => void;
}

/** Resting position between rounds — arms held out horizontally, neither
 *  raised nor lowered. Commands only ever ask for UP or DOWN, so MIDDLE
 *  acts as the neutral baseline the player moves away from. */
const INITIAL_FLAGS: FlagsState = { blue: 'MIDDLE', white: 'MIDDLE' };

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
      paused: false,
      helpOpen: false,
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

  /** Player flag input — accepted during SPEAKING and WAITING so the player can
   *  pre-position while the command is still being read. */
  setFlag(side: FlagSide, pos: FlagPos): void {
    if (this.state.paused) return;
    if (this.state.phase !== 'WAITING' && this.state.phase !== 'SPEAKING') return;
    this.state.flags = { ...this.state.flags, [side]: pos };
  }

  /** Toggle pause. Freezes the loop, the WAITING timer, and TTS playback. */
  togglePause(): void {
    if (this.state.phase === 'IDLE' || this.state.phase === 'GAME_OVER') return;
    this.setPaused(!this.state.paused);
  }

  setPaused(paused: boolean): void {
    if (this.state.paused === paused) return;
    this.state.paused = paused;
    if (paused) this.deps.voice.pause();
    else this.deps.voice.resume();
  }

  toggleHelp(): void {
    this.state.helpOpen = !this.state.helpOpen;
  }

  closeHelp(): void {
    this.state.helpOpen = false;
  }

  stop(): void {
    this.loopAbort = true;
    this.deps.voice.cancel();
  }

  /** Per-frame tick: drive the WAITING and JUDGING timers. */
  tick(dt: number): void {
    if (this.state.paused) return;
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
      // Reset flags to the neutral position before each round so the player
      // always starts from the same baseline; the generator then plans its
      // command relative to this fresh state.
      this.state.flags = { ...INITIAL_FLAGS };
      const cmd = this.deps.generator.next(this.state.flags, params);
      this.state.command = cmd;
      this.state.outcome = null;

      this.state.phase = 'SPEAKING';
      await this.deps.voice.speak(cmd.text, params.ttsRate);
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
