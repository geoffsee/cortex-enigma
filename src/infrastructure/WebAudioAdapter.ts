import type { IAudioPort } from '../application/ports/IAudioPort';
import type { AudioScene } from '../domain/generativeAudio';

type WindowWithAudio = Window &
  typeof globalThis & { webkitAudioContext?: typeof AudioContext };

// Realises an AudioScene as a layered oscillator drone through a shared low-pass
// filter. Everything touching the Web Audio API is deferred until start() so the
// class is safe to construct during SSR and cheap to hold idle.
export class WebAudioAdapter implements IAudioPort {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private voices: { osc: OscillatorNode; gain: GainNode }[] = [];

  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as WindowWithAudio;
    return typeof w.AudioContext !== 'undefined' || typeof w.webkitAudioContext !== 'undefined';
  }

  isSupported(): boolean {
    return WebAudioAdapter.isSupported();
  }

  async start(scene: AudioScene): Promise<void> {
    if (!WebAudioAdapter.isSupported()) return;
    if (!this.ctx) {
      const w = window as WindowWithAudio;
      const Ctor = w.AudioContext ?? w.webkitAudioContext!;
      this.ctx = new Ctor();
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.filter.connect(this.master);
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.applyScene(scene);
    const now = this.ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(this.master!.gain.value, now);
    this.master!.gain.linearRampToValueAtTime(0.55, now + 0.4);
  }

  update(scene: AudioScene): void {
    if (this.ctx) this.applyScene(scene);
  }

  stop(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) {
      this.disposeVoices();
      this.ctx = null;
      this.filter = null;
      this.master = null;
      return;
    }
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.3);
    const voices = this.voices;
    this.voices = [];
    this.ctx = null;
    this.filter = null;
    this.master = null;
    window.setTimeout(() => {
      voices.forEach(({ osc, gain }) => {
        try {
          osc.stop();
        } catch {
          /* oscillator already stopped */
        }
        osc.disconnect();
        gain.disconnect();
      });
      ctx.close().catch(() => {
        /* context already closed */
      });
    }, 320);
  }

  private disposeVoices(): void {
    this.voices.forEach(({ osc, gain }) => {
      try {
        osc.stop();
      } catch {
        /* oscillator already stopped */
      }
      osc.disconnect();
      gain.disconnect();
    });
    this.voices = [];
  }

  private applyScene(scene: AudioScene): void {
    if (!this.ctx || !this.filter) return;
    const now = this.ctx.currentTime;
    this.filter.frequency.setTargetAtTime(scene.filterCutoff, now, 0.1);
    this.disposeVoices();
    for (const voice of scene.voices) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = voice.waveform;
      osc.frequency.value = voice.frequency;
      gain.gain.value = voice.gain;
      osc.connect(gain);
      gain.connect(this.filter);
      osc.start();
      this.voices.push({ osc, gain });
    }
  }
}
