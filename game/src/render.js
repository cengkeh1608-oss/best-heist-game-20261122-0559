// VELVET VAULT — everything the eye sees.
// The look is a night museum, not a generic tile set: dark marble floor with
// a red carpet runner, gold-trimmed walls, glass display cases, loot that
// glows gold, red guard cones, amber camera cones, blue shadow pockets and a
// green exit. The HUD keeps loot, alarm, time, level and tools in one bar so
// a single screenshot shows the whole game.

import {
  VIEW_W, VIEW_H, HUD_H, FLOOR_TOP, FLOOR_BOTTOM, FLOOR_LEFT, FLOOR_RIGHT,
  GUARD_RADIUS, PLAYER_RADIUS, GUARD_SIGHT_RANGE, GUARD_SIGHT_HALF_ANGLE,
  CAMERA_SIGHT_RANGE, CAMERA_SIGHT_HALF_ANGLE, CAMERA_HACK_TIME, COLORS,
} from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCone(ctx, x, y, angle, halfAngle, range, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle - halfAngle) * range, y + Math.sin(angle - halfAngle) * range);
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle + halfAngle) * range, y + Math.sin(angle + halfAngle) * range);
  ctx.stroke();
}

function drawFloor(ctx, t) {
  ctx.fillStyle = COLORS.floorDark;
  ctx.fillRect(0, FLOOR_TOP, VIEW_W, FLOOR_BOTTOM - FLOOR_TOP);
  const tile = 64;
  for (let y = FLOOR_TOP; y < FLOOR_BOTTOM; y += tile) {
    for (let x = FLOOR_LEFT; x < FLOOR_RIGHT; x += tile) {
      const even = ((x / tile) | 0) + ((y / tile) | 0);
      if (even % 2 === 0) {
        ctx.fillStyle = COLORS.floorLight;
        ctx.fillRect(x, y, tile, tile);
      }
    }
  }
  // Red carpet runner down the middle.
  ctx.fillStyle = COLORS.carpet;
  ctx.fillRect(VIEW_W / 2 - 90, FLOOR_TOP, 180, FLOOR_BOTTOM - FLOOR_TOP);
  ctx.strokeStyle = COLORS.carpetEdge;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(VIEW_W / 2 - 90, FLOOR_TOP);
  ctx.lineTo(VIEW_W / 2 - 90, FLOOR_BOTTOM);
  ctx.moveTo(VIEW_W / 2 + 90, FLOOR_TOP);
  ctx.lineTo(VIEW_W / 2 + 90, FLOOR_BOTTOM);
  ctx.stroke();
  // Gold trim around the room.
  ctx.strokeStyle = COLORS.wallEdge;
  ctx.lineWidth = 4;
  ctx.strokeRect(FLOOR_LEFT, FLOOR_TOP, FLOOR_RIGHT - FLOOR_LEFT, FLOOR_BOTTOM - FLOOR_TOP);
}

function drawWalls(ctx, walls) {
  for (const w of walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = COLORS.wallEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(w.x, w.y, w.w, 4);
  }
}

function drawShadows(ctx, shadows) {
  for (const s of shadows) {
    ctx.fillStyle = COLORS.shadow;
    roundRect(ctx, s.x, s.y, s.w, s.h, 18);
    ctx.fill();
    ctx.strokeStyle = COLORS.shadowEdge;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    roundRect(ctx, s.x, s.y, s.w, s.h, 18);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(160, 200, 255, 0.85)';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHADOW — SAFE', s.x + s.w / 2, s.y + 20);
  }
}

function drawLoot(ctx, loot, t) {
  for (const item of loot) {
    if (item.taken) continue;
    const pulse = 1 + Math.sin(t * 3 + item.x) * 0.08;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.scale(pulse, pulse);
    if (item.kind === 'gold') {
      ctx.fillStyle = COLORS.goldDark;
      ctx.fillRect(-13, -7, 26, 14);
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(-11, -9, 22, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(-8, -8, 8, 3);
    } else if (item.kind === 'gem') {
      ctx.fillStyle = COLORS.gem;
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(11, 0);
      ctx.lineTo(0, 13);
      ctx.lineTo(-11, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(6, -3);
      ctx.lineTo(-6, -3);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#6b4f1d';
      ctx.fillRect(-14, -10, 28, 20);
      ctx.fillStyle = '#c98a2e';
      ctx.fillRect(-11, -7, 22, 14);
      ctx.fillStyle = '#7ec8e3';
      ctx.fillRect(-8, -4, 16, 8);
    }
    ctx.restore();
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$' + item.value, item.x, item.y - 20);
  }
}

function drawExit(ctx, exit, open, t) {
  const glow = open ? 0.5 + Math.sin(t * 4) * 0.2 : 0.18;
  ctx.fillStyle = open ? `rgba(46, 204, 113, ${glow})` : `rgba(120, 120, 120, ${glow})`;
  roundRect(ctx, exit.x - 8, exit.y - 8, exit.w + 16, exit.h + 16, 10);
  ctx.fill();
  ctx.fillStyle = open ? COLORS.exit : '#555';
  roundRect(ctx, exit.x, exit.y, exit.w, exit.h, 6);
  ctx.fill();
  ctx.strokeStyle = COLORS.exitDark;
  ctx.lineWidth = 2;
  roundRect(ctx, exit.x, exit.y, exit.w, exit.h, 6);
  ctx.stroke();
  ctx.fillStyle = '#0b3d20';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x + exit.w / 2, exit.y + exit.h / 2 + 5);
  if (open) {
    ctx.fillStyle = COLORS.exit;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('OPEN — GO!', Math.min(exit.x + exit.w / 2, VIEW_W - 48), exit.y + exit.h + 24);
  }
}

function drawSmoke(ctx, smokes) {
  for (const s of smokes) {
    const grad = ctx.createRadialGradient(s.x, s.y, 10, s.x, s.y, s.radius);
    grad.addColorStop(0, 'rgba(200, 200, 210, 0.75)');
    grad.addColorStop(1, 'rgba(200, 200, 210, 0.05)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGuards(ctx, guards) {
  for (const g of guards) {
    drawCone(ctx, g.x, g.y, g.angle, GUARD_SIGHT_HALF_ANGLE, GUARD_SIGHT_RANGE,
      COLORS.coneGuard, COLORS.coneGuardEdge);
  }
  for (const g of guards) {
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath();
    ctx.arc(g.x, g.y, GUARD_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f0f14';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = COLORS.guardCap;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f5efe0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.angle) * (GUARD_RADIUS + 6), g.y + Math.sin(g.angle) * (GUARD_RADIUS + 6));
    ctx.stroke();
    if (g.state !== 'patrol') {
      ctx.fillStyle = g.state === 'chase' ? '#ff3b30' : '#ffcc00';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.state === 'chase' ? '!' : '?', g.x, g.y - GUARD_RADIUS - 8);
    }
  }
}

function drawCameras(ctx, cameras, t) {
  for (const c of cameras) {
    if (c.disabledTimer <= 0) {
      drawCone(ctx, c.x, c.y, c.angle, CAMERA_SIGHT_HALF_ANGLE, CAMERA_SIGHT_RANGE,
        COLORS.coneCamera, COLORS.coneCameraEdge);
    }
  }
  for (const c of cameras) {
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.disabledTimer > 0 ? '#555' : '#ff5a5a';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
    ctx.fill();
    if (c.disabledTimer <= 0) {
      ctx.strokeStyle = '#f5efe0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x + Math.cos(c.angle) * 18, c.y + Math.sin(c.angle) * 18);
      ctx.stroke();
    }
    if (c.hackProgress > 0 && c.disabledTimer <= 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(c.x - 22, c.y - 30, 44, 7);
      ctx.fillStyle = '#4de3d1';
      ctx.fillRect(c.x - 21, c.y - 29, 42 * (c.hackProgress / CAMERA_HACK_TIME), 5);
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HACKING…', c.x, c.y - 34);
    }
    if (c.disabledTimer > 0) {
      ctx.fillStyle = '#4de3d1';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OFF ' + Math.ceil(c.disabledTimer) + 's', c.x, c.y - 18);
    }
  }
}

function drawPlayer(ctx, player, t) {
  if (player.hidden) {
    ctx.strokeStyle = 'rgba(120, 170, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_RADIUS + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = COLORS.playerHood;
  ctx.beginPath();
  ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1c1038';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(player.x + Math.cos(player.angle) * 5, player.y + Math.sin(player.angle) * 5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5efe0';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(player.hidden ? 'HIDDEN' : 'WREN', player.x, player.y - PLAYER_RADIUS - 8);
}

function drawHud(ctx, state) {
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VELVET VAULT', 16, 32);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(state.level.name, 16, 54);

  const lx = 330;
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText(`LOOT  $${state.lootValue} / $${state.level.target}`, lx, 30);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(state.lootValue >= state.level.target ? 'TARGET HIT — EXIT OPEN' : 'steal the target, then reach EXIT', lx, 52);

  const ax = 640;
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', ax, 26);
  const barW = 220;
  const barH = 16;
  ctx.fillStyle = '#2a2438';
  roundRect(ctx, ax, 34, barW, barH, 8);
  ctx.fill();
  const frac = Math.max(0, Math.min(1, state.alarm / 100));
  const alarmColor = state.alarm < 35 ? '#2ecc71' : state.alarm < 62 ? '#f39c12' : '#e74c3c';
  ctx.fillStyle = alarmColor;
  if (frac > 0) {
    roundRect(ctx, ax, 34, barW * frac, barH, 8);
    ctx.fill();
  }
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  roundRect(ctx, ax, 34, barW, barH, 8);
  ctx.stroke();
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(state.alarm < 35 ? 'quiet' : state.alarm < 62 ? 'suspicious…' : 'THEY SEE YOU!', ax, 64);

  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText(`TIME ${formatTime(state.time)}`, 920, 30);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`SMOKE ×${state.player.smokesLeft}  [Q]    HACK [E]    SNEAK [Shift]    DASH [Space]`, 920, 52);
  ctx.textAlign = 'left';
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function drawObjective(ctx, state) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, VIEW_H - 30, VIEW_W, 30);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const need = Math.max(0, state.level.target - state.lootValue);
  ctx.fillText(
    need > 0
      ? `Steal $${need} more, then slip out the EXIT — stay out of the red cones, hide in blue shadow.`
      : 'Target hit! Get to the green EXIT before the alarm climbs.',
    VIEW_W / 2, VIEW_H - 10,
  );
}

function drawOverlay(ctx, title, lines, hint) {
  ctx.fillStyle = 'rgba(10, 8, 18, 0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW_W / 2, 250);
  ctx.fillStyle = COLORS.text;
  ctx.font = '19px system-ui, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 300 + i * 30));
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(hint, VIEW_W / 2, 300 + lines.length * 30 + 40);
}

export function render(ctx, state, t) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (state.phase === 'title') {
    drawFloor(ctx, t);
    drawWalls(ctx, state.level.walls);
    drawShadows(ctx, state.level.shadows);
    drawLoot(ctx, state.level.loot, t);
    drawExit(ctx, state.level.exit, false, t);
    drawOverlay(ctx, 'VELVET VAULT', [
      'The Meridian Heist — three rooms, one clean getaway.',
      'WASD move · Shift sneak · Space dash · Q smoke · E hack cameras',
      'Red cones see you. Blue shadow hides you. Fill the alarm and you are caught.',
    ], 'Press ENTER or click to start the heist');
    return;
  }
  drawFloor(ctx, t);
  drawWalls(ctx, state.level.walls);
  drawShadows(ctx, state.level.shadows);
  drawLoot(ctx, state.level.loot, t);
  drawExit(ctx, state.level.exit, state.lootValue >= state.level.target, t);
  drawSmoke(ctx, state.smokes);
  drawGuards(ctx, state.guards);
  drawCameras(ctx, state.cameras, t);
  drawPlayer(ctx, state.player, t);
  drawHud(ctx, state);
  drawObjective(ctx, state);

  if (state.phase === 'caught') {
    drawOverlay(ctx, 'CAUGHT!', [
      `The alarm hit 100 in ${state.level.name}.`,
      `Loot carried: $${state.lootValue} of $${state.level.target}.`,
    ], 'Press R to try this room again');
  } else if (state.phase === 'levelclear') {
    drawOverlay(ctx, 'ROOM CLEAN!', [
      `${state.level.name} — $${state.lootValue} lifted in ${formatTime(state.time)}.`,
      `Total so far: $${state.totalLoot}.`,
    ], 'Press ENTER for the next room');
  } else if (state.phase === 'win') {
    drawOverlay(ctx, 'THE PERFECT HEIST!', [
      `All three rooms clean. Total loot: $${state.totalLoot}.`,
      `Finished in ${formatTime(state.time)} — the Meridian is yours, Wren.`,
    ], 'Press R to run it again');
  }
}
