// VELVET VAULT — shared constants for the heist.
// One place for every number the other files agree on: the canvas size, the
// speeds, the sight ranges and the colours that make danger, cover and loot
// obvious at a glance.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const HUD_H = 72;
export const FLOOR_TOP = HUD_H + 8;
export const FLOOR_BOTTOM = VIEW_H - 12;
export const FLOOR_LEFT = 12;
export const FLOOR_RIGHT = VIEW_W - 12;

export const PLAYER_RADIUS = 13;
export const PLAYER_WALK_SPEED = 175;
export const PLAYER_SNEAK_SPEED = 88;
export const PLAYER_DASH_SPEED = 430;
export const DASH_TIME = 0.22;
export const DASH_COOLDOWN = 2.4;

export const GUARD_RADIUS = 14;
export const GUARD_PATROL_SPEED = 62;
export const GUARD_SUSPICIOUS_SPEED = 105;
export const GUARD_CHASE_SPEED = 148;
export const GUARD_SIGHT_RANGE = 215;
export const GUARD_SIGHT_HALF_ANGLE = 0.56;
export const GUARD_HEAR_RADIUS = 70;

export const CAMERA_SIGHT_RANGE = 265;
export const CAMERA_SIGHT_HALF_ANGLE = 0.42;
export const CAMERA_SWEEP_SPEED = 0.55;
export const CAMERA_HACK_TIME = 1.2;
export const CAMERA_DISABLED_TIME = 12;

export const ALARM_RISE_SEEN = 58;
export const ALARM_RISE_GLIMPSE = 14;
export const ALARM_RISE_CAMERA = 46;
export const ALARM_FALL = 7;
export const ALARM_SUSPICIOUS = 35;
export const ALARM_ALERT = 62;
export const ALARM_MAX = 100;

export const SMOKE_RADIUS = 95;
export const SMOKE_TIME = 5;

export const COLORS = {
  floorDark: '#1c1a26',
  floorLight: '#232033',
  carpet: '#5e1f2b',
  carpetEdge: '#8a6d3b',
  wall: '#3a3348',
  wallEdge: '#c9a227',
  shadow: 'rgba(56, 120, 220, 0.30)',
  shadowEdge: 'rgba(120, 170, 255, 0.55)',
  coneGuard: 'rgba(235, 60, 60, 0.28)',
  coneGuardEdge: 'rgba(255, 90, 90, 0.65)',
  coneCamera: 'rgba(245, 190, 60, 0.30)',
  coneCameraEdge: 'rgba(255, 215, 110, 0.65)',
  gold: '#f2c14e',
  goldDark: '#a67c1a',
  gem: '#4de3d1',
  player: '#7b5cff',
  playerHood: '#4a2f9e',
  guard: '#2f3542',
  guardCap: '#c0392b',
  exit: '#2ecc71',
  exitDark: '#1d7a44',
  hudBg: '#14121c',
  text: '#f5efe0',
  textDim: '#b8b0a0',
};
