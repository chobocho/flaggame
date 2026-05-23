import type { KeyBinding } from './types';

// Adaptive virtual coordinate system. The canvas guarantees at least
// BASE_WIDTH × BASE_HEIGHT logical units of playable area, then stretches
// the longer axis to match the actual screen aspect. Content positions
// itself with anchor offsets from the four corners + center, so Galaxy
// Fold 7 cover (tall portrait) and main (near-square) screens both fill
// the display without large letterbox bars.
export const BASE_WIDTH = 480;
export const BASE_HEIGHT = 700;

// Palette
export const BG_COLOR = '#0f172a';
export const LETTERBOX_COLOR = '#000';
export const TEXT_COLOR = '#e2e8f0';
export const SUBTITLE_COLOR = '#38bdf8';
export const SUBTITLE_PANEL_BG = '#0f172a';
export const SUBTITLE_PANEL_BORDER = '#38bdf8';

// HUD edge padding (anchor-relative)
export const HUD_EDGE_PAD = 24;

// Subtitle panel — width is clamped so it fits even on narrow screens
export const SUBTITLE_PANEL_TOP = 72;
export const SUBTITLE_PANEL_H = 64;
export const SUBTITLE_PANEL_MAX_W = 560;
export const SUBTITLE_PANEL_MIN_SIDE_PAD = 32;
export const SUBTITLE_FONT_SIZE = 24;

// Difficulty curve
export const INITIAL_TIME_LIMIT_MS = 1500;
export const FINAL_TIME_LIMIT_MS = 700;
export const INITIAL_NEGATION_PROB = 0.0;
export const FINAL_NEGATION_PROB = 0.4;
export const INITIAL_COMPOUND_PROB = 0.0;
export const FINAL_COMPOUND_PROB = 0.6;
export const ROUNDS_TO_MAX = 15;

// TTS
export const TTS_LANG = 'ko-KR';
export const TTS_RATE = 1.05;
export const TTS_PITCH = 1.1;
export const TTS_FEMALE_HINTS = ['female', 'yuna', 'sora', 'heami', 'sun-hi', '여성'];
export const TTS_FALLBACK_MS_PER_CHAR = 110;
export const TTS_FALLBACK_MIN_MS = 800;

// Start screen
export const START_PROMPT = '아무 키나 눌러 시작';
export const START_PROMPT_SIZE = 28;
export const START_PROMPT_BOTTOM_OFFSET = 48;

// Gameplay tuning
export const INITIAL_LIVES = 3;
export const SCORE_PER_ROUND = 100;
export const SCORE_PER_COMBO = 20;
export const JUDGE_HOLD_MS = 700;

// Key bindings (KeyboardEvent.code → flag mutation)
export const KEY_BINDINGS: Record<string, KeyBinding> = {
  KeyQ: { side: 'blue',  pos: 'UP'   },
  KeyA: { side: 'blue',  pos: 'DOWN' },
  KeyP: { side: 'white', pos: 'UP'   },
  KeyL: { side: 'white', pos: 'DOWN' },
};

// HUD typography
export const HUD_FONT = 'system-ui, sans-serif';
export const HUD_SCORE_SIZE = 22;
export const HUD_LIFE_SIZE = 22;
export const HUD_LIFE_COLOR = '#ef4444';

// Timer bar
export const TIMER_BAR_TOP = SUBTITLE_PANEL_TOP + SUBTITLE_PANEL_H + 12;
export const TIMER_BAR_W = 320;
export const TIMER_BAR_H = 10;
export const TIMER_BAR_BG = '#334155';
export const TIMER_BAR_FG = '#10b981';

// Outcome banner
export const OUTCOME_SUCCESS_TEXT = '성공!';
export const OUTCOME_FAIL_TEXT = '실패!';
export const OUTCOME_FONT_SIZE = 56;
export const OUTCOME_SUCCESS_COLOR = '#10b981';
export const OUTCOME_FAIL_COLOR = '#ef4444';
export const OUTCOME_BOTTOM_OFFSET = 80;

// Particles (success feedback)
export const PARTICLE_COUNT = 32;
export const PARTICLE_SPEED_MIN = 120;
export const PARTICLE_SPEED_MAX = 320;
export const PARTICLE_GRAVITY = 600;
export const PARTICLE_LIFE_MS = 700;
export const PARTICLE_RADIUS = 4;
export const PARTICLE_COLORS = ['#10b981', '#34d399', '#a7f3d0', '#fde68a'];

// Screen shake (fail feedback)
export const SHAKE_DURATION_MS = 240;
export const SHAKE_INTENSITY = 9;

// Particle origin offset from the character anchor (chest area)
export const PARTICLE_ORIGIN_DY = -30;

// Game over
export const GAMEOVER_TITLE = 'GAME OVER';
export const GAMEOVER_TITLE_SIZE = 56;
export const GAMEOVER_TITLE_COLOR = '#ef4444';
export const GAMEOVER_HINT = 'R 키를 눌러 다시 시작';
export const GAMEOVER_HINT_SIZE = 22;

// Character geometry — coordinates are RELATIVE to the character origin.
// The renderer places the origin at the visual center of the play area.
export const SKIN_COLOR = '#facc15';
export const BODY_COLOR = '#e2e8f0';
export const POLE_COLOR = '#8b5cf6';
export const BLUE_FLAG_COLOR = '#3b82f6';
export const WHITE_FLAG_COLOR = '#f8fafc';
export const FLAG_OUTLINE = '#1e293b';

export const HEAD_DY = -70;
export const HEAD_R = 36;
export const BODY_W = 60;
export const BODY_H = 90;
export const BODY_TOP_DY = -34;
export const SHOULDER_DX = 28;
export const SHOULDER_DY = -22;
export const ARM_LENGTH = 95;
export const ARM_WIDTH = 12;
export const POLE_LENGTH = 150;
export const POLE_WIDTH = 5;
export const FLAG_W = 70;
export const FLAG_H = 48;

export const ARM_ANGLE_UP_DEG = 62;
export const ARM_ANGLE_DOWN_DEG = 28;
