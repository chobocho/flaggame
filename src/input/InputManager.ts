import { KEY_BINDINGS } from '../constants';
import type { FlagSide, FlagPos } from '../types';

export interface InputHandlers {
  /** Called for every keydown — used to wake the game from IDLE/GAME_OVER. */
  onAnyKey: (code: string) => void;
  /** Called when a Q/A/P/L binding fires. */
  onFlagKey: (side: FlagSide, pos: FlagPos) => void;
  /** F1 or the on-screen ❓ button. */
  onHelpToggle: () => void;
  /** ESC key or the on-screen pause button. */
  onPauseToggle: () => void;
}

export class InputManager {
  private readonly listener: (e: KeyboardEvent) => void;

  constructor(private readonly handlers: InputHandlers) {
    this.listener = (e: KeyboardEvent) => {
      if (e.code === 'F1') {
        e.preventDefault();
        this.handlers.onHelpToggle();
        return;
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        this.handlers.onPauseToggle();
        return;
      }
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
