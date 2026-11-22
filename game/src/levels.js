// VELVET VAULT — the three rooms of the heist.
// Each level is one room the thief crosses: walls and display cases that block
// movement and sight, guards on patrol routes, sweeping cameras, shadow
// pockets to hide in, loot with a dollar value, and the exit door. Difficulty
// rises by adding guards, cameras and loot while the target climbs.

export const LEVELS = [
  {
    name: '1 — THE GALLERY',
    subtitle: 'Quiet opening. Learn the cones.',
    target: 1200,
    smokes: 2,
    walls: [
      { x: 300, y: 210, w: 150, h: 26 },
      { x: 700, y: 210, w: 150, h: 26 },
      { x: 300, y: 470, w: 150, h: 26 },
      { x: 700, y: 470, w: 150, h: 26 },
      { x: 560, y: 330, w: 130, h: 26 },
    ],
    shadows: [
      { x: 90, y: 120, w: 150, h: 110 },
      { x: 1010, y: 520, w: 170, h: 120 },
    ],
    guards: [
      {
        x: 480, y: 160, angle: 0,
        waypoints: [[480, 160], [800, 160], [800, 330], [480, 330]],
      },
      {
        x: 800, y: 560, angle: Math.PI,
        waypoints: [[800, 560], [480, 560], [480, 420], [800, 420]],
      },
    ],
    cameras: [
      { x: 1240, y: 100, baseAngle: Math.PI, sweep: 0.9 },
    ],
    loot: [
      { kind: 'gold', x: 375, y: 150, value: 300 },
      { kind: 'gold', x: 775, y: 150, value: 300 },
      { kind: 'gem', x: 625, y: 300, value: 500 },
      { kind: 'gold', x: 375, y: 560, value: 300 },
      { kind: 'painting', x: 900, y: 620, value: 400 },
    ],
    playerStart: { x: 60, y: 650 },
    exit: { x: 40, y: 100, w: 56, h: 70 },
  },
  {
    name: '2 — THE VAULT HALL',
    subtitle: 'Two cameras now. Mind the crossfire.',
    target: 2400,
    smokes: 2,
    walls: [
      { x: 240, y: 190, w: 26, h: 180 },
      { x: 620, y: 150, w: 200, h: 26 },
      { x: 1010, y: 190, w: 26, h: 180 },
      { x: 240, y: 480, w: 26, h: 150 },
      { x: 620, y: 540, w: 200, h: 26 },
      { x: 1010, y: 480, w: 26, h: 150 },
      { x: 460, y: 330, w: 26, h: 110 },
      { x: 790, y: 330, w: 26, h: 110 },
    ],
    shadows: [
      { x: 90, y: 300, w: 120, h: 150 },
      { x: 1070, y: 300, w: 120, h: 150 },
      { x: 560, y: 90, w: 160, h: 70 },
    ],
    guards: [
      {
        x: 350, y: 130, angle: Math.PI / 2,
        waypoints: [[350, 130], [350, 640], [620, 640], [620, 130]],
      },
      {
        x: 930, y: 130, angle: Math.PI / 2,
        waypoints: [[930, 130], [930, 640], [660, 640], [660, 130]],
      },
      {
        x: 640, y: 380, angle: 0,
        waypoints: [[640, 380], [640, 480], [640, 280]],
      },
    ],
    cameras: [
      { x: 1240, y: 100, baseAngle: Math.PI, sweep: 0.8 },
      { x: 40, y: 100, baseAngle: 0, sweep: 0.8 },
    ],
    loot: [
      { kind: 'gold', x: 180, y: 150, value: 300 },
      { kind: 'gold', x: 1100, y: 150, value: 300 },
      { kind: 'gem', x: 720, y: 110, value: 500 },
      { kind: 'gem', x: 560, y: 640, value: 500 },
      { kind: 'gold', x: 180, y: 640, value: 300 },
      { kind: 'gold', x: 1100, y: 640, value: 300 },
      { kind: 'painting', x: 640, y: 440, value: 600 },
    ],
    playerStart: { x: 640, y: 660 },
    exit: { x: 1210, y: 330, w: 56, h: 70 },
  },
  {
    name: '3 — THE GRAND VAULT',
    subtitle: 'The big score. Every eye is open.',
    target: 4000,
    smokes: 3,
    walls: [
      { x: 200, y: 160, w: 180, h: 26 },
      { x: 900, y: 160, w: 180, h: 26 },
      { x: 200, y: 540, w: 180, h: 26 },
      { x: 900, y: 540, w: 180, h: 26 },
      { x: 560, y: 120, w: 26, h: 130 },
      { x: 690, y: 120, w: 26, h: 130 },
      { x: 560, y: 470, w: 26, h: 130 },
      { x: 690, y: 470, w: 26, h: 130 },
      { x: 480, y: 330, w: 320, h: 26 },
    ],
    shadows: [
      { x: 90, y: 120, w: 130, h: 120 },
      { x: 1060, y: 120, w: 130, h: 120 },
      { x: 90, y: 540, w: 130, h: 120 },
      { x: 1060, y: 540, w: 130, h: 120 },
    ],
    guards: [
      {
        x: 300, y: 130, angle: 0,
        waypoints: [[300, 130], [980, 130], [980, 300], [300, 300]],
      },
      {
        x: 980, y: 590, angle: Math.PI,
        waypoints: [[980, 590], [300, 590], [300, 420], [980, 420]],
      },
      {
        x: 640, y: 300, angle: Math.PI / 2,
        waypoints: [[640, 300], [640, 200], [640, 520]],
      },
      {
        x: 140, y: 380, angle: 0,
        waypoints: [[140, 380], [1140, 380]],
      },
    ],
    cameras: [
      { x: 1240, y: 100, baseAngle: Math.PI, sweep: 0.9 },
      { x: 40, y: 100, baseAngle: 0, sweep: 0.9 },
      { x: 640, y: 90, baseAngle: Math.PI / 2, sweep: 1.0 },
    ],
    loot: [
      { kind: 'gold', x: 290, y: 120, value: 300 },
      { kind: 'gold', x: 990, y: 120, value: 300 },
      { kind: 'gem', x: 640, y: 90, value: 600 },
      { kind: 'gem', x: 290, y: 640, value: 600 },
      { kind: 'gem', x: 990, y: 640, value: 600 },
      { kind: 'gold', x: 140, y: 380, value: 300 },
      { kind: 'gold', x: 1140, y: 380, value: 300 },
      { kind: 'painting', x: 640, y: 300, value: 800 },
      { kind: 'painting', x: 640, y: 520, value: 800 },
    ],
    playerStart: { x: 640, y: 660 },
    exit: { x: 1210, y: 100, w: 56, h: 70 },
  },
];
