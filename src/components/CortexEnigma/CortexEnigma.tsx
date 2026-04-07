import { useState, useRef, useMemo, useEffect, lazy, Suspense } from 'react';
import { CATEGORIES } from '../../data/categories';
import Sidebar from './Sidebar';
import EdgePanels from './EdgePanels';

// Lazy-load the WebGL canvas so its three.js / drei imports never run during SSR.
const CortexCanvas = lazy(() => import('./CortexCanvas'));

interface SelectionState {
  [key: string]: string;
  foundation: string;
}

const STORAGE_KEY = 'cortex-twister:selections-v2';

const EMPTY_SELECTIONS: SelectionState = {
  MEDIUM: "", METHOD: "", SUBJECT: "", STYLE: "",
  ELEMENTS: "", FUNCTION: "", CONTEXT: "", HISTORY: "",
  foundation: "",
};

function loadStoredSelections(): SelectionState {
  if (typeof window === 'undefined') return { ...EMPTY_SELECTIONS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_SELECTIONS };
    const parsed = JSON.parse(raw);
    const result: SelectionState = { ...EMPTY_SELECTIONS };
    for (const key of Object.keys(EMPTY_SELECTIONS)) {
      const value = parsed?.[key];
      if (typeof value === 'string') {
        if (key === 'foundation') {
          result[key] = value;
        } else if (value === '' || CATEGORIES[key]?.includes(value)) {
          result[key] = value;
        }
      }
    }
    return result;
  } catch {
    return { ...EMPTY_SELECTIONS };
  }
}

// Minimal type for the engine — keeps webllm out of the SSR bundle.
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

export default function CortexEnigma() {
  // Always start with empty selections so SSR and the first client render match.
  const [selections, setSelections] = useState<SelectionState>(() => ({ ...EMPTY_SELECTIONS }));
  const [mounted, setMounted] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const orbitRef = useRef<{ reset: () => void } | null>(null);

  // Hydrate selections from localStorage and flag client-only sections as ready.
  useEffect(() => {
    setSelections(loadStoredSelections());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [selections, mounted]);

  const prompt = useMemo(() => {
    const parts = [
      selections.foundation,
      selections.MEDIUM,
      selections.SUBJECT,
      selections.STYLE,
      selections.ELEMENTS,
      selections.HISTORY,
      selections.FUNCTION,
      selections.METHOD ? `made via ${selections.METHOD}` : "",
      selections.CONTEXT ? `in a ${selections.CONTEXT} context` : "",
    ].filter(Boolean);

    return parts.join(", ");
  }, [selections]);

  const handleSelect = (category: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value
    }));
  };

  const randomize = () => {
    const newSelections: SelectionState = { ...EMPTY_SELECTIONS };
    Object.keys(CATEGORIES).forEach(cat => {
      const options = CATEGORIES[cat];
      newSelections[cat] = options[Math.floor(Math.random() * options.length)];
    });
    setSelections(newSelections);
  };

  const clearAll = () => {
    setSelections({ ...EMPTY_SELECTIONS });
  };

  const copyToClipboard = () => {
    if (prompt) navigator.clipboard.writeText(prompt);
  };

  const resetCamera = () => {
    orbitRef.current?.reset();
  };

  const handleFoundationChange = (value: string) => {
    setSelections(prev => ({ ...prev, foundation: value }));
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<MLCEngineLike | null>(null);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    const loadModel = async () => {
      if (engineRef.current) return;
      setIsModelLoading(true);
      setError(null);
      try {
        // Dynamic import keeps web-llm out of the SSR bundle.
        const webllm = await import('@mlc-ai/web-llm');
        if (cancelled) return;
        const selectedModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
        engineRef.current = await webllm.CreateMLCEngine(selectedModel, {
          initProgressCallback: (report) => {
            if (!cancelled) setLoadProgress(report.text);
          },
        }) as unknown as MLCEngineLike;
        console.log("Model loaded");
      } catch (err: unknown) {
        console.error("Failed to load model:", err);
        const msg = err instanceof Error ? err.message : 'Unknown error';
        if (!cancelled) setError(`Failed to load model: ${msg}`);
      } finally {
        if (!cancelled) setIsModelLoading(false);
      }
    };
    loadModel();
    return () => { cancelled = true; };
  }, [mounted]);

  const handleGenerate = async () => {
    if (!selections.foundation || !engineRef.current) return;
    setIsGenerating(true);
    setError(null);
    try {
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: "You are an expert AI image prompt engineer. Your task is to expand the user's foundation concept into a detailed and evocative image prompt. Include vivid adjectives, lighting details (e.g., 'volumetric lighting', 'dramatic chiaroscuro', 'sharp focus'), and high-quality textures. Only output the descriptive expansion. Keep it under 15 words."
        },
        { role: "user", content: selections.foundation },
      ];

      const reply = await engineRef.current.chat.completions.create({
        messages,
        max_tokens: 30,
        temperature: 0.8,
      });

      const newFoundation = reply.choices[0].message.content?.trim();
      if (newFoundation) {
        const cleanedExpansion = newFoundation.replace(/^,\s*/, '');
        setSelections(prev => ({ ...prev, foundation: `${prev.foundation}, ${cleanedExpansion}` }));
      }
    } catch (err: unknown) {
      console.error("Generation failed:", err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Generation failed: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Sidebar
        selections={selections}
        prompt={prompt}
        onSelect={handleSelect}
        onFoundationChange={handleFoundationChange}
        isGenerating={isGenerating || isModelLoading}
        loadProgress={loadProgress}
        onGenerate={handleGenerate}
        error={error}
        onRandomize={randomize}
        onClear={clearAll}
        onCopy={copyToClipboard}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(v => !v)}
        effectsEnabled={effectsEnabled}
        onToggleEffects={() => setEffectsEnabled(v => !v)}
        onResetCamera={resetCamera}
      />
      <EdgePanels selections={selections} onSelect={handleSelect} />
      {mounted && (
        <Suspense fallback={null}>
          <CortexCanvas
            selections={selections}
            onSelect={handleSelect}
            prompt={prompt}
            onRandomize={randomize}
            onCopy={copyToClipboard}
            autoRotate={autoRotate}
            effectsEnabled={effectsEnabled}
            orbitRef={orbitRef}
          />
        </Suspense>
      )}
    </>
  );
}