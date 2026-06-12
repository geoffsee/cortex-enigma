import styled from 'styled-components';
import { Lock, MessageSquare, Unlock } from 'lucide-react';
import { CATEGORIES } from '../../../domain/categories';
import {
  DEFAULT_EXPANSION_INTENSITY,
  EXPANSION_INTENSITY_LABELS,
  EXPANSION_INTENSITY_MAX,
  EXPANSION_INTENSITY_MIN,
  type ExpansionIntensity,
} from '../../../domain/expansionIntensity';
import type { DiffSegment } from '../../../domain/promptDiff';
import type { SelectionState } from '../../../domain/types';
import type { RandomizeBias } from '../../../application/SelectionService';

const FEEDBACK_URL = `https://github.com/geoffsee/cortex-enigma/issues/new?${new URLSearchParams({
  title: '[Feedback] ',
  body: [
    '**What were you doing?**',
    '',
    '',
    '**What worked well / what got in the way?**',
    '',
    '',
    '**Which feature is this about?** (e.g. history, templates, axis locks, LLM expansion, diff view, sharing)',
    '',
  ].join('\n'),
}).toString()}`;

type Props = {
  selections: SelectionState;
  prompt: string;
  negativePrompt: string;
  onSelect: (cat: string, val: string) => void;
  onFoundationChange: (val: string) => void;
  onNegativeChange: (val: string) => void;
  onCopyNegative: () => void;
  onRandomize: () => void;
  onClear: () => void;
  onCopy: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  effectsEnabled: boolean;
  onToggleEffects: () => void;
  onResetCamera: () => void;
  isGenerating?: boolean;
  loadProgress?: string;
  onGenerate?: () => void;
  error?: string | null;
  historyCount?: number;
  onOpenHistory?: () => void;
  templateCount?: number;
  onOpenTemplates?: () => void;
  onOpenTransfer?: () => void;
  onOpenGallery?: () => void;
  lockedAxes?: ReadonlySet<string>;
  onToggleLock?: (axis: string) => void;
  lockedCount?: number;
  randomizeBias?: RandomizeBias;
  onToggleRandomizeBias?: () => void;
  webGpuAvailable?: boolean;
  llmBypassed?: boolean;
  onToggleLlmBypass?: () => void;
  intensity?: ExpansionIntensity;
  onIntensityChange?: (value: number) => void;
  diffEnabled?: boolean;
  onToggleDiff?: () => void;
  canToggleDiff?: boolean;
  diffSegments?: DiffSegment[] | null;
};

export default function Sidebar({
  selections,
  prompt,
  negativePrompt,
  onSelect,
  onFoundationChange,
  onNegativeChange,
  onCopyNegative,
  onRandomize,
  onClear,
  onCopy,
  autoRotate,
  onToggleAutoRotate,
  effectsEnabled,
  onToggleEffects,
  onResetCamera,
  isGenerating,
  loadProgress,
  onGenerate,
  error,
  historyCount = 0,
  onOpenHistory,
  templateCount = 0,
  onOpenTemplates,
  onOpenTransfer,
  onOpenGallery,
  lockedAxes,
  onToggleLock,
  lockedCount = 0,
  randomizeBias = 'uniform',
  onToggleRandomizeBias,
  webGpuAvailable = true,
  llmBypassed = false,
  onToggleLlmBypass,
  intensity = DEFAULT_EXPANSION_INTENSITY,
  onIntensityChange,
  diffEnabled = false,
  onToggleDiff,
  canToggleDiff = false,
  diffSegments,
}: Props) {
  const categoryKeys = Object.keys(CATEGORIES);
  const activeCount = categoryKeys.filter((cat) => selections[cat]).length;
  const hasAnyValue = Object.values(selections).some(Boolean);
  const dialEnabled = webGpuAvailable && !llmBypassed && !!onIntensityChange;
  const preserveActive = dialEnabled && intensity === 0;

  return (
    <Wrapper>
      <Header>
        <Brand>CORTEX ENIGMA</Brand>
        <Tagline>Generative Prompt Synth</Tagline>
      </Header>

      <ScrollArea>
        <Section>
          <SectionTitle>Foundation</SectionTitle>
          <InputGroup>
            <Input
              aria-label="Foundation concept"
              placeholder="Enter a foundation concept..."
              value={selections.foundation}
              onChange={(e) => onFoundationChange(e.target.value)}
            />
            <GenerateButton
              onClick={onGenerate}
              disabled={!selections.foundation || isGenerating || llmBypassed || !webGpuAvailable || preserveActive}
            >
              {isGenerating ? '...' : 'GEN'}
            </GenerateButton>
          </InputGroup>
          {onIntensityChange && (
            <IntensityGroup $disabled={!dialEnabled}>
              <IntensityHeader>
                <span>Expansion Intensity</span>
                <IntensityValue>{EXPANSION_INTENSITY_LABELS[intensity]}</IntensityValue>
              </IntensityHeader>
              <IntensitySlider
                type="range"
                min={EXPANSION_INTENSITY_MIN}
                max={EXPANSION_INTENSITY_MAX}
                step={1}
                value={intensity}
                disabled={!dialEnabled}
                onChange={(e) => onIntensityChange(Number(e.target.value))}
                aria-label="Expansion intensity"
                aria-valuetext={EXPANSION_INTENSITY_LABELS[intensity]}
              />
              <IntensityEnds>
                <span>Preserve</span>
                <span>Elaborate</span>
              </IntensityEnds>
            </IntensityGroup>
          )}
          {!webGpuAvailable && (
            <LlmStatusBadge $variant="unavailable">
              ⚠ LLM UNAVAILABLE — WEBGPU NOT SUPPORTED
            </LlmStatusBadge>
          )}
          {webGpuAvailable && llmBypassed && (
            <LlmStatusBadge $variant="bypassed">
              LLM EXPANSION BYPASSED
            </LlmStatusBadge>
          )}
          {preserveActive && (
            <LlmStatusBadge $variant="bypassed">
              EXPANSION PRESERVED — DIAL AT MINIMUM
            </LlmStatusBadge>
          )}
          {loadProgress && isGenerating && !error && (
            <LoadingProgress>{loadProgress}</LoadingProgress>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Section>

        <Section>
          <SectionTitle>Negative Prompt</SectionTitle>
          <Input
            aria-label="Negative prompt terms"
            placeholder="Terms to exclude (e.g. blurry, watermark)..."
            value={selections.negative}
            onChange={(e) => onNegativeChange(e.target.value)}
          />
        </Section>

        <Section>
          <SectionTitle>Active Selections</SectionTitle>
          {categoryKeys.map((cat) => {
            const value = selections[cat];
            const locked = lockedAxes?.has(cat) ?? false;
            return (
              <SelectionRow key={cat} $active={!!value} $locked={locked}>
                <span className="label">
                  {cat}
                  {onToggleLock && (
                    <LockBtn
                      type="button"
                      $locked={locked}
                      onClick={() => onToggleLock(cat)}
                      aria-label={locked ? `Unlock ${cat} axis` : `Lock ${cat} axis`}
                      title={locked ? `Unlock ${cat} axis` : `Lock ${cat} axis`}
                    >
                      {locked ? <Lock size={9} /> : <Unlock size={9} />}
                    </LockBtn>
                  )}
                </span>
                <span className="value">
                  {value || '—'}
                  {value && (
                    <button
                      type="button"
                      className="clear"
                      onClick={() => onSelect(cat, value)}
                      aria-label={`Clear ${cat}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              </SelectionRow>
            );
          })}
          <Stat>
            <span>Active</span>
            <span>
              {activeCount}/{categoryKeys.length}
            </span>
          </Stat>
        </Section>

        <Section>
          <SectionTitle>Generated Prompt</SectionTitle>
          <PromptBox $empty={!prompt}>
            {diffEnabled && diffSegments ? (
              diffSegments.map((seg, i) => (
                <span key={i} style={{ color: seg.added ? '#ff9944' : undefined }}>
                  {seg.text}
                </span>
              ))
            ) : (
              prompt || 'Select options to generate a prompt...'
            )}
          </PromptBox>
          {negativePrompt && (
            <>
              <NegativeLabel>Negative</NegativeLabel>
              <NegativePromptBox>{negativePrompt}</NegativePromptBox>
              <Button
                onClick={onCopyNegative}
                style={{ width: '100%', marginTop: 6 }}
              >
                Copy Negative
              </Button>
            </>
          )}
        </Section>

        <Section>
          <SectionTitle>Actions</SectionTitle>
          <ButtonGrid>
            <Button $primary onClick={onRandomize} title={lockedCount > 0 ? `${lockedCount} axis${lockedCount === 1 ? '' : 'es'} locked` : undefined}>
              {lockedCount > 0 ? `Randomize (${lockedCount} locked)` : 'Randomize'}
            </Button>
            <Button onClick={onClear} disabled={!hasAnyValue}>
              Clear All
            </Button>
            <Button onClick={onCopy} disabled={!prompt} style={{ gridColumn: 'span 2' }}>
              Copy to Clipboard
            </Button>
            <Button
              onClick={onOpenHistory}
              disabled={!onOpenHistory}
              style={{ gridColumn: 'span 2' }}
            >
              History{historyCount > 0 ? ` (${historyCount})` : ''}
            </Button>
            <Button
              onClick={onOpenTemplates}
              disabled={!onOpenTemplates}
              style={{ gridColumn: 'span 2' }}
            >
              Templates{templateCount > 0 ? ` (${templateCount})` : ''}
            </Button>
            <Button
              onClick={onOpenTransfer}
              disabled={!onOpenTransfer}
              style={{ gridColumn: 'span 2' }}
            >
              Export / Import
            </Button>
            <Button
              onClick={onOpenGallery}
              disabled={!onOpenGallery}
              style={{ gridColumn: 'span 2' }}
            >
              Gallery
            </Button>
          </ButtonGrid>
          {onToggleRandomizeBias && (
            <ToggleRow
              style={{ marginTop: 4 }}
              title={
                historyCount > 0
                  ? 'Weight randomize toward options that appear in your recent prompt history'
                  : 'Copy prompts to history to give this bias something to work from; until then it behaves like uniform random'
              }
            >
              <span>History Bias</span>
              <input
                type="checkbox"
                checked={randomizeBias === 'history'}
                onChange={onToggleRandomizeBias}
              />
              <Switch $on={randomizeBias === 'history'} />
            </ToggleRow>
          )}
        </Section>

        <Section>
          <SectionTitle>View</SectionTitle>
          <ToggleRow $disabled={!webGpuAvailable}>
            <span>LLM Expansion</span>
            <input
              type="checkbox"
              checked={webGpuAvailable && !llmBypassed}
              onChange={onToggleLlmBypass}
              disabled={!webGpuAvailable}
            />
            <Switch $on={webGpuAvailable && !llmBypassed} />
          </ToggleRow>
          <ToggleRow $disabled={!canToggleDiff}>
            <span>Expansion Diff</span>
            <input
              type="checkbox"
              checked={diffEnabled && canToggleDiff}
              onChange={onToggleDiff}
              disabled={!canToggleDiff}
            />
            <Switch $on={diffEnabled && canToggleDiff} />
          </ToggleRow>
          <ToggleRow>
            <span>Auto-Rotate</span>
            <input type="checkbox" checked={autoRotate} onChange={onToggleAutoRotate} />
            <Switch $on={autoRotate} />
          </ToggleRow>
          <ToggleRow>
            <span>Post-Processing</span>
            <input type="checkbox" checked={effectsEnabled} onChange={onToggleEffects} />
            <Switch $on={effectsEnabled} />
          </ToggleRow>
          <ButtonGrid style={{ marginTop: 10 }}>
            <Button onClick={onResetCamera} style={{ gridColumn: 'span 2' }}>
              Reset Camera
            </Button>
          </ButtonGrid>
        </Section>
      </ScrollArea>

      <Footer>
        <FeedbackLink
          href={FEEDBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Send feedback (opens GitHub issue form in a new tab)"
        >
          <MessageSquare size={10} aria-hidden="true" />
          Feedback
        </FeedbackLink>
      </Footer>
    </Wrapper>
  );
}

const Wrapper = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  background: ${({ theme }) => theme.synth.panelBg};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-right: 1px solid ${({ theme }) => theme.synth.accentBase};
  color: ${({ theme }) => theme.synth.textPrimary};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100vw;
    bottom: auto;
    height: 55vh;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.synth.accentBase};
  }
`;

const Header = styled.div`
  padding: 20px 22px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.synth.panelHeaderBorder};
`;

const Brand = styled.h1`
  font-size: 13px;
  letter-spacing: 0.32em;
  color: ${({ theme }) => theme.synth.white};
  margin: 0;
  font-weight: 600;
`;

const Tagline = styled.p`
  font-size: 9px;
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.synth.textDim};
  margin-top: 5px;
  text-transform: uppercase;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px 28px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.synth.scrollbarThumb};
    border-radius: 3px;
  }
`;

const Section = styled.section`
  margin-bottom: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.synth.inputBg};
  border: 1px solid ${({ theme }) => theme.synth.accentBase};
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 11px;
  color: ${({ theme }) => theme.synth.white};
  font-family: inherit;

  &:focus {
    border-color: ${({ theme }) => theme.synth.accentStrong};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.synth.accentStrong};
    outline-offset: 2px;
  }
`;

const GenerateButton = styled.button`
  background: ${({ theme }) => theme.synth.accentBase};
  border: 1px solid ${({ theme }) => theme.synth.accentStrong};
  color: ${({ theme }) => theme.synth.white};
  border-radius: 4px;
  padding: 0 10px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.synth.accentMed};
    border-color: ${({ theme }) => theme.synth.accentHover};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.synth.accentStrong};
    outline-offset: 2px;
  }
`;

const IntensityGroup = styled.div<{ $disabled?: boolean }>`
  margin-top: 10px;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
`;

const IntensityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.synth.textMuted};
  margin-bottom: 6px;
`;

const IntensityValue = styled.span`
  color: ${({ theme }) => theme.synth.accent};
  font-weight: 600;
`;

const IntensitySlider = styled.input`
  width: 100%;
  margin: 0;
  accent-color: ${({ theme }) => theme.synth.accentStrong};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.synth.accentStrong};
    outline-offset: 2px;
  }
`;

const IntensityEnds = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.synth.textFaint};
  margin-top: 2px;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.synth.errorColor};
  font-size: 10px;
  margin-top: 8px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.synth.errorBg};
  border: 1px solid ${({ theme }) => theme.synth.errorBorder};
  border-radius: 4px;
  line-height: 1.4;
`;

const LoadingProgress = styled.div`
  color: ${({ theme }) => theme.synth.accent};
  font-size: 9px;
  margin-top: 8px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.synth.accentSubtle};
  border: 1px solid ${({ theme }) => theme.synth.accentBorderLight};
  border-radius: 4px;
  line-height: 1.4;
  font-family: ${({ theme }) => theme.fonts.mono};
  white-space: pre-wrap;
  word-break: break-all;
`;

const SectionTitle = styled.h2`
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.synth.accent};
  margin: 0 0 10px;
  font-weight: 600;
`;

const SelectionRow = styled.div<{ $active?: boolean; $locked?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 9px;
  border-radius: 3px;
  margin-bottom: 3px;
  background: ${({ $active, $locked, theme }) =>
    $locked ? theme.synth.lockBg : $active ? theme.synth.accentActiveBg : 'transparent'};
  border: 1px solid
    ${({ $active, $locked, theme }) =>
      $locked ? theme.synth.lockBorder : $active ? theme.synth.accentMed : theme.synth.subtleBorder};

  & .label {
    color: ${({ theme }) => theme.synth.textMuted};
    font-size: 10px;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  & .value {
    color: ${({ $active, theme }) => ($active ? theme.synth.white : theme.synth.textInactive)};
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  & button.clear {
    background: none;
    border: none;
    color: ${({ theme }) => theme.synth.textMuted};
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    line-height: 1;
    width: 14px;
    height: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: ${({ theme }) => theme.synth.errorColor};
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.synth.accentStrong};
      outline-offset: 2px;
      border-radius: 2px;
    }
  }
`;

const LockBtn = styled.button<{ $locked?: boolean }>`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $locked, theme }) => ($locked ? theme.synth.lockIcon : theme.synth.textFaint)};
  transition: color 0.12s;
  line-height: 1;

  &:hover {
    color: ${({ $locked, theme }) => ($locked ? theme.synth.lockIconHover : theme.synth.textMuted)};
  }
`;

const PromptBox = styled.div<{ $empty?: boolean }>`
  background: ${({ theme }) => theme.synth.inputBg};
  border: 1px solid ${({ theme }) => theme.synth.accentBase};
  border-radius: 4px;
  padding: 12px;
  font-size: 11px;
  line-height: 1.6;
  color: ${({ $empty, theme }) => ($empty ? theme.synth.textEmpty : theme.synth.textPrimary)};
  font-style: ${({ $empty }) => ($empty ? 'italic' : 'normal')};
  min-height: 60px;
  word-break: break-word;
  white-space: pre-wrap;
`;

const NegativeLabel = styled.h3`
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.synth.errorColor};
  margin: 10px 0 6px;
  font-weight: 600;
`;

const NegativePromptBox = styled.div`
  background: ${({ theme }) => theme.synth.errorBg};
  border: 1px solid ${({ theme }) => theme.synth.errorBorder};
  border-radius: 4px;
  padding: 12px;
  font-size: 11px;
  line-height: 1.6;
  color: ${({ theme }) => theme.synth.textPrimary};
  word-break: break-word;
  white-space: pre-wrap;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 9px 10px;
  border-radius: 3px;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  background: ${({ $primary, theme }) => ($primary ? theme.synth.accentBase : theme.synth.subtleBg)};
  color: ${({ theme }) => theme.synth.white};
  border: 1px solid
    ${({ $primary, theme }) => ($primary ? theme.synth.accentStrong : theme.synth.subtleButtonBorder)};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.synth.accentMed};
    border-color: ${({ theme }) => theme.synth.accentHover};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.synth.accentStrong};
    outline-offset: 2px;
  }
`;

const LlmStatusBadge = styled.div<{ $variant: 'unavailable' | 'bypassed' }>`
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  line-height: 1.4;
  background: ${({ $variant, theme }) =>
    $variant === 'unavailable'
      ? 'rgba(255, 160, 0, 0.1)'
      : theme.synth.accentSubtle};
  color: ${({ $variant }) =>
    $variant === 'unavailable' ? '#ffa000' : '#c084fc'};
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'unavailable'
        ? 'rgba(255, 160, 0, 0.3)'
        : 'rgba(192, 132, 252, 0.3)'};
`;

const ToggleRow = styled.label<{ $disabled?: boolean }>`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  font-size: 11px;
  letter-spacing: 0.08em;
  color: ${({ $disabled, theme }) => ($disabled ? theme.synth.textInactive : theme.synth.textToggle)};
  border-bottom: 1px solid ${({ theme }) => theme.synth.subtleBg};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  &:last-of-type {
    border-bottom: none;
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.synth.accentStrong};
    outline-offset: 3px;
    border-radius: 3px;
  }

  & input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

const Switch = styled.span<{ $on?: boolean }>`
  width: 28px;
  height: 14px;
  border-radius: 7px;
  background: ${({ $on, theme }) => ($on ? theme.synth.accentStrong : theme.synth.subtleButtonBorder)};
  border: 1px solid
    ${({ $on, theme }) => ($on ? theme.synth.accentHover : theme.synth.subtleBorderLight)};
  position: relative;
  transition: all 0.15s;

  &::after {
    content: '';
    position: absolute;
    top: 1px;
    left: ${({ $on }) => ($on ? '14px' : '1px')};
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ theme }) => theme.synth.white};
    transition: left 0.15s;
  }
`;

const Footer = styled.footer`
  padding: 8px 22px;
  border-top: 1px solid ${({ theme }) => theme.synth.panelHeaderBorder};
  display: flex;
  justify-content: flex-end;
`;

const FeedbackLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  color: ${({ theme }) => theme.synth.textDim};
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.synth.accent};
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.synth.accentStrong};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: ${({ theme }) => theme.synth.textFaint};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 4px 0;
`;
