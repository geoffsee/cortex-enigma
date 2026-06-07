import styled from 'styled-components';
import { Lock, Unlock } from 'lucide-react';
import { CATEGORIES } from '../../../domain/categories';
import type { SelectionState } from '../../../domain/types';

type Props = {
  selections: SelectionState;
  prompt: string;
  onSelect: (cat: string, val: string) => void;
  onFoundationChange: (val: string) => void;
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
  lockedAxes?: ReadonlySet<string>;
  onToggleLock?: (axis: string) => void;
  lockedCount?: number;
};

export default function Sidebar({
  selections,
  prompt,
  onSelect,
  onFoundationChange,
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
  lockedAxes,
  onToggleLock,
  lockedCount = 0,
}: Props) {
  const categoryKeys = Object.keys(CATEGORIES);
  const activeCount = Object.values(selections).filter(Boolean).length;

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
              disabled={!selections.foundation || isGenerating}
            >
              {isGenerating ? '...' : 'GEN'}
            </GenerateButton>
          </InputGroup>
          {loadProgress && isGenerating && !error && (
            <LoadingProgress>{loadProgress}</LoadingProgress>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}
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
            {prompt || 'Select options to generate a prompt...'}
          </PromptBox>
        </Section>

        <Section>
          <SectionTitle>Actions</SectionTitle>
          <ButtonGrid>
            <Button $primary onClick={onRandomize} title={lockedCount > 0 ? `${lockedCount} axis${lockedCount === 1 ? '' : 'es'} locked` : undefined}>
              {lockedCount > 0 ? `Randomize (${lockedCount} locked)` : 'Randomize'}
            </Button>
            <Button onClick={onClear} disabled={activeCount === 0}>
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
          </ButtonGrid>
        </Section>

        <Section>
          <SectionTitle>View</SectionTitle>
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

const ToggleRow = styled.label`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.synth.textToggle};
  border-bottom: 1px solid ${({ theme }) => theme.synth.subtleBg};

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

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: ${({ theme }) => theme.synth.textFaint};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 4px 0;
`;
