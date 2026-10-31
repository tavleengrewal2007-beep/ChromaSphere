/**
 * Procedural Web Audio API sound synthesizer
 * Zero external audio files, 100% generated in real-time.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.18, this.ctx.currentTime);
    }
  }

  /**
   * Played when morphing between shapes: ethereal celestial chord
   */
  public playMorph() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const baseFreqs = [261.63, 329.63, 392.0, 523.25, 659.25]; // C maj chord
    const baseFreq = baseFreqs[Math.floor(Math.random() * baseFreqs.length)];

    [1, 1.5, 2].forEach((mult, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * mult, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * mult * 1.25, now + 0.4);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06 / (i + 1), now + 0.05 + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7 + i * 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.02);
      osc.stop(now + 0.8 + i * 0.1);
    });
  }

  /**
   * Played when user clicks in 3D canvas: sonic ripple burst
   */
  public playShockwave() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    
    // Sub-bass sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.45);

    // High shimmer
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(880, now);
    chime.frequency.exponentialRampToValueAtTime(1320, now + 0.2);

    chimeGain.gain.setValueAtTime(0.04, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    chime.connect(chimeGain);
    chimeGain.connect(this.masterGain);
    chime.start(now);
    chime.stop(now + 0.35);
  }

  /**
   * Subtle shimmer when hovering over particles
   */
  public playParticleTouch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freqs = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }
}

export const soundEngine = new SoundEngine();
