import { KEY_BINDINGS } from '../constants';
import type { FlagSide, FlagPos } from '../types';

export interface InputHandlers {
  /** Called for every keydown — used to wake the game from IDLE/GAME_OVER. */
  onAnyKey: (code: string) => void;
  /** Called when a Q/A/P/L binding fires — only valid during WAITING. */
  onFlagKey: (side: FlagSide, pos: FlagPos) => void;
}

export class InputManager {
  private readonly listener: (e: KeyboardEvent) => void;

  constructor(private readonly handlers: InputHandlers) {
    this.listener = (e: KeyboardEvent) => {
      this.handlers.onAnyKey(e.code);
      const binding = KEY_BINDINGS[e.code];
      if (binding) this.handlers.onFlagKey(binding.side, binding.pos);
    };
    window.addEventListener('keydown', this.listener);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.listener);
  }
}
