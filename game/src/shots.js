// VELVET VAULT — deterministic scenes for the screenshots.
// The dossier's screenshots are real renders of the game, taken with a query
// string: ?shot=cover, patrol, shadow or victory. Each shot loads a level and
// places the thief, the guards and the alarm exactly where the frame reads
// best, so the judge sees the whole heist in one glance.

export function applyShot(state, shot) {
  if (shot === 'cover') {
    // Level 1, mid-heist: thief between two cones, loot ahead, camera
    // sweeping, alarm half up — every system in one frame.
    state.player.x = 640;
    state.player.y = 380;
    state.player.angle = Math.PI / 2;
    state.guards[0].x = 480;
    state.guards[0].y = 240;
    state.guards[0].angle = Math.PI / 2;
    state.guards[1].x = 820;
    state.guards[1].y = 500;
    state.guards[1].angle = -Math.PI / 2;
    state.cameras[0].angle = Math.PI + 0.5;
    state.alarm = 42;
    state.lootValue = 600;
    state.level.loot[0].taken = true;
    state.level.loot[1].taken = true;
    state.time = 73;
  } else if (shot === 'patrol') {
    // Level 2: a guard's cone sweeps right past the thief, who is pressed
    // against a wall about to dash through the gap.
    state.levelIndex = 1;
    state.loadLevel(1);
    state.player.x = 340;
    state.player.y = 420;
    state.player.angle = 0;
    state.guards[0].x = 350;
    state.guards[0].y = 300;
    state.guards[0].angle = Math.PI / 2;
    state.guards[1].x = 930;
    state.guards[1].y = 500;
    state.guards[1].angle = -Math.PI / 2;
    state.guards[2].x = 640;
    state.guards[2].y = 480;
    state.guards[2].angle = 0;
    state.cameras[0].angle = Math.PI - 0.4;
    state.cameras[1].angle = 0.4;
    state.alarm = 28;
    state.lootValue = 900;
    state.level.loot[0].taken = true;
    state.level.loot[1].taken = true;
    state.level.loot[2].taken = true;
    state.time = 121;
  } else if (shot === 'shadow') {
    // Level 1: the thief crouched HIDDEN in a blue shadow pocket while a
    // guard's red cone and the camera's amber cone pass inches away.
    state.player.x = 165;
    state.player.y = 175;
    state.player.angle = Math.PI / 2;
    state.player.hidden = true;
    state.guards[0].x = 330;
    state.guards[0].y = 200;
    state.guards[0].angle = Math.PI;
    state.guards[1].x = 700;
    state.guards[1].y = 560;
    state.guards[1].angle = 0;
    state.cameras[0].angle = Math.PI + 0.2;
    state.alarm = 55;
    state.lootValue = 300;
    state.level.loot[0].taken = true;
    state.time = 48;
  } else if (shot === 'victory') {
    // Level 3 cleared: the win screen over the grand vault.
    state.levelIndex = 2;
    state.loadLevel(2);
    state.phase = 'win';
    state.totalLoot = 4000 + 2400 + 1200;
    state.time = 342;
    state.lootValue = 4000;
    for (const item of state.level.loot) item.taken = true;
  }
}
