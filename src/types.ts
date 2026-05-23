export type FlagPos = 'UP' | 'DOWN';
export type FlagSide = 'blue' | 'white';

export interface FlagsState {
  blue: FlagPos;
  white: FlagPos;
}
