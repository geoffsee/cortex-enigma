import type { ExpansionProfile } from '../../domain/expansionIntensity';

export interface ILLMPort {
  load(onProgress: (text: string) => void): Promise<void>;
  generateStream(
    foundation: string,
    profile: ExpansionProfile,
    onChunk: (partial: string) => void,
  ): Promise<string>;
}
