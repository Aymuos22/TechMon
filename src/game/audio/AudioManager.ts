type SoundId = 'menu' | 'interact' | 'battle' | 'victory' | 'hit' | 'ui';

type TrackId = 'title' | 'city' | 'route' | 'battle' | 'victory';

/** Simple chiptune patterns — original, no copyrighted tunes */
const TRACKS: Record<TrackId, { tempo: number; notes: number[] }> = {
  title: {
    tempo: 220,
    notes: [262, 330, 392, 523, 392, 330, 294, 349, 440, 349, 294, 262],
  },
  city: {
    tempo: 280,
    notes: [196, 247, 294, 247, 220, 262, 330, 262, 196, 247, 294, 0, 220, 175, 196, 0],
  },
  route: {
    tempo: 240,
    notes: [294, 330, 349, 392, 349, 330, 294, 262, 294, 330, 392, 440, 392, 349, 330, 294],
  },
  battle: {
    tempo: 140,
    notes: [311, 311, 233, 311, 370, 311, 233, 208, 311, 370, 415, 370, 311, 277, 233, 208],
  },
  victory: {
    tempo: 180,
    notes: [392, 494, 587, 784, 587, 784, 0, 0],
  },
};

/**
 * Lightweight Web Audio chiptune engine — no external assets.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentTrack: string | null = null;
  private wantedTrack: string | null = null;
  private musicTimer: ReturnType<typeof setTimeout> | null = null;
  private noteIndex = 0;
  private unlocked = false;
  musicVolume = 0.35;
  sfxVolume = 0.55;
  muted = false;

  private ensure(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.applyVolumes();
    }
    return this.ctx;
  }

  private applyVolumes(): void {
    if (this.musicGain) this.musicGain.gain.value = this.muted ? 0 : this.musicVolume;
    if (this.sfxGain) this.sfxGain.gain.value = this.muted ? 0 : this.sfxVolume;
  }

  async resume(): Promise<void> {
    const ctx = this.ensure();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }
    this.unlocked = ctx.state === 'running';
    // Restart music that was requested before unlock
    if (this.unlocked && this.wantedTrack && !this.musicTimer) {
      this.startMusicLoop(this.wantedTrack);
    }
  }

  setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
    this.applyVolumes();
  }

  setSfxVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    this.applyVolumes();
  }

  setMuted(m: boolean): void {
    this.muted = m;
    this.applyVolumes();
  }

  playMusic(track: string): void {
    this.wantedTrack = track;
    if (this.currentTrack === track && this.musicTimer) return;
    this.stopMusicLoop();
    this.currentTrack = track;
    try {
      this.ensure();
      void this.resume().then(() => {
        if (this.wantedTrack === track) this.startMusicLoop(track);
      });
    } catch {
      /* blocked until gesture */
    }
  }

  private startMusicLoop(track: string): void {
    this.stopMusicLoop();
    this.currentTrack = track;
    this.noteIndex = 0;
    if (this.muted) return;
    const pattern = TRACKS[track as TrackId] ?? TRACKS.city;
    const step = () => {
      if (this.wantedTrack !== track || !this.ctx || !this.musicGain) return;
      const freq = pattern.notes[this.noteIndex % pattern.notes.length];
      this.noteIndex += 1;
      if (freq > 0 && this.ctx.state === 'running') {
        this.beep(freq, pattern.tempo * 0.85, track === 'battle' ? 'square' : 'triangle', true);
      }
      this.musicTimer = setTimeout(step, pattern.tempo);
    };
    step();
  }

  private stopMusicLoop(): void {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  stopMusic(): void {
    this.stopMusicLoop();
    this.currentTrack = null;
    this.wantedTrack = null;
  }

  private beep(
    freq: number,
    durationMs: number,
    type: OscillatorType,
    isMusic: boolean,
  ): void {
    if (!this.ctx) return;
    const dest = isMusic ? this.musicGain : this.sfxGain;
    if (!dest) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    const dur = Math.max(0.04, durationMs / 1000);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    const peak = isMusic ? 0.045 : 0.12;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.015);
    gain.gain.linearRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  playSfx(id: SoundId): void {
    if (this.muted) return;
    const map: Record<SoundId, { f: number; d: number; type: OscillatorType; f2?: number }> = {
      menu: { f: 520, d: 90, type: 'square', f2: 780 },
      interact: { f: 440, d: 100, type: 'triangle' },
      battle: { f: 180, d: 160, type: 'sawtooth', f2: 90 },
      victory: { f: 523, d: 120, type: 'square', f2: 784 },
      hit: { f: 160, d: 70, type: 'sawtooth' },
      ui: { f: 700, d: 50, type: 'square' },
    };
    const conf = map[id];
    try {
      this.ensure();
      void this.resume().then(() => {
        if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
        this.beep(conf.f, conf.d, conf.type, false);
        if (conf.f2) {
          setTimeout(() => this.beep(conf.f2!, conf.d * 0.8, conf.type, false), conf.d * 0.55);
        }
      });
    } catch {
      /* ignore */
    }
  }
}

export const audioManager = new AudioManager();
