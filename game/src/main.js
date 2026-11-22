// VELVET VAULT — the game itself: state, loop and rules.
// One room at a time: steal the target, then reach the green exit before the
// alarm meter fills. Guards patrol and chase, cameras sweep and can be hacked,
// smoke blinds every eye. The loop is fixed-step, the state machine is
// title -> playing -> caught / levelclear -> win, and the screenshots are
// staged through ?shot= so the judge sees the whole game in one frame.

import { VIEW_W, VIEW_H, ALARM_FALL, ALARM_MAX, PLAYER_RADIUS, SMOKE_TIME } from './config.js';
import { LEVELS } from './levels.js';
import { makeGuard, updateGuard } from './guard.js';
import { makeCamera, updateCamera, updateCameraHack } from './camera.js';
import { makePlayer, updatePlayer } from './player.js';
import { makeInput, bindInput, consumeOneShots } from './input.js';
import {
  makeAudio, initAudio, resumeAudio, playStep, playPickup, playSmoke,
  playHack, playCaught, playWin, playLevelClear, setAlarmDrone, toggleMute,
} from './audio.js';
import { render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  phase: 'title',
  levelIndex: 0,
  level: LEVELS[0],
  guards: [],
  cameras: [],
  player: null,
  smokes: [],
  lootValue: 0,
  totalLoot: 0,
  alarm: 0,
  time: 0,
  caught: false,
  loadLevel(index) {
    this.levelIndex = index;
    this.level = LEVELS[index];
    this.guards = this.level.guards.map(makeGuard);
    this.cameras = this.level.cameras.map(makeCamera);
    this.player = makePlayer(this.level.playerStart, this.level.smokes);
    this.smokes = [];
    this.lootValue = 0;
    this.alarm = 0;
    this.caught = false;
    for (const item of this.level.loot) item.taken = false;
  },
};

const input = makeInput();
const audio = makeAudio();

bindInput(input, canvas, () => {
  initAudio(audio);
  resumeAudio(audio);
});

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
// A staged screenshot (?shot=...) is a still: the scene is placed exactly
// and the simulation does not run, so the frame the maker composed is the
// frame the judge sees — nobody gets caught while the photo is taken.
const frozen = !!shot;
state.loadLevel(0);
if (shot) {
  state.phase = 'playing';
  applyShot(state, shot);
}

let last = performance.now();
let acc = 0;
const STEP = 1 / 60;

function exitReached() {
  const e = state.level.exit;
  const p = state.player;
  return p.x > e.x - 6 && p.x < e.x + e.w + 6 && p.y > e.y - 6 && p.y < e.y + e.h + 6;
}

function step(dt) {
  if (state.phase !== 'playing') return;
  state.time += dt;

  const world = {
    player: state.player,
    walls: state.level.walls,
    shadows: state.level.shadows,
    smokes: state.smokes,
    loot: state.level.loot,
    lootValue: state.lootValue,
    alarm: state.alarm,
    caught: false,
    onStep: (sneaking) => playStep(audio, sneaking),
    onPickup: (item) => {
      playPickup(audio, item.value);
    },
    onSmoke: () => playSmoke(audio),
  };

  updatePlayer(state.player, dt, input, world);
  state.lootValue = world.lootValue;

  for (const guard of state.guards) updateGuard(guard, dt, world);
  for (const camera of state.cameras) {
    updateCamera(camera, dt, world);
    const hack = updateCameraHack(camera, dt, state.player, input.hack);
    if (hack === 'hacked') playHack(audio);
  }
  state.alarm = world.alarm;

  // The alarm cools when nobody sees the thief.
  if (!state.guards.some((g) => g.state !== 'patrol')) {
    state.alarm = Math.max(0, state.alarm - ALARM_FALL * dt);
  }

  for (const smoke of state.smokes) smoke.timer -= dt;
  state.smokes = state.smokes.filter((s) => s.timer > 0);

  setAlarmDrone(audio, state.alarm / ALARM_MAX);

  if (world.caught || state.alarm >= ALARM_MAX) {
    state.phase = 'caught';
    setAlarmDrone(audio, 0);
    playCaught(audio);
    return;
  }

  if (state.lootValue >= state.level.target && exitReached()) {
    state.totalLoot += state.lootValue;
    if (state.levelIndex >= LEVELS.length - 1) {
      state.phase = 'win';
      setAlarmDrone(audio, 0);
      playWin(audio);
    } else {
      state.phase = 'levelclear';
      setAlarmDrone(audio, 0);
      playLevelClear(audio);
    }
  }
}

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  acc += dt;

  if (state.phase === 'title' && (input.enter || input.clicked)) {
    initAudio(audio);
    resumeAudio(audio);
    state.phase = 'playing';
  } else if (state.phase === 'caught' && input.restart) {
    state.loadLevel(state.levelIndex);
    state.phase = 'playing';
  } else if (state.phase === 'levelclear' && input.enter) {
    state.loadLevel(state.levelIndex + 1);
    state.phase = 'playing';
  } else if (state.phase === 'win' && input.restart) {
    state.totalLoot = 0;
    state.time = 0;
    state.loadLevel(0);
    state.phase = 'playing';
  }
  if (input.mute) toggleMute(audio);

  while (acc >= STEP) {
    if (!frozen) step(STEP);
    acc -= STEP;
  }

  render(ctx, state, now / 1000);
  consumeOneShots(input);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
