import { useState, useRef, useMemo, lazy, Suspense } from 'react';
import { buildPrompt } from '../../../domain/promptBuilder';
import { useSelections } from '../../hooks/useSelections';
import { usePromptEngine } from '../../hooks/usePromptEngine';
import { usePromptHistory } from '../../hooks/usePromptHistory';
import Sidebar from './Sidebar';
import EdgePanels from './EdgePanels';
import PromptHistoryDrawer from './PromptHistoryDrawer';

const CortexCanvas = lazy(() => import('./Canvas/CortexCanvas'));

export default function CortexEnigma() {
  const { selections, handleSelect, handleFoundationChange, randomize, clearAll, mounted } = useSelections();
  const { generate, isGenerating, isModelLoading, loadProgress, error } = usePromptEngine();
  const { entries: historyEntries, addEntry: addHistoryEntry, clearHistory } = usePromptHistory();
  const [autoRotate, setAutoRotate] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const orbitRef = useRef<{ reset: () => void } | null>(null);

  const prompt = useMemo(() => buildPrompt(selections), [selections]);

  const handleGenerate = async () => {
    const expansion = await generate(selections.foundation);
    if (expansion) {
      handleFoundationChange(`${selections.foundation}, ${expansion}`);
    }
  };

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    addHistoryEntry(prompt);
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
        onCopy={handleCopy}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(v => !v)}
        effectsEnabled={effectsEnabled}
        onToggleEffects={() => setEffectsEnabled(v => !v)}
        onResetCamera={() => orbitRef.current?.reset()}
        historyCount={historyEntries.length}
        onOpenHistory={() => setHistoryOpen(true)}
      />
      <EdgePanels selections={selections} onSelect={handleSelect} />
      {mounted && (
        <Suspense fallback={null}>
          <CortexCanvas
            selections={selections}
            onSelect={handleSelect}
            prompt={prompt}
            onRandomize={randomize}
            onCopy={handleCopy}
            autoRotate={autoRotate}
            effectsEnabled={effectsEnabled}
            orbitRef={orbitRef}
          />
        </Suspense>
      )}
      {historyOpen && (
        <PromptHistoryDrawer
          entries={historyEntries}
          onClear={clearHistory}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </>
  );
}
