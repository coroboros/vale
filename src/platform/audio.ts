/** Safari's Audio Session API: whether the page plays, records, or lets the system decide. */
type AudioSessionType = 'auto' | 'playback' | 'play-and-record';

const audioSession = (navigator as Navigator & { audioSession?: { type: AudioSessionType } }).audioSession;

export function setAudioSession(type: AudioSessionType): void {
  if (audioSession) audioSession.type = type;
}
