import type { AudioScene } from '../../domain/generativeAudio';

export interface IAudioPort {
  isSupported(): boolean;
  start(scene: AudioScene): Promise<void>;
  update(scene: AudioScene): void;
  stop(): void;
}
