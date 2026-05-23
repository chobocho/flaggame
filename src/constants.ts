// Virtual coordinate system. The canvas is letterboxed to preserve this ratio
// across all device sizes (Galaxy Fold cover/main, desktop, etc.).
export const VIRTUAL_WIDTH = 800;
export const VIRTUAL_HEIGHT = 500;

// Palette (HUD/background) — character & flag colors live alongside their renderer in Phase 2.
export const BG_COLOR = '#0f172a';
export const LETTERBOX_COLOR = '#000';

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
