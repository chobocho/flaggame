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

// Top-right icon buttons (help / pause). Drawn in virtual-coord space.
export const ICON_BTN_SIZE = 44;
export const ICON_BTN_GAP = 12;
export const ICON_BTN_TOP = 56;
export const ICON_BTN_BG = 'rgba(15, 23, 42, 0.75)';
export const ICON_BTN_BORDER = '#334155';
export const ICON_BTN_BORDER_ACTIVE = '#38bdf8';
export const ICON_BTN_FONT_SIZE = 24;

// On-screen flag control buttons (mobile / touch). Always rendered, but
// scaled with the virtual viewport so they sit comfortably on phones.
export const FLAG_BTN_SIZE = 84;
export const FLAG_BTN_RADIUS = 14;
export const FLAG_BTN_GAP = 12;
export const FLAG_BTN_BOTTOM_OFFSET = 110;
export const FLAG_BTN_SIDE_OFFSET = 28;
export const FLAG_BTN_LABEL_FONT_SIZE = 18;
export const FLAG_BTN_KEY_FONT_SIZE = 14;
export const FLAG_BTN_BLUE_BG = 'rgba(59, 130, 246, 0.85)';
export const FLAG_BTN_BLUE_BG_ACTIVE = '#60a5fa';
export const FLAG_BTN_WHITE_BG = 'rgba(248, 250, 252, 0.92)';
export const FLAG_BTN_WHITE_BG_ACTIVE = '#ffffff';
export const FLAG_BTN_LABEL_BLUE = '#f1f5f9';
export const FLAG_BTN_LABEL_WHITE = '#0f172a';
export const FLAG_BTN_BORDER = 'rgba(15, 23, 42, 0.4)';

// Help overlay
export const HELP_OVERLAY_BG = 'rgba(15, 23, 42, 0.92)';
export const HELP_TITLE = '도움말';
export const HELP_TITLE_SIZE = 32;
export const HELP_LINE_SIZE = 20;
export const HELP_LINE_GAP = 32;
export const HELP_HINT = '아무 곳이나 누르거나 F1 키로 닫기';
export const HELP_HINT_SIZE = 16;
export const HELP_HINT_COLOR = '#64748b';

// Pause overlay
export const PAUSE_OVERLAY_BG = 'rgba(0, 0, 0, 0.55)';
export const PAUSE_TITLE = '일시 정지';
export const PAUSE_TITLE_SIZE = 44;
export const PAUSE_TITLE_COLOR = '#fde68a';
export const PAUSE_HINT = 'ESC 또는 ⏸ 버튼으로 이어하기';
export const PAUSE_HINT_SIZE = 18;
export const PAUSE_HINT_COLOR = '#cbd5e1';

// Subtitle panel — width is clamped so it fits even on narrow screens
export const SUBTITLE_PANEL_TOP = 72;
export const SUBTITLE_PANEL_H = 64;
export const SUBTITLE_PANEL_MAX_W = 560;
export const SUBTITLE_PANEL_MIN_SIDE_PAD = 32;
export const SUBTITLE_FONT_SIZE = 24;

// Difficulty curve — timer now runs concurrently with TTS, so the budget
// has to cover both the speech and the player's reaction window.
export const INITIAL_TIME_LIMIT_MS = 3200;
export const FINAL_TIME_LIMIT_MS = 1600;
export const INITIAL_NEGATION_PROB = 0.0;
export const FINAL_NEGATION_PROB = 0.4;
export const INITIAL_COMPOUND_PROB = 0.0;
export const FINAL_COMPOUND_PROB = 0.6;
export const INITIAL_BOTH_PROB = 0.1;
export const FINAL_BOTH_PROB = 0.25;
export const ROUNDS_TO_MAX = 15;

// TTS
export const TTS_LANG = 'ko-KR';
export const TTS_RATE = 1.05;
export const TTS_RATE_MIN = 1.0;
export const TTS_RATE_MAX = 1.8;
export const TTS_PITCH = 1.1;
export const TTS_FEMALE_HINTS = ['female', 'yuna', 'sora', 'heami', 'sun-hi', '여성'];
export const TTS_FALLBACK_MS_PER_CHAR = 110;
export const TTS_FALLBACK_MIN_MS = 800;
/** Fallback ms-per-char shrinks with rate so the dev-mode/CI fallback timing
 *  also speeds up alongside live speech. */
export const TTS_FALLBACK_RATE_DIVISOR = 1.0;

// Start screen
export const START_PROMPT = 'SPACE 키 또는 화면을 눌러 시작';
export const START_PROMPT_SIZE = 26;
export const START_PROMPT_BOTTOM_OFFSET = 48;

// Start-screen keyboard guide
export const START_GUIDE_TITLE = '조작 단축키';
export const START_GUIDE_TITLE_SIZE = 22;
export const START_GUIDE_LINE_SIZE = 18;
export const START_GUIDE_LINE_GAP = 26;
export const START_GUIDE_TOP_OFFSET_RATIO = 0.30;
export const START_GUIDE_COLOR = '#94a3b8';
export const START_GUIDE_KEY_COLOR = '#38bdf8';
export const START_GUIDE_LINES: ReadonlyArray<readonly [string, string]> = [
  ['Q / A', '청기 올림 / 내림'],
  ['P / L', '백기 올림 / 내림'],
  ['F1 / ❓', '도움말 열기'],
  ['ESC / ⏸', '일시 정지'],
  ['SPACE', '시작 / 재시작'],
];

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
/** Rainbow stops (red→violet) painted across the FULL bar width so the
 *  hue under each position stays fixed as the bar shrinks from the right. */
export const TIMER_BAR_RAINBOW: ReadonlyArray<string> = [
  '#ef4444', // red
  '#f97316', // orange
  '#facc15', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
];

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

// High scores
export const HIGHSCORE_TOP_N = 10;
export const HIGHSCORE_TITLE = '🏆 최고 점수';
export const HIGHSCORE_TITLE_SIZE = 20;
export const HIGHSCORE_TITLE_GAP = 10;
export const HIGHSCORE_LINE_SIZE = 16;
export const HIGHSCORE_LINE_GAP = 22;
export const HIGHSCORE_PANEL_W = 320;
export const HIGHSCORE_PANEL_PAD_X = 16;
export const HIGHSCORE_PANEL_PAD_Y = 14;
export const HIGHSCORE_PANEL_RADIUS = 12;
/** Right edge of the score column, offset from the panel center line. */
export const HIGHSCORE_SCORE_COL_DX = 30;
/** The panel lives between the centered overlay text and the bottom prompt
 *  area. The game-over/pause hint line sits at vh/2 + 70 with a 22px font,
 *  so 100 keeps the panel clear of it; 92 keeps it above the bottom prompts.
 *  Rows that don't fit in this band are dropped (vh is always >= BASE_HEIGHT,
 *  which still leaves room for the title plus several rows). */
export const HIGHSCORE_PANEL_TOP_CLEARANCE = 100;
export const HIGHSCORE_PANEL_BOTTOM_CLEARANCE = 92;
export const HIGHSCORE_PANEL_BG = 'rgba(15, 23, 42, 0.85)';
export const HIGHSCORE_PANEL_BORDER = '#475569';
export const HIGHSCORE_RANK_COLOR = '#fde68a';
export const HIGHSCORE_SCORE_COLOR = '#f8fafc';
export const HIGHSCORE_DATE_COLOR = '#94a3b8';
export const HIGHSCORE_EMPTY_TEXT = '아직 기록이 없습니다';

// Game over
export const GAMEOVER_TITLE = 'GAME OVER';
export const GAMEOVER_TITLE_SIZE = 56;
export const GAMEOVER_TITLE_COLOR = '#ef4444';
export const GAMEOVER_HINT = 'SPACE 키 또는 화면을 눌러 다시 시작';
export const GAMEOVER_HINT_SIZE = 22;

// Character geometry — coordinates are RELATIVE to the character origin.
// The renderer places the origin at the visual center of the play area.
export const SKIN_COLOR = '#facc15';
export const BODY_COLOR = '#e2e8f0';
export const POLE_COLOR = '#8b5cf6';
export const BLUE_FLAG_COLOR = '#3b82f6';
export const WHITE_FLAG_COLOR = '#f8fafc';
export const FLAG_OUTLINE = '#1e293b';

export const HEAD_DY = -78;
export const HEAD_RX = 38;
export const HEAD_RY = 44;
export const BODY_W = 60;
export const BODY_H = 90;
export const BODY_TOP_DY = -34;
export const SHOULDER_DX = 28;
export const SHOULDER_DY = -22;
export const ARM_LENGTH = 95;
export const ARM_WIDTH = 12;
export const POLE_LENGTH = 150;
export const POLE_WIDTH = 5;
export const FLAG_W = 78;
export const FLAG_H = 52;

export const ARM_ANGLE_UP_DEG = 62;
export const ARM_ANGLE_DOWN_DEG = 28;
// Resting (MIDDLE) — arm held horizontally out to the side.
export const ARM_ANGLE_MIDDLE_DEG = 4;

// Anime-ish character extras
export const HAIR_COLOR = '#7c3aed';
export const HAIR_HIGHLIGHT = '#a78bfa';
export const EYE_WHITE = '#ffffff';
export const EYE_IRIS = '#1d4ed8';
export const EYE_PUPIL = '#0f172a';
export const EYE_HIGHLIGHT = '#f0f9ff';
export const BROW_COLOR = '#4c1d95';
export const BLUSH_COLOR = 'rgba(244, 114, 182, 0.55)';
export const MOUTH_COLOR = '#be123c';
export const COLLAR_COLOR = '#1e293b';
export const TIE_COLOR = '#ef4444';

// Idle animation (breath/bob)
export const IDLE_BOB_AMPL = 3.5;
export const IDLE_BOB_PERIOD_S = 1.8;
export const BLINK_PERIOD_S = 4.0;
export const BLINK_DURATION_S = 0.14;

// Flag wave
export const FLAG_WAVE_SEGMENTS = 8;
export const FLAG_WAVE_AMPL = 4.5;
export const FLAG_WAVE_FREQ = 2.6;
export const FLAG_WAVE_SPEED = 5.4;
export const FLAG_FOLD_LINES = 3;
export const FLAG_FOLD_COLOR = 'rgba(15, 23, 42, 0.18)';
export const FLAG_WHITE_SHADE = 'rgba(15, 23, 42, 0.08)';
