export interface ILLMPort {
  load(onProgress: (text: string) => void): Promise<void>;
  generate(foundation: string): Promise<string>;
}
