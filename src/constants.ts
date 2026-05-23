import type { KeyBinding } from './types';

// Virtual coordinate system. The canvas is letterboxed to preserve this ratio
// across all device sizes (Galaxy Fold cover/main, desktop, etc.).
export const VIRTUAL_WIDTH = 800;
export const VIRTUAL_HEIGHT = 500;

// Palette (HUD/background) — character & flag colors live alongside their renderer in Phase 2.
export const BG_COLOR = '#0f172a';
export const LETTERBOX_COLOR = '#000';
export const TEXT_COLOR = '#e2e8f0';
export const SUBTITLE_COLOR = '#38bdf8';
export const SUBTITLE_PANEL_BG = '#0f172a';
export const SUBTITLE_PANEL_BORDER = '#38bdf8';

// Subtitle panel (Phase 4) — also serves as the command display in Phase 5.
export const SUBTITLE_PANEL_X = 100;
export const SUBTITLE_PANEL_Y = 60;
export const SUBTITLE_PANEL_W = 600;
export const SUBTITLE_PANEL_H = 70;
export const SUBTITLE_FONT_SIZE = 30;

// Initial game tuning (Phase 4 needs values; Phase 6 will animate them).
export const INITIAL_TIME_LIMIT_MS = 1500;
export const INITIAL_NEGATION_PROB = 0.0;
export const INITIAL_COMPOUND_PROB = 0.0;

// TTS
export const TTS_LANG = 'ko-KR';
export const TTS_RATE = 1.05;
export const TTS_PITCH = 1.1;
// Hints used to prefer a female ko-KR voice when multiple are installed.
export const TTS_FEMALE_HINTS = ['female', 'yuna', 'sora', 'heami', 'sun-hi', '여성'];
// Estimated ms per character when no Speech Synthesis voice is available.
export const TTS_FALLBACK_MS_PER_CHAR = 110;
export const TTS_FALLBACK_MIN_MS = 800;

// Start screen (Phase 4)
export const START_PROMPT = '아무 키나 눌러 시작';
export const START_PROMPT_SIZE = 32;

// Phase 5 — gameplay tuning
export const INITIAL_LIVES = 3;
export const SCORE_PER_ROUND = 100;
export const SCORE_PER_COMBO = 20;
export const JUDGE_HOLD_MS = 700;

// Phase 5 — key bindings (mapped from KeyboardEvent.code)
export const KEY_BINDINGS: Record<string, KeyBinding> = {
  KeyQ: { side: 'blue',  pos: 'UP'   },
  KeyA: { side: 'blue',  pos: 'DOWN' },
  KeyP: { side: 'white', pos: 'UP'   },
  KeyL: { side: 'white', pos: 'DOWN' },
};

// Phase 5 — HUD layout & colors
export const HUD_FONT = 'system-ui, sans-serif';
export const HUD_TOP_Y = 38;
export const HUD_SCORE_X = 40;
export const HUD_SCORE_SIZE = 26;
export const HUD_LIFE_X = 760;
export const HUD_LIFE_SIZE = 26;
export const HUD_LIFE_COLOR = '#ef4444';

// Timer bar (Phase 5)
export const TIMER_BAR_X = 200;
export const TIMER_BAR_Y = 150;
export const TIMER_BAR_W = 400;
export const TIMER_BAR_H = 12;
export const TIMER_BAR_BG = '#334155';
export const TIMER_BAR_FG = '#10b981';

// Outcome banner (Phase 5)
export const OUTCOME_SUCCESS_TEXT = '성공!';
export const OUTCOME_FAIL_TEXT = '실패!';
export const OUTCOME_FONT_SIZE = 60;
export const OUTCOME_SUCCESS_COLOR = '#10b981';
export const OUTCOME_FAIL_COLOR = '#ef4444';

// Game over (Phase 5)
export const GAMEOVER_TITLE = 'GAME OVER';
export const GAMEOVER_TITLE_SIZE = 64;
export const GAMEOVER_TITLE_COLOR = '#ef4444';
export const GAMEOVER_HINT = 'R 키를 눌러 다시 시작';
export const GAMEOVER_HINT_SIZE = 26;

// Character colors
export const SKIN_COLOR = '#facc15';
export const BODY_COLOR = '#e2e8f0';
export const POLE_COLOR = '#8b5cf6';
export const BLUE_FLAG_COLOR = '#3b82f6';
export const WHITE_FLAG_COLOR = '#f8fafc';
export const FLAG_OUTLINE = '#1e293b';

// Character geometry (virtual coords)
export const CHAR_HEAD_X = 400;
export const CHAR_HEAD_Y = 290;
export const CHAR_HEAD_R = 36;
export const CHAR_BODY_W = 60;
export const CHAR_BODY_H = 90;
export const CHAR_BODY_TOP = 326; // top of body rect
export const SHOULDER_DX = 28;    // distance from center to each shoulder
export const SHOULDER_Y = 338;
export const ARM_LENGTH = 95;
export const ARM_WIDTH = 12;
export const POLE_LENGTH = 150;
export const POLE_WIDTH = 5;
export const FLAG_W = 70;
export const FLAG_H = 48;

// Arm angles measured from horizontal, outward from body (positive = away from center).
// UP: arm raised; DOWN: arm lowered toward the side.
export const ARM_ANGLE_UP_DEG = 62;
export const ARM_ANGLE_DOWN_DEG = 28;
