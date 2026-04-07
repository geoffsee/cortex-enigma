import { useState, useRef, useMemo, lazy, Suspense } from 'react';
import { buildPrompt } from '../../../domain/promptBuilder';
import { useSelections } from '../../hooks/useSelections';
import { usePromptEngine } from '../../hooks/usePromptEngine';
import Sidebar from './Sidebar';
import EdgePanels from './EdgePanels';

const CortexCanvas = lazy(() => import('./Canvas/CortexCanvas'));

export default function CortexEnigma() {
  const { selections, handleSelect, handleFoundationChange, randomize, clearAll, mounted } = useSelections();
  const { generate, isGenerating, isModelLoading, loadProgress, error } = usePromptEngine();
  const [autoRotate, setAutoRotate] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const orbitRef = useRef<{ reset: () => void } | null>(null);

  const prompt = useMemo(() => buildPrompt(selections), [selections]);

  const copyToClipboard = () => {
    if (prompt) navigator.clipboard.writeText(prompt);
  };

  const handleGenerate = async () => {
    const expansion = await generate(selections.foundation);
    if (expansion) {
      handleFoundationChange(`${selections.foundation}, ${expansion}`);
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
        onResetCamera={() => orbitRef.current?.reset()}
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
