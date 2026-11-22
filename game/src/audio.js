// VELVET VAULT — procedural sound, no audio files.
// Everything is synthesized with WebAudio: soft steps, a two-note pickup
// chime, a rising alarm drone while the meter is high, a caught sting and a
// little win arpeggio. Mute with M. Nothing is loaded over the network.

export function makeAudio() {
  return {
    ctx: null,
    master: null,
    muted: false,
    alarmNodes: null,
    alarmOn: false,
  };
}

export function initAudio(audio) {
  if (audio.ctx) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audio.ctx = new Ctx();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0.35;
    audio.master.connect(audio.ctx.destination);
  } catch {
    audio.ctx = null;
  }
}

export function resumeAudio(audio) {
  if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
}

function tone(audio, freq, dur, type, vol, when = 0, slideTo = 0) {
  if (!audio.ctx || audio.muted) return;
  const t0 = audio.ctx.currentTime + when;
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(audio.master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playStep(audio, sneaking) {
  tone(audio, sneaking ? 140 : 190, 0.07, 'sine', sneaking ? 0.05 : 0.12);
}

export function playPickup(audio, value) {
  tone(audio, 660, 0.12, 'triangle', 0.25);
  tone(audio, value >= 500 ? 990 : 880, 0.18, 'triangle', 0.25, 0.09);
}

export function playSmoke(audio) {
  tone(audio, 320, 0.5, 'sine', 0.2, 0, 90);
}

export function playHack(audio) {
  tone(audio, 520, 0.08, 'square', 0.12);
  tone(audio, 780, 0.1, 'square', 0.12, 0.08);
}

export function playCaught(audio) {
  tone(audio, 220, 0.5, 'sawtooth', 0.3, 0, 55);
  tone(audio, 110, 0.7, 'sawtooth', 0.25, 0.1, 40);
}

export function playWin(audio) {
  [523, 659, 784, 1047].forEach((f, i) => tone(audio, f, 0.3, 'triangle', 0.25, i * 0.12));
}

export function playLevelClear(audio) {
  [392, 523, 659].forEach((f, i) => tone(audio, f, 0.22, 'triangle', 0.22, i * 0.1));
}

export function setAlarmDrone(audio, level) {
  if (!audio.ctx || audio.muted) {
    stopAlarmDrone(audio);
    return;
  }
  if (level <= 0.3) {
    stopAlarmDrone(audio);
    return;
  }
  if (!audio.alarmNodes) {
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    const lfo = audio.ctx.createOscillator();
    const lfoGain = audio.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 110;
    lfo.type = 'sine';
    lfo.frequency.value = 6;
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start();
    lfo.start();
    audio.alarmNodes = { osc, gain, lfo };
  }
  audio.alarmNodes.gain.gain.setTargetAtTime(0.02 + level * 0.06, audio.ctx.currentTime, 0.2);
}

export function stopAlarmDrone(audio) {
  if (audio.alarmNodes) {
    try {
      audio.alarmNodes.osc.stop();
      audio.alarmNodes.lfo.stop();
    } catch {
      // Already stopped.
    }
    audio.alarmNodes = null;
  }
}

export function toggleMute(audio) {
  audio.muted = !audio.muted;
  if (audio.master) audio.master.gain.value = audio.muted ? 0 : 0.35;
  if (audio.muted) stopAlarmDrone(audio);
  return audio.muted;
}
