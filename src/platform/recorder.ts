/** Records the learner's voice on the device so they can compare it with the model voice. */

type AudioSessionType = 'auto' | 'playback' | 'play-and-record';
const audioSession = (navigator as Navigator & { audioSession?: { type: AudioSessionType } }).audioSession;

export const canRecord = () => !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

let stream: MediaStream | null = null;
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let lastUrl: string | null = null;

/** Starts recording; rejects if the microphone is refused. */
export async function startRecording(): Promise<void> {
  if (audioSession) audioSession.type = 'play-and-record';
  stream ??= await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  chunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
  recorder.start();
}

/** Stops recording and returns a playable URL of the take. */
export function stopRecording(): Promise<string | null> {
  const current = recorder;
  if (!current || current.state === 'inactive') return Promise.resolve(null);
  return new Promise(resolve => {
    current.onstop = () => {
      if (lastUrl) URL.revokeObjectURL(lastUrl);
      lastUrl = chunks.length ? URL.createObjectURL(new Blob(chunks, { type: current.mimeType })) : null;
      if (audioSession) audioSession.type = 'playback';
      resolve(lastUrl);
    };
    current.stop();
  });
}

export function playTake(url: string): Promise<void> {
  const audio = new Audio(url);
  return new Promise(resolve => {
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}

/** Releases the microphone (the system indicator turns off). */
export function releaseMic(): void {
  for (const track of stream?.getTracks() ?? []) track.stop();
  stream = null;
  recorder = null;
}
