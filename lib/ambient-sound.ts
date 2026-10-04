'use client';

// Ambient Sound Synthesizer menggunakan Web Audio API
// Murni sintetis dalam browser: Bebas hak cipta, tanpa loading network, dan instan!

export type AmbientSoundType = 'rain' | 'wind' | 'quill' | 'harp';

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private harpInterval: number | null = null;
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): AmbientSoundType | null {
    return this.currentType;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stop() {
    if (this.harpInterval) {
      window.clearInterval(this.harpInterval);
      this.harpInterval = null;
    }

    this.activeNodes.forEach((node) => {
      if (typeof node === 'object' && node !== null) {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          if ('disconnect' in node) {
            node.disconnect();
          }
        } catch {}
      }
    });

    this.activeNodes = [];
    this.isPlaying = false;
  }

  public play(type: AmbientSoundType) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Jika sudah memutar tipe yang sama, tidak perlu restart
    if (this.isPlaying && this.currentType === type) {
      return;
    }

    this.stop();
    this.currentType = type;
    this.isPlaying = true;

    switch (type) {
      case 'rain':
        this.startRainSound();
        break;
      case 'wind':
        this.startWindSound();
        break;
      case 'quill':
        this.startQuillSound();
        break;
      case 'harp':
        this.startHarpSound();
        break;
    }
  }

  // 1. Suasana Rintik Hujan di Atas Daun & Atap (Rain Sound)
  private startRainSound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // Gain scale
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter agar hangat seperti hujan lembut
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(800, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(150, this.ctx.currentTime);

    whiteNoise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, lowpass, highpass);
  }

  // 2. Desau Angin Lembut (Wind Sound)
  private startWindSound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(320, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(3.5, this.ctx.currentTime);

    // LFO untuk memodulasi desau angin secara alami
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime); // Desau perlahan 5 detik per siklus
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    whiteNoise.connect(bandpass);
    bandpass.connect(windGain);
    windGain.connect(this.masterGain);

    whiteNoise.start();
    lfo.start();

    this.activeNodes.push(whiteNoise, bandpass, lfo, lfoGain, windGain);
  }

  // 3. Gesekan Pena & Kertas Kuno (Quill Friction Sound)
  private startQuillSound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (i % 200 > 160 ? 0.3 : 0.05);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'bandpass';
    highpass.frequency.setValueAtTime(2400, this.ctx.currentTime);
    highpass.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const quillGain = this.ctx.createGain();
    quillGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    noise.connect(highpass);
    highpass.connect(quillGain);
    quillGain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, highpass, quillGain);
  }

  // 4. Petikan Dawai & Harpa Lembut (Soothing Acoustic Notes)
  private startHarpSound() {
    if (!this.ctx || !this.masterGain) return;

    // Nada pentatonik santai (D4, F#4, A4, B4, D5)
    const notes = [293.66, 369.99, 440.0, 493.88, 587.33, 659.25];

    const playSingleNote = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;

      const freq = notes[Math.floor(Math.random() * notes.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.5);
      this.activeNodes.push(osc, gain);
      setTimeout(() => {
        const idx = this.activeNodes.indexOf(osc);
        if (idx !== -1) this.activeNodes.splice(idx, 1);
        const gIdx = this.activeNodes.indexOf(gain);
        if (gIdx !== -1) this.activeNodes.splice(gIdx, 1);
      }, 2600);
    };

    // Mainkan nada pertama langsung
    playSingleNote();

    // Loop nada berikutnya setiap 2-3 detik
    this.harpInterval = window.setInterval(() => {
      playSingleNote();
    }, 2800);
  }
}

// Singleton instance
let ambientInstance: AmbientSoundEngine | null = null;

export function getAmbientSoundEngine(): AmbientSoundEngine {
  if (!ambientInstance) {
    ambientInstance = new AmbientSoundEngine();
  }
  return ambientInstance;
}
