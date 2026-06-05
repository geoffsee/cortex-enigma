export interface ILLMPort {
  load(onProgress: (text: string) => void): Promise<void>;
  generate(foundation: string): Promise<string>;
  generateStream(foundation: string, onChunk: (partial: string) => void): Promise<string>;
}
