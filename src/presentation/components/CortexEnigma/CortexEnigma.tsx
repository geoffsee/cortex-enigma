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
import { useOnboarding } from '../../hooks/useOnboarding';
import { usePromptGallery } from '../../hooks/usePromptGallery';
import type { GalleryEntry } from '../../../infrastructure/storageSchema';
import { useAnalytics } from '../../hooks/useAnalytics';
import { EXPANSION_RECIPES, matchExpansionRecipe } from '../../../application/expansionRecipes';
import type { ExpansionRecipe } from '../../../application/expansionRecipes';
import { ANALYTICS_EVENTS } from '../../../core';
import Sidebar from './Sidebar';
import EdgePanels from './EdgePanels';
import PromptHistoryDrawer from './PromptHistoryDrawer';
import PresetPaletteDrawer from './PresetPaletteDrawer';
import ConfigTransferDrawer from './ConfigTransferDrawer';
import PromptSweepPanel from './PromptSweepPanel';
import OnboardingGuide from './OnboardingGuide';
import SessionStudioPanel from './SessionStudioPanel';
import PromptGalleryDrawer from './PromptGalleryDrawer';
import AnalyticsConsentBanner from './AnalyticsConsentBanner';

const CortexCanvas = lazy(() => import('./Canvas/CortexCanvas'));

type ExpansionInfo = { base: string; expanded: string };

export default function CortexEnigma() {
  const { dialect, setDialect } = usePromptDialect();
  const { selections, handleSelect, handleFoundationChange, handleNegativeChange, randomize, clearAll, applySelections, getShareableUrl, mounted } = useSelections(dialect, setDialect);
  const { generate, isGenerating, isModelLoading, loadProgress, error, streamingText, webGpuAvailable, llmBypassed, setLlmBypassed } = usePromptEngine();
  const { entries: historyEntries, addEntry: addHistoryEntry, clearHistory } = usePromptHistory();
  const { templates, saveTemplate, deleteTemplate } = usePresetTemplates();
  const { lockedAxes, toggleLock, lockedCount } = useLockAxes();
  const { intensity, setIntensity } = useExpansionIntensity();
  const { randomizeBias, setRandomizeBias } = useRandomizeBias();
  const { onboardingVisible, dismissOnboarding } = useOnboarding();
  const { entries: galleryEntries, publish: publishToGallery, deleteEntry: deleteGalleryEntry } = usePromptGallery();
  const { consent, setConsent, capture, mounted: analyticsMounted } = useAnalytics();
  const handleSelectTracked = (category: string, value: string) => {
    capture(ANALYTICS_EVENTS.axisSelect);
    handleSelect(category, value);
  };
  const handleRandomize = () => {
    capture(ANALYTICS_EVENTS.randomize);
    randomize(lockedAxes, randomizeBias, historyEntries.map(e => e.prompt));
  };
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
  const [sweepOpen, setSweepOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [remixSource, setRemixSource] = useState<GalleryEntry | null>(null);
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
      capture(ANALYTICS_EVENTS.expand);
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
    setRemixSource(null);
    clearAll();
  };

  const handlePublish = (title: string, author: string) => {
    publishToGallery({ title, author, selections, dialect, source: remixSource });
  };

  const handleRemix = (entry: GalleryEntry) => {
    applySelections(entry.selections);
    setDialect(entry.dialect);
    setRemixSource(entry);
  };

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard
      .writeText(prompt)
      .then(() => capture(ANALYTICS_EVENTS.copyPrompt))
      .catch(() => { /* permission denied */ });
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
      .then(() => {
        capture(ANALYTICS_EVENTS.share);
        flashLinkStatus('copied');
      })
      .catch(() => flashLinkStatus('unavailable'));
  };

  const canToggleDiff = !llmBypassed && expansionInfo !== null;

  return (
    <>
      <Sidebar
        selections={selections}
        prompt={prompt}
        onSelect={handleSelectTracked}
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
        onOpenSweep={() => setSweepOpen(true)}
        onOpenSession={() => setSessionOpen(true)}
        galleryCount={galleryEntries.length}
        onOpenGallery={() => setGalleryOpen(true)}
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
      <EdgePanels selections={selections} onSelect={handleSelectTracked} lockedAxes={lockedAxes} onToggleLock={toggleLock} />
      {mounted && (
        <Suspense fallback={null}>
          <CortexCanvas
            selections={selections}
            onSelect={handleSelectTracked}
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
          dialect={dialect}
          onImport={(importedSelections, importedDialect) => {
            applySelections(importedSelections);
            setDialect(importedDialect);
            setRemixSource(null);
          }}
          onClose={() => setTransferOpen(false)}
        />
      )}
      {sweepOpen && (
        <PromptSweepPanel
          selections={selections}
          onClose={() => setSweepOpen(false)}
        />
      )}
      {sessionOpen && (
        <SessionStudioPanel
          selections={selections}
          prompt={prompt}
          onClose={() => setSessionOpen(false)}
        />
      )}
      {galleryOpen && (
        <PromptGalleryDrawer
          entries={galleryEntries}
          currentSelections={selections}
          currentDialect={dialect}
          remixSource={remixSource}
          onPublish={handlePublish}
          onRemix={handleRemix}
          onDelete={deleteGalleryEntry}
          onClose={() => setGalleryOpen(false)}
        />
      )}
      {analyticsMounted && consent === 'unset' && (
        <AnalyticsConsentBanner
          onEnable={() => setConsent('granted')}
          onDecline={() => setConsent('denied')}
        />
      )}
      {onboardingVisible && <OnboardingGuide onDismiss={dismissOnboarding} />}
    </>
  );
}
