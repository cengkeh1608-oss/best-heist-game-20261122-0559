// VELVET VAULT — keyboard and mouse input.
// WASD or arrows to move, Shift to sneak, Space to dash, Q for a smoke bomb,
// E (hold) to hack a camera, Enter to start or continue, R to restart after
// being caught, M to mute. Mouse click also starts the game from the title.

export function makeInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    sneak: false,
    dash: false,
    smoke: false,
    hack: false,
    enter: false,
    restart: false,
    mute: false,
    clicked: false,
    clickX: 0,
    clickY: 0,
  };
}

export function bindInput(input, canvas, onFirstGesture) {
  let gestureFired = false;
  const fireGesture = () => {
    if (!gestureFired) {
      gestureFired = true;
      onFirstGesture?.();
    }
  };

  const keyMap = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
    ShiftLeft: 'sneak', ShiftRight: 'sneak',
    KeyE: 'hack',
  };

  window.addEventListener('keydown', (event) => {
    fireGesture();
    if (event.code === 'Space') {
      input.dash = true;
      event.preventDefault();
    } else if (event.code === 'KeyQ') {
      input.smoke = true;
    } else if (event.code === 'Enter') {
      input.enter = true;
    } else if (event.code === 'KeyR') {
      input.restart = true;
    } else if (event.code === 'KeyM') {
      input.mute = true;
    } else if (keyMap[event.code]) {
      input[keyMap[event.code]] = true;
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    if (keyMap[event.code]) input[keyMap[event.code]] = false;
  });

  canvas.addEventListener('mousedown', (event) => {
    fireGesture();
    const rect = canvas.getBoundingClientRect();
    input.clicked = true;
    input.clickX = (event.clientX - rect.left) * (canvas.width / rect.width);
    input.clickY = (event.clientY - rect.top) * (canvas.height / rect.height);
  });

  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = false;
    input.sneak = false;
    input.hack = false;
  });
}

// One-shot flags are consumed at the end of each frame so a single press
// never fires twice.
export function consumeOneShots(input) {
  input.dash = false;
  input.enter = false;
  input.restart = false;
  input.mute = false;
  input.clicked = false;
}
