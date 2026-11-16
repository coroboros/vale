/** Short synthesized sounds (no audio files to download). */

let ctx: AudioContext | null = null;

function tone(freq: number, start: number, length: number, type: OscillatorType = 'sine', gain = 0.16) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const t = ctx.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

const SOUNDS = {
  tap: () => tone(660, 0, 0.05, 'triangle', 0.06),
  ok: (combo: number) => {
    const lift = Math.min(combo, 6) * 40;
    tone(620 + lift, 0, 0.12, 'triangle');
    tone(930 + lift, 0.09, 0.18, 'triangle');
  },
  ko: () => {
    tone(220, 0, 0.18, 'sawtooth', 0.06);
    tone(165, 0.1, 0.24, 'sawtooth', 0.05);
  },
  done: () => {
    for (const [i, f] of [523, 659, 784, 1046].entries()) tone(f, i * 0.09, 0.22, 'triangle', 0.13);
  },
  stamp: () => {
    tone(110, 0, 0.12, 'square', 0.08);
    tone(1568, 0.08, 0.3, 'sine', 0.07);
  },
};

export type Sound = keyof typeof SOUNDS;

/** Plays a sound; the audio context is created on the first user gesture. */
export function play(sound: Sound, combo = 0): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    SOUNDS[sound](combo);
  } catch {
    /* audio unavailable: stay silent */
  }
}
