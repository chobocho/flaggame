export type FlagPos = 'UP' | 'DOWN';
export type FlagSide = 'blue' | 'white';

export interface FlagsState {
  blue: FlagPos;
  white: FlagPos;
}

export interface Command {
  text: string;
  target: FlagsState;
}

export interface KeyBinding {
  side: FlagSide;
  pos: FlagPos;
}

export type Outcome = 'SUCCESS' | 'FAIL';

export interface DifficultyParams {
  /** Probability that any single clause is phrased as a negation. */
  negationProb: number;
  /** Probability that the command has two clauses instead of one. */
  compoundProb: number;
  /** Milliseconds the player has to settle on the target state after speech ends. */
  timeLimitMs: number;
}
