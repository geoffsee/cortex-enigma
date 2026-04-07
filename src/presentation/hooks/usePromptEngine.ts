import { useState, useEffect, useRef } from 'react';
import { WebLLMAdapter } from '../../infrastructure/WebLLMAdapter';

export function usePromptEngine() {
  const adapterRef = useRef(new WebLLMAdapter());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load the model on mount; no dependency on hydrated selections.
  useEffect(() => {
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
  }, []);

  const generate = async (foundation: string): Promise<string | null> => {
    if (!foundation) return null;
    setIsGenerating(true);
    setError(null);
    try {
      return await adapterRef.current.generate(foundation);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Generation failed: ${msg}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating, isModelLoading, loadProgress, error };
}
