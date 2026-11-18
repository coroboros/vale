import { beforeEach, describe, expect, it, vi } from 'vitest';

async function withSettings(change: Record<string, unknown>) {
  const { db } = await import('../../src/state/store');
  db.value = { ...db.value, settings: { ...db.value.settings, ...change } };
}

describe('sound settings', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('plays sound effects only when « Sons » is on and quiet mode is off', async () => {
    let tones = 0;
    const node = { connect: (n: unknown) => n, start() {}, stop() {} };
    const param = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
    vi.stubGlobal(
      'AudioContext',
      class {
        state = 'running';
        currentTime = 0;
        destination = {};
        createOscillator() {
          tones++;
          return { ...node, type: 'sine', frequency: param };
        }
        createGain() {
          return { ...node, gain: param };
        }
      },
    );
    const { play } = await import('../../src/platform/sfx');
    await withSettings({ sfx: false });
    play('ok');
    expect(tones).toBe(0);
    await withSettings({ sfx: true, quietUntil: Date.now() + 60_000 });
    play('ok');
    expect(tones).toBe(0);
    await withSettings({ quietUntil: 0 });
    play('ok');
    expect(tones).toBeGreaterThan(0);
  });

  it('keeps one voice when « Voix variées » is off', async () => {
    const heard: string[] = [];
    const voices = [
      { name: 'A', lang: 'es-ES', localService: true },
      { name: 'B', lang: 'es-ES', localService: true },
    ];
    vi.stubGlobal('window', { speechSynthesis: {} });
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => voices,
      speak: (u: { voice: { name: string }; onend?: () => void }) => {
        heard.push(u.voice.name);
        u.onend?.();
      },
      cancel() {},
      addEventListener() {},
    });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        constructor(public text: string) {}
      },
    );
    const speech = await import('../../src/platform/speech');
    speech.initSpeech();
    await withSettings({ variedVoices: true });
    await speech.say('hola', { lang: 'es-ES', variant: 1 });
    await withSettings({ variedVoices: false });
    await speech.say('hola', { lang: 'es-ES', variant: 1 });
    expect(heard).toEqual(['B', 'A']);
  });
});
