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
}

export const soundFX = new SoundFX();
