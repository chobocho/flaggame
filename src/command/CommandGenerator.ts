import type {
  Command,
  DifficultyParams,
  FlagPos,
  FlagSide,
  FlagsState,
} from '../types';

/** Commands only ever ask the player to raise (UP) or lower (DOWN); MIDDLE
 *  is the rest position the round starts in but is never spoken aloud. */
type ActionPos = Exclude<FlagPos, 'MIDDLE'>;

interface Clause {
  side: FlagSide;
  pos: ActionPos;
  negated: boolean;
}

const COLOR_TEXT: Record<FlagSide, string> = {
  blue: '청기',
  white: '백기',
};

// Korean action forms keyed by target position.
// `term`  → terminal form  ("올려", "내려")            — last/only clause, positive
// `termN` → terminal negative                        ("올리지 마")
// `conj`  → conjunctive form ("올리고", "내리고")       — non-final clause, positive
// `conjN` → conjunctive negative                     ("올리지 말고")
const ACTION_FORMS: Record<ActionPos, { term: string; termN: string; conj: string; conjN: string }> = {
  UP:   { term: '올려', termN: '올리지 마', conj: '올리고', conjN: '올리지 말고' },
  DOWN: { term: '내려', termN: '내리지 마', conj: '내리고', conjN: '내리지 말고' },
};

function applyClause(state: FlagsState, c: Clause): FlagsState {
  if (c.negated) return state;
  return { ...state, [c.side]: c.pos };
}

function clauseText(c: Clause, isFinal: boolean): string {
  const forms = ACTION_FORMS[c.pos];
  const action = isFinal
    ? c.negated ? forms.termN : forms.term
    : c.negated ? forms.conjN : forms.conj;
  return `${COLOR_TEXT[c.side]} ${action}`;
}

/**
 * Build a Command from explicit clauses. Exposed for tests; production
 * callers go through CommandGenerator.next().
 */
export function buildCommand(current: FlagsState, clauses: Clause[]): Command {
  let target = current;
  const parts: string[] = [];
  for (let i = 0; i < clauses.length; i++) {
    const c = clauses[i]!;
    target = applyClause(target, c);
    parts.push(clauseText(c, i === clauses.length - 1));
  }
  return { text: parts.join(' '), target };
}

export class CommandGenerator {
  constructor(private readonly rng: () => number) {}

  next(current: FlagsState, params: DifficultyParams): Command {
    const compound = this.rng() < params.compoundProb;
    const clauses: Clause[] = compound
      ? this.compoundClauses(params.negationProb)
      : [this.singleClause(params.negationProb)];
    return buildCommand(current, clauses);
  }

  private singleClause(negationProb: number): Clause {
    return {
      side: this.rng() < 0.5 ? 'blue' : 'white',
      pos: this.rng() < 0.5 ? 'UP' : 'DOWN',
      negated: this.rng() < negationProb,
    };
  }

  /**
   * Two clauses must reference different flags — otherwise the second clause
   * silently overrides the first and the player has nothing meaningful to do
   * for the first half of the sentence.
   */
  private compoundClauses(negationProb: number): Clause[] {
    const firstSide: FlagSide = this.rng() < 0.5 ? 'blue' : 'white';
    const secondSide: FlagSide = firstSide === 'blue' ? 'white' : 'blue';
    return [
      { side: firstSide,  pos: this.rng() < 0.5 ? 'UP' : 'DOWN', negated: this.rng() < negationProb },
      { side: secondSide, pos: this.rng() < 0.5 ? 'UP' : 'DOWN', negated: this.rng() < negationProb },
    ];
  }
}
