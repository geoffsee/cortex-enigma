import type { ILLMPort } from '../application/ports/ILLMPort';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type MLCEngineLike = {
  chat: {
    completions: {
      create: (opts: {
        messages: ChatMessage[];
        max_tokens: number;
        temperature: number;
      }) => Promise<{ choices: Array<{ message: { content: string | null } }> }>;
    };
  };
};

const SYSTEM_PROMPT =
  "You are an expert AI image prompt engineer. Your task is to expand the user's foundation concept into a detailed and evocative image prompt. Include vivid adjectives, lighting details (e.g., 'volumetric lighting', 'dramatic chiaroscuro', 'sharp focus'), and high-quality textures. Only output the descriptive expansion. Keep it under 15 words.";

export class WebLLMAdapter implements ILLMPort {
  private engine: MLCEngineLike | null = null;

  async load(onProgress: (text: string) => void): Promise<void> {
    // Dynamic import keeps web-llm out of the SSR bundle.
    const webllm = await import('@mlc-ai/web-llm');
    this.engine = await webllm.CreateMLCEngine('Llama-3.2-1B-Instruct-q4f16_1-MLC', {
      initProgressCallback: (report) => onProgress(report.text),
    }) as unknown as MLCEngineLike;
  }

  async generate(foundation: string): Promise<string> {
    if (!this.engine) throw new Error('Engine not initialized');
    const reply = await this.engine.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: foundation },
      ],
      max_tokens: 30,
      temperature: 0.8,
    });
    const text = reply.choices[0].message.content?.trim() ?? '';
    return text.replace(/^,\s*/, '');
  }
}
