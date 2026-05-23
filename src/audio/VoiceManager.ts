import { TTS_LANG, TTS_RATE, TTS_PITCH, TTS_FEMALE_HINTS, TTS_FALLBACK_MS_PER_CHAR, TTS_FALLBACK_MIN_MS } from '../constants';

/**
 * Wraps window.speechSynthesis. Picks a Korean (ko-KR) voice, preferring
 * voices whose name suggests a female speaker. If no Korean voice is
 * available (CI, headless, voice pack missing), speak() still returns a
 * Promise that resolves after a length-proportional fallback delay so the
 * game loop is not blocked.
 */
export class VoiceManager {
  private voice: SpeechSynthesisVoice | null = null;
  private readonly synth: SpeechSynthesis | null;

  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;
    if (this.synth) {
      this.refreshVoice();
      // voiceschanged fires asynchronously on most browsers; re-pick when it does.
      this.synth.addEventListener?.('voiceschanged', () => this.refreshVoice());
    }
  }

  private refreshVoice(): void {
    if (!this.synth) return;
    const all = this.synth.getVoices();
    const korean = all.filter(v => v.lang?.toLowerCase().startsWith('ko'));
    if (korean.length === 0) {
      this.voice = null;
      return;
    }
    const female = korean.find(v => {
      const name = v.name.toLowerCase();
      return TTS_FEMALE_HINTS.some(h => name.includes(h));
    });
    this.voice = female ?? korean[0] ?? null;
  }

  /** Speak text and resolve once playback ends (or fallback timer elapses). */
  speak(text: string): Promise<void> {
    if (!this.synth) {
      return this.fallback(text);
    }
    return new Promise<void>(resolve => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = TTS_LANG;
      utter.rate = TTS_RATE;
      utter.pitch = TTS_PITCH;
      if (this.voice) utter.voice = this.voice;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      utter.onend = finish;
      utter.onerror = finish;
      try {
        this.synth!.cancel();
        this.synth!.speak(utter);
      } catch {
        // Fall back if speak() throws (rare, e.g. iOS background tabs).
        this.fallback(text).then(finish);
      }
    });
  }

  cancel(): void {
    this.synth?.cancel();
  }

  private fallback(text: string): Promise<void> {
    const ms = Math.max(TTS_FALLBACK_MIN_MS, text.length * TTS_FALLBACK_MS_PER_CHAR);
    return new Promise(r => setTimeout(r, ms));
  }
}
