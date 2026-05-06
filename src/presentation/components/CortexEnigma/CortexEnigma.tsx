import { useState, useRef, useMemo, lazy, Suspense } from 'react';
import { buildPrompt } from '../../../domain/promptBuilder';
import { deriveDJTelemetry } from '../../../application/djCockpit';
import { useSelections } from '../../hooks/useSelections';
import { usePromptEngine } from '../../hooks/usePromptEngine';
import Sidebar from './Sidebar';
import EdgePanels from './EdgePanels';

const CortexCanvas = lazy(() => import('./Canvas/CortexCanvas'));

export default function CortexEnigma() {
  const { selections, handleSelect, handleFoundationChange, randomize, clearAll, mounted } = useSelections();
  const { generate, isGenerating, isModelLoading, loadProgress, error } = usePromptEngine();
  const [autoRotate, setAutoRotate] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(false);
  const [playheadEnabled, setPlayheadEnabled] = useState(true);
  const orbitRef = useRef<{ reset: () => void } | null>(null);

  const telemetry = useMemo(() => deriveDJTelemetry(selections), [selections]);
  const djRichContext = useMemo(
    () =>
      `objective=${telemetry.objective}; intent=${telemetry.transitionIntent}; heat=${telemetry.crowdHeat}/5; risk=${telemetry.risk}/5; fatigue=${telemetry.dropFatigue}/5`,
    [telemetry]
  );
  const prompt = useMemo(() => buildPrompt(selections, djRichContext), [selections, djRichContext]);

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
        playheadEnabled={playheadEnabled}
        onTogglePlayhead={() => setPlayheadEnabled(v => !v)}
        onResetCamera={() => orbitRef.current?.reset()}
      />
      <EdgePanels selections={selections} onSelect={handleSelect} telemetry={telemetry} playheadEnabled={playheadEnabled} />
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
            telemetry={telemetry}
          />
        </Suspense>
      )}
    </>
  );
}
