// VELVET VAULT — the thief.
// Wren moves with WASD or arrows. Shift sneaks: slow and silent, the only
// way past a guard's ears. Space dashes through a cone's sweep. Q drops a
// smoke bomb that blinds every eye for a few seconds. E hacks a nearby
// camera. Loot is picked up by walking over it; the exit only opens once the
// target is reached.

import {
  PLAYER_RADIUS, PLAYER_WALK_SPEED, PLAYER_SNEAK_SPEED, PLAYER_DASH_SPEED,
  DASH_TIME, DASH_COOLDOWN, FLOOR_LEFT, FLOOR_RIGHT, FLOOR_TOP, FLOOR_BOTTOM,
} from './config.js';
import { pointInShadow } from './guard.js';

export function makePlayer(start, smokes) {
  return {
    x: start.x,
    y: start.y,
    angle: -Math.PI / 2,
    sneaking: false,
    dashTimer: 0,
    dashCooldown: 0,
    dashDx: 0,
    dashDy: 0,
    smokesLeft: smokes,
    noise: 0,
    stepTimer: 0,
    moving: false,
  };
}

function circleHitsWall(x, y, r, walls) {
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
  }
  return false;
}

function tryMove(player, dx, dy, walls) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (!circleHitsWall(nx, player.y, PLAYER_RADIUS, walls)) player.x = nx;
  if (!circleHitsWall(player.x, ny, PLAYER_RADIUS, walls)) player.y = ny;
  player.x = Math.max(FLOOR_LEFT + PLAYER_RADIUS, Math.min(FLOOR_RIGHT - PLAYER_RADIUS, player.x));
  player.y = Math.max(FLOOR_TOP + PLAYER_RADIUS, Math.min(FLOOR_BOTTOM - PLAYER_RADIUS, player.y));
}

export function updatePlayer(player, dt, input, world) {
  const { walls } = world;
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  const len = Math.hypot(mx, my);
  if (len > 0) {
    mx /= len;
    my /= len;
    player.angle = Math.atan2(my, mx);
  }
  player.moving = len > 0;
  player.sneaking = !!input.sneak && player.dashTimer <= 0;

  if (input.dash && player.dashCooldown <= 0 && len > 0) {
    player.dashTimer = DASH_TIME;
    player.dashCooldown = DASH_COOLDOWN;
    player.dashDx = mx;
    player.dashDy = my;
    player.noise = 140;
  }
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);

  if (player.dashTimer > 0) {
    player.dashTimer -= dt;
    tryMove(player, player.dashDx * PLAYER_DASH_SPEED * dt, player.dashDy * PLAYER_DASH_SPEED * dt, walls);
  } else if (len > 0) {
    const speed = player.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_WALK_SPEED;
    tryMove(player, mx * speed * dt, my * speed * dt, walls);
    player.noise = player.sneaking ? 0 : 60;
    player.stepTimer -= dt;
    if (player.stepTimer <= 0) {
      player.stepTimer = player.sneaking ? 0.55 : 0.34;
      world.onStep?.(player.sneaking);
    }
  } else {
    player.noise = 0;
  }

  if (input.smoke && player.smokesLeft > 0) {
    input.smoke = false;
    player.smokesLeft -= 1;
    world.smokes.push({ x: player.x, y: player.y, radius: 95, timer: 5 });
    world.onSmoke?.();
  }

  // Loot pickup: walk over it and it is yours.
  for (const item of world.loot) {
    if (!item.taken && Math.hypot(player.x - item.x, player.y - item.y) < PLAYER_RADIUS + 16) {
      item.taken = true;
      world.lootValue += item.value;
      world.onPickup?.(item);
    }
  }

  player.hidden = pointInShadow(player.x, player.y, world.shadows);
  return player;
}
