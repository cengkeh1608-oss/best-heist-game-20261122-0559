// VELVET VAULT — the sweeping security camera.
// A camera sits on the wall and sweeps an amber cone back and forth. It never
// moves, but its cone reaches far. Stand close and hold the hack key to shut
// it down for a while — then slip past while it is dark.

import {
  CAMERA_SIGHT_RANGE, CAMERA_SIGHT_HALF_ANGLE, CAMERA_SWEEP_SPEED,
  CAMERA_HACK_TIME, CAMERA_DISABLED_TIME, ALARM_RISE_CAMERA,
} from './config.js';
import { sightBlocked, pointInShadow } from './guard.js';

export function makeCamera(def) {
  return {
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    phase: Math.random() * Math.PI * 2,
    angle: def.baseAngle,
    disabledTimer: 0,
    hackProgress: 0,
  };
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function updateCamera(camera, dt, world) {
  if (camera.disabledTimer > 0) {
    camera.disabledTimer -= dt;
    camera.hackProgress = 0;
    return;
  }
  camera.phase += dt * CAMERA_SWEEP_SPEED;
  camera.angle = camera.baseAngle + Math.sin(camera.phase) * camera.sweep;

  const { player, walls, shadows, smokes } = world;
  const d = Math.hypot(player.x - camera.x, player.y - camera.y);
  if (d > CAMERA_SIGHT_RANGE) return;
  const toPlayer = Math.atan2(player.y - camera.y, player.x - camera.x);
  if (Math.abs(angleDiff(toPlayer, camera.angle)) > CAMERA_SIGHT_HALF_ANGLE) return;
  if (sightBlocked(camera.x, camera.y, player.x, player.y, walls)) return;
  if (smokes.some((s) => Math.hypot(player.x - s.x, player.y - s.y) < s.radius)) return;
  if (pointInShadow(player.x, player.y, shadows)) {
    world.alarm = Math.min(100, world.alarm + ALARM_RISE_CAMERA * 0.25 * dt);
    return;
  }
  world.alarm = Math.min(100, world.alarm + ALARM_RISE_CAMERA * dt);
}

// The player stands near the camera and holds the hack key: progress fills,
// then the camera goes dark for a while.
export function updateCameraHack(camera, dt, player, hacking) {
  if (camera.disabledTimer > 0) return;
  const d = Math.hypot(player.x - camera.x, player.y - camera.y);
  if (hacking && d < 70) {
    camera.hackProgress += dt;
    if (camera.hackProgress >= CAMERA_HACK_TIME) {
      camera.disabledTimer = CAMERA_DISABLED_TIME;
      camera.hackProgress = 0;
      return 'hacked';
    }
    return 'hacking';
  }
  camera.hackProgress = Math.max(0, camera.hackProgress - dt * 2);
  return 'idle';
}
