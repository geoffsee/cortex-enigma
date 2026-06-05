import type { ILLMPort } from '../application/ports/ILLMPort';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
type ChatCompletionChunk = { choices: Array<{ delta: { content: string | null } }> };

type MLCEngineLike = {
  chat: {
    completions: {
      create: (opts: {
        messages: ChatMessage[];
        max_tokens: number;
        temperature: number;
        stream?: boolean;
      }) => Promise<
        | { choices: Array<{ message: { content: string | null } }> }
        | AsyncIterable<ChatCompletionChunk>
      >;
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
    const result = await this.engine.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: foundation },
      ],
      max_tokens: 30,
      temperature: 0.8,
    });
    // stream is not passed, so result is the non-streaming response shape.
    const reply = result as { choices: Array<{ message: { content: string | null } }> };
    const text = reply.choices[0].message.content?.trim() ?? '';
    return text.replace(/^,\s*/, '');
  }

  async generateStream(foundation: string, onChunk: (partial: string) => void): Promise<string> {
    if (!this.engine) throw new Error('Engine not initialized');
    const result = await this.engine.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: foundation },
      ],
      max_tokens: 30,
      temperature: 0.8,
      stream: true,
    });
    let full = '';
    for await (const chunk of result as AsyncIterable<ChatCompletionChunk>) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (delta) {
        full += delta;
        onChunk(full.replace(/^,\s*/, ''));
      }
    }
    return full.replace(/^,\s*/, '');
  }
}
