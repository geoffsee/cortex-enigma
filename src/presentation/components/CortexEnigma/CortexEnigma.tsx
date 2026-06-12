import { useState, useRef, useMemo, lazy, Suspense } from 'react';
import { buildPrompt, buildNegativePrompt } from '../../../domain/promptBuilder';
import { wordBoundaryDiff } from '../../../domain/promptDiff';
import type { DiffSegment } from '../../../domain/promptDiff';
import { useSelections } from '../../hooks/useSelections';
import { usePromptEngine } from '../../hooks/usePromptEngine';
import { usePromptHistory } from '../../hooks/usePromptHistory';
import { usePresetTemplates } from '../../hooks/usePresetTemplates';
import { useLockAxes } from '../../hooks/useLockAxes';
import type { RandomizeBias } from '../../../application/SelectionService';
import Sidebar from './Sidebar';
import EdgePanels from './EdgePanels';
import PromptHistoryDrawer from './PromptHistoryDrawer';
import PresetPaletteDrawer from './PresetPaletteDrawer';
import ConfigTransferDrawer from './ConfigTransferDrawer';
import PromptGalleryDrawer from './PromptGalleryDrawer';
import { loadGalleryEntries } from '../../../infrastructure/gallery';

const CortexCanvas = lazy(() => import('./Canvas/CortexCanvas'));

const GALLERY_ENTRIES = loadGalleryEntries();

type ExpansionInfo = { base: string; expanded: string };

export default function CortexEnigma() {
  const { selections, handleSelect, handleFoundationChange, handleNegativeChange, randomize, clearAll, applySelections, mounted } = useSelections();
  const { generate, isGenerating, isModelLoading, loadProgress, error, streamingText, webGpuAvailable, llmBypassed, setLlmBypassed } = usePromptEngine();
  const { entries: historyEntries, addEntry: addHistoryEntry, clearHistory } = usePromptHistory();
  const { templates, saveTemplate, deleteTemplate } = usePresetTemplates();
  const { lockedAxes, toggleLock, lockedCount } = useLockAxes();
  const [randomizeBias, setRandomizeBias] = useState<RandomizeBias>('uniform');
  const handleRandomize = () =>
    randomize(lockedAxes, randomizeBias, historyEntries.map(e => e.prompt));
  const [autoRotate, setAutoRotate] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [diffEnabled, setDiffEnabled] = useState(false);
  const [expansionInfo, setExpansionInfo] = useState<ExpansionInfo | null>(null);
  const orbitRef = useRef<{ reset: () => void } | null>(null);

  const prompt = useMemo(() => buildPrompt(selections), [selections]);
  const negativePrompt = useMemo(() => buildNegativePrompt(selections), [selections]);

  const displayPrompt = useMemo(() => {
    if (!llmBypassed && isModelLoading) return 'LOADING MODEL...';
    if (streamingText !== null) {
      if (!streamingText) return 'GENERATING...';
      return selections.foundation ? `${selections.foundation}, ${streamingText}` : streamingText;
    }
    return prompt;
  }, [llmBypassed, isModelLoading, streamingText, selections.foundation, prompt]);

  const diffSegments = useMemo((): DiffSegment[] | null => {
    if (!diffEnabled || llmBypassed || !expansionInfo) return null;
    return wordBoundaryDiff(expansionInfo.base, expansionInfo.expanded);
  }, [diffEnabled, llmBypassed, expansionInfo]);

  const handleGenerate = async () => {
    const snapBase = prompt;
    const expansion = await generate(selections.foundation);
    if (expansion) {
      const newFoundation = `${selections.foundation}, ${expansion}`;
      handleFoundationChange(newFoundation);
      const expandedPrompt = buildPrompt({ ...selections, foundation: newFoundation });
      setExpansionInfo({ base: snapBase, expanded: expandedPrompt });
    }
  };

  const handleFoundationInput = (val: string) => {
    setExpansionInfo(null);
    handleFoundationChange(val);
  };

  const handleClearAll = () => {
    setExpansionInfo(null);
    clearAll();
  };

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt).catch(() => { /* permission denied */ });
    addHistoryEntry(prompt);
  };

  const handleCopyNegative = () => {
    if (!negativePrompt) return;
    navigator.clipboard.writeText(negativePrompt).catch(() => { /* permission denied */ });
  };

  const canToggleDiff = !llmBypassed && expansionInfo !== null;

  return (
    <>
      <Sidebar
        selections={selections}
        prompt={prompt}
        onSelect={handleSelect}
        onFoundationChange={handleFoundationInput}
        negativePrompt={negativePrompt}
        onNegativeChange={handleNegativeChange}
        onCopyNegative={handleCopyNegative}
        isGenerating={isGenerating || isModelLoading}
        loadProgress={loadProgress}
        onGenerate={handleGenerate}
        error={error}
        onRandomize={handleRandomize}
        onClear={handleClearAll}
        onCopy={handleCopy}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(v => !v)}
        effectsEnabled={effectsEnabled}
        onToggleEffects={() => setEffectsEnabled(v => !v)}
        onResetCamera={() => orbitRef.current?.reset()}
        historyCount={historyEntries.length}
        onOpenHistory={() => setHistoryOpen(true)}
        templateCount={templates.length}
        onOpenTemplates={() => setTemplatesOpen(true)}
        onOpenTransfer={() => setTransferOpen(true)}
        onOpenGallery={() => setGalleryOpen(true)}
        lockedAxes={lockedAxes}
        onToggleLock={toggleLock}
        lockedCount={lockedCount}
        randomizeBias={randomizeBias}
        onToggleRandomizeBias={() => setRandomizeBias(b => (b === 'uniform' ? 'history' : 'uniform'))}
        webGpuAvailable={webGpuAvailable}
        llmBypassed={llmBypassed}
        onToggleLlmBypass={() => setLlmBypassed(v => !v)}
        diffEnabled={diffEnabled}
        onToggleDiff={() => setDiffEnabled(v => !v)}
        canToggleDiff={canToggleDiff}
        diffSegments={diffSegments}
      />
      <EdgePanels selections={selections} onSelect={handleSelect} lockedAxes={lockedAxes} onToggleLock={toggleLock} />
      {mounted && (
        <Suspense fallback={null}>
          <CortexCanvas
            selections={selections}
            onSelect={handleSelect}
            prompt={displayPrompt}
            onRandomize={handleRandomize}
            onCopy={handleCopy}
            autoRotate={autoRotate}
            effectsEnabled={effectsEnabled}
            orbitRef={orbitRef}
            diffEnabled={diffEnabled}
            onToggleDiff={() => setDiffEnabled(v => !v)}
            diffSegments={diffSegments}
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
      {templatesOpen && (
        <PresetPaletteDrawer
          templates={templates}
          currentSelections={selections}
          onSave={name => saveTemplate(name, selections)}
          onApply={template => applySelections(template.selections)}
          onDelete={deleteTemplate}
          onClose={() => setTemplatesOpen(false)}
        />
      )}
      {transferOpen && (
        <ConfigTransferDrawer
          selections={selections}
          onImport={applySelections}
          onClose={() => setTransferOpen(false)}
        />
      )}
      {galleryOpen && (
        <PromptGalleryDrawer
          entries={GALLERY_ENTRIES}
          onApply={applySelections}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
}
