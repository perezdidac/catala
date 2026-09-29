/**
 * Web Audio API Procedural Retro Sound Synthesizer
 * Zero external audio files; all sounds generated dynamically.
 */

export class SoundFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private ensureContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  /**
   * Classic Steam Locomotive Whistle (Two resonant tones + steam hiss)
   */
  public playWhistle(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 1.4;

    // Dual chime frequencies (classic American/European steam chord: ~587Hz D5 and 740Hz F#5)
    const freqs = [587.3, 739.9];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx === 0 ? 'sawtooth' : 'triangle';

      // Slight pitch bend at start
      osc.frequency.setValueAtTime(freq * 0.96, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.15);
      osc.frequency.setValueAtTime(freq, now + duration - 0.2);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.94, now + duration);

      // Lowpass for vintage warm steam horn acoustics
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.12);
      gain.gain.setValueAtTime(0.2, now + duration - 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    });

    // Steam air noise burst
    this.createNoiseBurst(now, duration, 900, 0.12);
  }

  /**
   * Steam locomotive chuff ("txu... txu!")
   */
  public playChuff(speedPitchFactor: number = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.22 / Math.max(0.6, speedPitchFactor);

    // Steam puff (bandpass noise)
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-3.5 * (i / bufferSize));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450 * speedPitchFactor, now);
    filter.Q.setValueAtTime(2.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);

    // Low mechanical cylinder thud
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(80 * speedPitchFactor, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.1);
  }

  /**
   * Wheel clack on rail joint (ta-dà!)
   */
  public playWheelClack(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.08].forEach((offset) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140 + Math.random() * 20, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.05);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    });
  }

  /**
   * Heavy mechanical switch lever clunk
   */
  public playLever(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Metallic hit 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(260, now);
    osc1.frequency.exponentialRampToValueAtTime(70, now + 0.08);

    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Heavy iron clack 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110, now + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(30, now + 0.22);

    gain2.gain.setValueAtTime(0.4, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.25);
  }

  /**
   * Joyful pickup chime (Child collected an item)
   */
  public playPickup(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  /**
   * Brass station bell ring
   */
  public playBell(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const partials = [1200, 2400, 3100];
    const decay = 1.2;

    partials.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const amp = 0.25 / (i + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay);
    });
  }

  /**
   * Celebratory success fanfare for completing puzzle or arriving at station
   */
  public playSuccess(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Cheerful Catalan fanfare melody: G4, C5, E5, G5, E5, G5, C6!
    const melody = [
      { f: 392.0, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.2 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.18 },
      { f: 1046.5, d: 0.6 }
    ];

    let current = now;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, current);

      gain.gain.setValueAtTime(0.01, current);
      gain.gain.linearRampToValueAtTime(0.28, current + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, current + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(current);
      osc.stop(current + note.d + 0.05);

      current += note.d * 0.9;
    });
  }

  /**
   * Clean UI button click
   */
  public playClick(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Brake steam hiss
   */
  public playBrakeHiss(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.createNoiseBurst(ctx.currentTime, 0.8, 1200, 0.2);
  }

  /**
   * Firebox wood/coal feeding sound
   */
  public playShovel(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Metal scrape + crackle
    this.createNoiseBurst(now, 0.35, 1800, 0.15);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * Cute bird chirp
   */
  public playBirdChirp(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.12].forEach((offset) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200 + Math.random() * 200, t);
      osc.frequency.exponentialRampToValueAtTime(3200, t + 0.06);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    });
  }

  /**
   * Crystalline water drop (river, water crane, or gentle rain)
   */
  public playWaterDrop(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(2200, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Tactile wooden railway block placement click
   */
  public playWoodClick(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Playful cat meow ("Mèu, mèu!")
   */
  public playMeow(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency glide: up then down
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.45);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Cheerful puppy bark ("Bup, bup!")
   */
  public playBark(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.14].forEach((offset) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.09);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.11);
    });
  }

  /**
   * Warm cow lowing ("Muuuu!")
   */
  public playMoo(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.7);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  /**
   * Playful duck quack ("Quac, quac!")
   */
  public playQuack(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.16].forEach((offset) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.Q.setValueAtTime(4.0, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.14);
    });
  }

  /**
   * Cozy sleeping bear snore ("Zzz...")
   */
  public playSnore(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.4);
    osc.frequency.linearRampToValueAtTime(60, now + 0.9);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.0);
  }

  /**
   * Magical sparkling chime chord
   */
  public playMagicChime(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]; // C Major arpeggio
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  private createNoiseBurst(startTime: number, duration: number, cutoff: number, volume: number): void {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(startTime);
  }

  // --- Rain Ambience Generator ---
  private rainSource: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private isRainPlaying: boolean = false;

  public setRain(active: boolean): void {
    if (active) {
      this.startRain();
    } else {
      this.stopRain();
    }
  }

  public startRain(): void {
    if (this.isRainPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.isRainPlaying = true;
    try {
      const bufferSize = ctx.sampleRate * 2; // 2-second looping rain buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink/brown filtered noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.35;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.09, ctx.currentTime + 1.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      this.rainSource = noise;
      this.rainGain = gain;
    } catch {
      // Fallback
    }
  }

  public stopRain(): void {
    if (!this.isRainPlaying) return;
    this.isRainPlaying = false;
    if (this.rainGain && this.ctx) {
      try {
        this.rainGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
        setTimeout(() => {
          if (this.rainSource) {
            try { this.rainSource.stop(); this.rainSource.disconnect(); } catch {}
            this.rainSource = null;
          }
          this.rainGain = null;
        }, 700);
      } catch {
        this.rainSource = null;
        this.rainGain = null;
      }
    }
  }

  // --- Procedural Cozy Ambient Train Melody ---
  private musicIntervalId: number | null = null;
  private isMusicPlaying: boolean = false;
  private musicStep: number = 0;

  // Gentle lullaby train scale (F major pentatonic: F4, G4, A4, C5, D5, F5)
  private readonly melodyNotes: number[] = [
    349.23, // F4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    698.46, // F5
    523.25, // C5
    440.00, // A4
  ];

  public startMusic(): void {
    if (this.musicIntervalId) return;
    this.isMusicPlaying = true;

    if (typeof window !== 'undefined' && window.setInterval) {
      this.musicIntervalId = window.setInterval(() => {
        if (this.isMuted || !this.isMusicPlaying) return;
        this.playMelodyStep();
      }, 750);
    }
  }

  public stopMusic(): void {
    if (this.musicIntervalId !== null) {
      if (typeof window !== 'undefined' && window.clearInterval) {
        window.clearInterval(this.musicIntervalId);
      }
      this.musicIntervalId = null;
    }
    this.isMusicPlaying = false;
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public isMusicOn(): boolean {
    return this.isMusicPlaying;
  }

  private playMelodyStep(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const noteFreq = this.melodyNotes[this.musicStep % this.melodyNotes.length];
    this.musicStep++;

    // Soft chime/marimba oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(noteFreq, now);

    // Warm wooden lowpass
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);

    // Subtle gentle volume so child voice/dialogue is never drowned out
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);

    // Subtle background wheel tick every 2 steps
    if (this.musicStep % 2 === 0) {
      this.playSoftWheelTick(now + 0.35);
    }
  }

  private playSoftWheelTick(time: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.03);

    gain.gain.setValueAtTime(0.02, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.04);
  }

  // --- Catalan Children's Train Song ("El tren petit") ---
  private songTimeoutIds: number[] = [];
  private isSongPlaying: boolean = false;

  public isTrainSongPlaying(): boolean {
    return this.isSongPlaying;
  }

  public stopTrainSong(): void {
    if (typeof window !== 'undefined') {
      this.songTimeoutIds.forEach((id) => window.clearTimeout(id));
    }
    this.songTimeoutIds = [];
    this.isSongPlaying = false;
  }

  public playTrainSong(
    onSyllable?: (syllableIndex: number, text: string) => void,
    onComplete?: () => void
  ): () => void {
    this.stopTrainSong();
    this.isSongPlaying = true;
    const ctx = this.ensureContext();
    if (!ctx) {
      return () => this.stopTrainSong();
    }

    // Traditional melodic rhythm:
    // Phrase 1: "El tren pe-tit que pu-ja a la mun-ta-nya"
    // Phrase 2: "fa txu txu txu i mai no s'en-ga-nya!"
    // Phrase 3: "Xiu-let que so-na: tu-tu-tuuuut!"
    // Phrase 4: "Tots ben con-tents i a-munt, a-munt!"
    const songData: { note: number; dur: number; text: string }[] = [
      // Line 1
      { note: 349.23, dur: 0.35, text: 'El' },      // F4
      { note: 349.23, dur: 0.35, text: 'tren' },    // F4
      { note: 440.00, dur: 0.35, text: 'pe-' },     // A4
      { note: 523.25, dur: 0.40, text: 'tit' },     // C5
      { note: 523.25, dur: 0.35, text: 'que' },     // C5
      { note: 587.33, dur: 0.35, text: 'pu-' },     // D5
      { note: 523.25, dur: 0.35, text: 'ja a' },    // C5
      { note: 440.00, dur: 0.35, text: 'la' },      // A4
      { note: 392.00, dur: 0.35, text: 'mun-' },    // G4
      { note: 349.23, dur: 0.60, text: 'ta-nya,' }, // F4

      // Line 2
      { note: 440.00, dur: 0.35, text: 'fa' },      // A4
      { note: 440.00, dur: 0.30, text: 'txu-' },    // A4
      { note: 440.00, dur: 0.30, text: 'txu-' },    // A4
      { note: 440.00, dur: 0.35, text: 'txu' },     // A4
      { note: 392.00, dur: 0.35, text: 'i' },       // G4
      { note: 349.23, dur: 0.35, text: 'mai' },     // F4
      { note: 392.00, dur: 0.35, text: 'no' },      // G4
      { note: 440.00, dur: 0.35, text: 's\'en-' },  // A4
      { note: 349.23, dur: 0.65, text: 'ga-nya!' }, // F4

      // Line 3
      { note: 523.25, dur: 0.35, text: 'Xiu-' },    // C5
      { note: 523.25, dur: 0.35, text: 'let' },     // C5
      { note: 587.33, dur: 0.35, text: 'que' },     // D5
      { note: 523.25, dur: 0.40, text: 'so-na:' },  // C5
      { note: 698.46, dur: 0.30, text: 'tu-' },     // F5
      { note: 698.46, dur: 0.30, text: 'tu-' },     // F5
      { note: 698.46, dur: 0.70, text: 'tuuuut!' }, // F5

      // Line 4
      { note: 587.33, dur: 0.35, text: 'Tots' },    // D5
      { note: 523.25, dur: 0.35, text: 'ben' },     // C5
      { note: 440.00, dur: 0.35, text: 'con-' },    // A4
      { note: 392.00, dur: 0.35, text: 'tents' },   // G4
      { note: 349.23, dur: 0.35, text: 'i a-' },    // F4
      { note: 392.00, dur: 0.35, text: 'munt,' },   // G4
      { note: 349.23, dur: 0.80, text: 'a-munt!' }, // F4
    ];

    let accumTime = 0.1;
    songData.forEach((item, index) => {
      // Schedule visual highlight callback
      if (typeof window !== 'undefined') {
        const tid = window.setTimeout(() => {
          if (!this.isSongPlaying) return;
          if (onSyllable) onSyllable(index, item.text);
        }, accumTime * 1000);
        this.songTimeoutIds.push(tid);
      }

      // Schedule Web Audio synthesis
      const startT = ctx.currentTime + accumTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.note, startT);

      // Warm wooden marimba envelope
      const vol = this.isMuted ? 0 : 0.22;
      gain.gain.setValueAtTime(0.001, startT);
      gain.gain.linearRampToValueAtTime(vol, startT + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + item.dur * 0.95);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startT);
      osc.stop(startT + item.dur);

      accumTime += item.dur;
    });

    // Schedule completion
    if (typeof window !== 'undefined') {
      const endTid = window.setTimeout(() => {
        this.isSongPlaying = false;
        if (onComplete) onComplete();
      }, accumTime * 1000 + 200);
      this.songTimeoutIds.push(endTid);
    }

    return () => this.stopTrainSong();
  }
}

export const soundFX = new SoundFX();
