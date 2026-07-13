import { useState, useEffect, useRef } from 'react';
import { WebLLMAdapter } from '../../infrastructure/WebLLMAdapter';
import { expansionProfile, type ExpansionIntensity } from '../../core';

export function usePromptEngine() {
  const adapterRef = useRef(new WebLLMAdapter());
  const gpuAvailable = WebLLMAdapter.isWebGPUAvailable();
  const [webGpuAvailable] = useState(gpuAvailable);
  const [llmBypassed, setLlmBypassed] = useState(!gpuAvailable);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState<string | null>(null);

  useEffect(() => {
    if (!webGpuAvailable) return;
    let cancelled = false;
    const loadModel = async () => {
      setIsModelLoading(true);
      setError(null);
      try {
        await adapterRef.current.load((text) => {
          if (!cancelled) setLoadProgress(text);
        });
        console.log('Model loaded');
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setError(`Failed to load model: ${msg}`);
        }
      } finally {
        if (!cancelled) setIsModelLoading(false);
      }
    };
    loadModel();
    return () => { cancelled = true; };
  }, [webGpuAvailable]);

  const generate = async (foundation: string, intensity: ExpansionIntensity): Promise<string | null> => {
    if (llmBypassed || !webGpuAvailable || !foundation) return null;
    const profile = expansionProfile(intensity);
    if (!profile) return null; // preserve: skip expansion entirely, same as skip mode
    setIsGenerating(true);
    setError(null);
    setStreamingText('');
    try {
      const result = await adapterRef.current.generateStream(foundation, profile, (partial) => {
        setStreamingText(partial);
      });
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Generation failed: ${msg}`);
      return null;
    } finally {
      setIsGenerating(false);
      setStreamingText(null);
    }
  };

  return {
    generate,
    isGenerating,
    isModelLoading,
    loadProgress,
    error,
    streamingText,
    webGpuAvailable,
    llmBypassed,
    setLlmBypassed,
  };
}
