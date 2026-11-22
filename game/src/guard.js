// VELVET VAULT — the patrolling guard.
// A guard walks a loop of waypoints, sweeping a red vision cone. When it
// glimpses the thief it turns suspicious and walks to the last seen spot;
// when the alarm climbs high it gives chase. Walls block its sight, shadows
// hide the thief, smoke blinds it completely.

import {
  GUARD_RADIUS, GUARD_PATROL_SPEED, GUARD_SUSPICIOUS_SPEED, GUARD_CHASE_SPEED,
  GUARD_SIGHT_RANGE, GUARD_SIGHT_HALF_ANGLE, GUARD_HEAR_RADIUS,
  ALARM_RISE_SEEN, ALARM_RISE_GLIMPSE, ALARM_SUSPICIOUS, ALARM_ALERT,
  FLOOR_LEFT, FLOOR_RIGHT, FLOOR_TOP, FLOOR_BOTTOM,
} from './config.js';

export function makeGuard(def) {
  return {
    x: def.x,
    y: def.y,
    angle: def.angle,
    waypoints: def.waypoints.map(([x, y]) => ({ x, y })),
    wpIndex: 1,
    state: 'patrol',
    lastSeen: null,
    investigateTimer: 0,
    sweepPhase: Math.random() * Math.PI * 2,
  };
}

function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// True when the segment from (ax,ay) to (bx,by) crosses any wall rect.
export function sightBlocked(ax, ay, bx, by, walls) {
  for (const w of walls) {
    if (segmentHitsRect(ax, ay, bx, by, w)) return true;
  }
  return false;
}

function segmentHitsRect(ax, ay, bx, by, r) {
  const dx = bx - ax;
  const dy = by - ay;
  let tmin = 0;
  let tmax = 1;
  for (const [p, d, lo, hi] of [
    [ax, dx, r.x, r.x + r.w],
    [ay, dy, r.y, r.y + r.h],
  ]) {
    if (Math.abs(d) < 1e-9) {
      if (p < lo || p > hi) return false;
    } else {
      let t1 = (lo - p) / d;
      let t2 = (hi - p) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }
  }
  return true;
}

export function pointInShadow(x, y, shadows) {
  return shadows.some((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
}

function pointInSmoke(x, y, smokes) {
  return smokes.some((s) => dist(x, y, s.x, s.y) < s.radius);
}

// How well this guard sees the player right now: 'seen', 'glimpse' or 'none'.
// A glimpse is a player inside the cone but hidden in shadow or smoke.
export function guardSees(guard, player, walls, shadows, smokes) {
  const d = dist(guard.x, guard.y, player.x, player.y);
  if (d > GUARD_SIGHT_RANGE) return 'none';
  const toPlayer = angleTo(guard.x, guard.y, player.x, player.y);
  if (Math.abs(angleDiff(toPlayer, guard.angle)) > GUARD_SIGHT_HALF_ANGLE) return 'none';
  if (sightBlocked(guard.x, guard.y, player.x, player.y, walls)) return 'none';
  if (pointInSmoke(player.x, player.y, smokes)) return 'glimpse';
  if (pointInShadow(player.x, player.y, shadows)) return 'glimpse';
  return 'seen';
}

function moveToward(guard, tx, ty, speed, dt) {
  const d = dist(guard.x, guard.y, tx, ty);
  if (d < 2) return true;
  const step = Math.min(d, speed * dt);
  guard.x += ((tx - guard.x) / d) * step;
  guard.y += ((ty - guard.y) / d) * step;
  guard.angle = angleTo(guard.x, guard.y, tx, ty);
  return d - step < 4;
}

export function updateGuard(guard, dt, world) {
  const { player, walls, shadows, smokes } = world;
  const seen = guardSees(guard, player, walls, shadows, smokes);

  if (seen === 'seen') {
    guard.lastSeen = { x: player.x, y: player.y };
    world.alarm = Math.min(100, world.alarm + ALARM_RISE_SEEN * dt);
    if (world.alarm >= ALARM_ALERT) guard.state = 'chase';
    else if (world.alarm >= ALARM_SUSPICIOUS) guard.state = 'suspicious';
  } else if (seen === 'glimpse') {
    world.alarm = Math.min(100, world.alarm + ALARM_RISE_GLIMPSE * dt);
    if (world.alarm >= ALARM_SUSPICIOUS && guard.state === 'patrol') {
      guard.state = 'suspicious';
      guard.lastSeen = { x: player.x, y: player.y };
    }
  }

  // Noise: a running thief close by pulls a patrolling guard over.
  if (guard.state === 'patrol' && player.noise > 0) {
    const d = dist(guard.x, guard.y, player.x, player.y);
    if (d < GUARD_HEAR_RADIUS + player.noise) {
      guard.state = 'suspicious';
      guard.lastSeen = { x: player.x, y: player.y };
    }
  }

  if (guard.state === 'chase') {
    const arrived = moveToward(guard, player.x, player.y, GUARD_CHASE_SPEED, dt);
    if (arrived || dist(guard.x, guard.y, player.x, player.y) < GUARD_RADIUS + 13) {
      world.caught = true;
    }
    if (world.alarm < ALARM_SUSPICIOUS) guard.state = 'patrol';
  } else if (guard.state === 'suspicious' && guard.lastSeen) {
    const arrived = moveToward(guard, guard.lastSeen.x, guard.lastSeen.y, GUARD_SUSPICIOUS_SPEED, dt);
    if (arrived) {
      guard.investigateTimer += dt;
      guard.angle += Math.sin(guard.sweepPhase += dt * 3) * dt * 1.2;
      if (guard.investigateTimer > 2.5) {
        guard.state = 'patrol';
        guard.investigateTimer = 0;
        guard.lastSeen = null;
      }
    }
  } else {
    const wp = guard.waypoints[guard.wpIndex];
    const arrived = moveToward(guard, wp.x, wp.y, GUARD_PATROL_SPEED, dt);
    if (arrived) guard.wpIndex = (guard.wpIndex + 1) % guard.waypoints.length;
  }

  guard.x = Math.max(FLOOR_LEFT + GUARD_RADIUS, Math.min(FLOOR_RIGHT - GUARD_RADIUS, guard.x));
  guard.y = Math.max(FLOOR_TOP + GUARD_RADIUS, Math.min(FLOOR_BOTTOM - GUARD_RADIUS, guard.y));
}
