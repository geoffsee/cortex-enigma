import { useState, useRef, useMemo, useEffect, lazy, Suspense } from 'react';
import { buildPrompt, wordBoundaryDiff } from '../../../core';
import type { DiffSegment } from '../../../core';
import { renderPrompt } from '../../../domain/promptDialects';
import { useSelections } from '../../hooks/useSelections';
import { usePromptEngine } from '../../hooks/usePromptEngine';
import { usePromptHistory } from '../../hooks/usePromptHistory';
import { usePresetTemplates } from '../../hooks/usePresetTemplates';
import { useLockAxes } from '../../hooks/useLockAxes';
import { useExpansionIntensity } from '../../hooks/useExpansionIntensity';
import { useRandomizeBias } from '../../hooks/useRandomizeBias';
import { usePromptDialect } from '../../hooks/usePromptDialect';
import { EXPANSION_RECIPES, matchExpansionRecipe } from '../../../application/expansionRecipes';
import type { ExpansionRecipe } from '../../../application/expansionRecipes';
import Sidebar from './Sidebar';
import EdgePanels from './EdgePanels';
import PromptHistoryDrawer from './PromptHistoryDrawer';
import PresetPaletteDrawer from './PresetPaletteDrawer';
import ConfigTransferDrawer from './ConfigTransferDrawer';

const CortexCanvas = lazy(() => import('./Canvas/CortexCanvas'));

type ExpansionInfo = { base: string; expanded: string };

export default function CortexEnigma() {
  const { selections, handleSelect, handleFoundationChange, handleNegativeChange, randomize, clearAll, applySelections, getShareableUrl, mounted } = useSelections();
  const { generate, isGenerating, isModelLoading, loadProgress, error, streamingText, webGpuAvailable, llmBypassed, setLlmBypassed } = usePromptEngine();
  const { entries: historyEntries, addEntry: addHistoryEntry, clearHistory } = usePromptHistory();
  const { templates, saveTemplate, deleteTemplate } = usePresetTemplates();
  const { lockedAxes, toggleLock, lockedCount } = useLockAxes();
  const { intensity, setIntensity } = useExpansionIntensity();
  const { randomizeBias, setRandomizeBias } = useRandomizeBias();
  const { dialect, setDialect } = usePromptDialect();
  const handleRandomize = () =>
    randomize(lockedAxes, randomizeBias, historyEntries.map(e => e.prompt));
  const activeRecipeId = matchExpansionRecipe(intensity, randomizeBias)?.id ?? null;
  const handleSelectRecipe = (recipe: ExpansionRecipe) => {
    setIntensity(recipe.intensity);
    setRandomizeBias(recipe.bias);
  };
  const [autoRotate, setAutoRotate] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [diffEnabled, setDiffEnabled] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'idle' | 'copied' | 'unavailable'>('idle');
  const [expansionInfo, setExpansionInfo] = useState<ExpansionInfo | null>(null);
  const orbitRef = useRef<{ reset: () => void } | null>(null);
  const linkResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (linkResetRef.current) clearTimeout(linkResetRef.current);
  }, []);

  const prompt = useMemo(() => renderPrompt(selections, dialect), [selections, dialect]);

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
    const snapBase = buildPrompt(selections);
    const expansion = await generate(selections.foundation, intensity);
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

  const flashLinkStatus = (status: 'copied' | 'unavailable') => {
    setLinkStatus(status);
    if (linkResetRef.current) clearTimeout(linkResetRef.current);
    linkResetRef.current = setTimeout(() => setLinkStatus('idle'), 2000);
  };

  const handleCopyLink = () => {
    const url = getShareableUrl();
    if (!url) return;
    if (!navigator.clipboard) {
      flashLinkStatus('unavailable');
      return;
    }
    navigator.clipboard
      .writeText(url)
      .then(() => flashLinkStatus('copied'))
      .catch(() => flashLinkStatus('unavailable'));
  };

  const canToggleDiff = !llmBypassed && expansionInfo !== null;

  return (
    <>
      <Sidebar
        selections={selections}
        prompt={prompt}
        onSelect={handleSelect}
        onFoundationChange={handleFoundationInput}
        onNegativeChange={handleNegativeChange}
        isGenerating={isGenerating || isModelLoading}
        loadProgress={loadProgress}
        onGenerate={handleGenerate}
        error={error}
        onRandomize={handleRandomize}
        onClear={handleClearAll}
        onCopy={handleCopy}
        onCopyLink={handleCopyLink}
        linkStatus={linkStatus}
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
        lockedAxes={lockedAxes}
        onToggleLock={toggleLock}
        lockedCount={lockedCount}
        randomizeBias={randomizeBias}
        onToggleRandomizeBias={() => setRandomizeBias(b => (b === 'uniform' ? 'history' : 'uniform'))}
        webGpuAvailable={webGpuAvailable}
        llmBypassed={llmBypassed}
        onToggleLlmBypass={() => setLlmBypassed(v => !v)}
        intensity={intensity}
        onIntensityChange={setIntensity}
        recipes={EXPANSION_RECIPES}
        activeRecipeId={activeRecipeId}
        onSelectRecipe={handleSelectRecipe}
        dialect={dialect}
        onDialectChange={setDialect}
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
    </>
  );
}
