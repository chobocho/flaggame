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
