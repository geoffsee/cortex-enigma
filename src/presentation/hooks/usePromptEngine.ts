import { useState, useEffect, useRef } from 'react';
import { WebLLMAdapter } from '../../infrastructure/WebLLMAdapter';

export function usePromptEngine() {
  const adapterRef = useRef(new WebLLMAdapter());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [degradedMode, setDegradedMode] = useState(false);

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
        if (!cancelled) {
          setDegradedMode(false);
          setLoadProgress('Model ready');
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setDegradedMode(true);
          setError(`Model load failed, using local fallback expander: ${msg}`);
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
      setDegradedMode(true);
      setError(`Generation degraded to local fallback: ${msg}`);
      return buildFallbackExpansion(foundation);
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating, isModelLoading, loadProgress, error, degradedMode };
}

function buildFallbackExpansion(foundation: string) {
  const seed = foundation.trim();
  if (!seed) return '';
  return `cinematic ${seed}, volumetric lighting, high-detail textures, dramatic contrast, sharp focus`;
}
