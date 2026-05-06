import styled from 'styled-components';
import { CATEGORIES } from '../../../domain/categories';
import type { SelectionState } from '../../../domain/types';
import { DJ_CATEGORY_LABELS } from '../../../application/djCockpit';

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
  playheadEnabled: boolean;
  onTogglePlayhead: () => void;
  onResetCamera: () => void;
  isGenerating?: boolean;
  loadProgress?: string;
  onGenerate?: () => void;
  error?: string | null;
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
  playheadEnabled,
  onTogglePlayhead,
  onResetCamera,
  isGenerating,
  loadProgress,
  onGenerate,
  error,
}: Props) {
  const categoryKeys = Object.keys(CATEGORIES);
  const activeCount = categoryKeys.filter((cat) => selections[cat]).length;

  return (
    <Wrapper>
      <Header>
        <Brand>CORTEX·ENIGMA</Brand>
        <Tagline>AR DJ Copilot Interface</Tagline>
      </Header>

      <ScrollArea>
        <Section>
          <SectionTitle>Set Foundation</SectionTitle>
          <InputGroup>
            <Input
              placeholder="Describe crowd and vibe..."
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
            return (
              <SelectionRow key={cat} $active={!!value}>
                <span className="label">{DJ_CATEGORY_LABELS[cat] ?? cat}</span>
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
          <SectionTitle>Live Set Context</SectionTitle>
          <PromptBox $empty={!prompt}>
            {prompt || 'Select options to generate a prompt...'}
          </PromptBox>
        </Section>

        <Section>
          <SectionTitle>Actions</SectionTitle>
          <ButtonGrid>
            <Button $primary onClick={onRandomize}>
              Randomize
            </Button>
            <Button onClick={onClear} disabled={activeCount === 0}>
              Clear All
            </Button>
            <Button onClick={onCopy} disabled={!prompt} style={{ gridColumn: 'span 2' }}>
              Copy to Clipboard
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
            <Button
              type="button"
              $primary={playheadEnabled}
              aria-pressed={playheadEnabled}
              onClick={onTogglePlayhead}
              style={{ gridColumn: 'span 2' }}
            >
              Playhead {playheadEnabled ? 'On' : 'Off'}
            </Button>
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
  width: var(--ce-sidebar-width);
  background:
    linear-gradient(180deg, rgba(10, 8, 17, 0.96), rgba(4, 4, 10, 0.92)),
    radial-gradient(circle at 0 0, rgba(178, 77, 255, 0.2), transparent 38%),
    radial-gradient(circle at 100% 70%, rgba(75, 216, 255, 0.08), transparent 42%);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
  border-right: 1px solid var(--ce-border);
  box-shadow:
    18px 0 38px rgba(0, 0, 0, 0.46),
    inset -1px 0 0 rgba(216, 168, 255, 0.08);
  color: #e9ddf5;
  font-family: "Share Tech Mono", "Space Mono", "IBM Plex Mono", ui-monospace, Consolas, monospace;
  font-size: 12px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-align: left;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.025), transparent),
      repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.025) 0 1px, transparent 1px 4px);
    mix-blend-mode: screen;
    opacity: 0.36;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: -1px;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, transparent, var(--ce-purple), transparent);
    box-shadow: 0 0 18px rgba(178, 77, 255, 0.75);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: 100vw;
    bottom: auto;
    height: 50svh;
    border-right: none;
    border-bottom: 1px solid var(--ce-border);
  }
`;

const Header = styled.div`
  position: relative;
  padding: 22px 22px 18px;
  border-bottom: 1px solid rgba(178, 77, 255, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent),
    linear-gradient(90deg, rgba(178, 77, 255, 0.18), transparent 75%);

  &::before {
    content: '';
    position: absolute;
    left: 22px;
    right: 22px;
    bottom: -1px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--ce-purple), transparent);
    opacity: 0.8;
  }
`;

const Brand = styled.h1`
  font-size: 13px;
  line-height: 1;
  letter-spacing: 0.32em;
  color: #fff;
  margin: 0;
  font-weight: 700;
  text-shadow: 0 0 18px rgba(216, 168, 255, 0.35);
`;

const Tagline = styled.p`
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--ce-muted);
  margin-top: 12px;
  text-transform: uppercase;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px 30px;
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(178, 77, 255, 0.4);
    border-radius: 3px;
  }
`;

const Section = styled.section`
  margin-bottom: 22px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(0, 0, 0, 0.18)),
    rgba(2, 2, 8, 0.72);
  border: 1px solid rgba(178, 77, 255, 0.34);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 11px;
  color: #fff;
  font-family: inherit;
  box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.45);

  &:focus {
    outline: none;
    border-color: var(--ce-border-strong);
    box-shadow:
      inset 0 0 18px rgba(0, 0, 0, 0.45),
      0 0 0 1px rgba(178, 77, 255, 0.2),
      0 0 18px rgba(178, 77, 255, 0.16);
  }

  &::placeholder {
    color: rgba(216, 168, 255, 0.42);
  }
`;

const GenerateButton = styled.button`
  background:
    linear-gradient(180deg, rgba(216, 168, 255, 0.18), rgba(178, 77, 255, 0.2)),
    rgba(35, 9, 55, 0.8);
  border: 1px solid rgba(178, 77, 255, 0.6);
  color: #fff;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    background: rgba(178, 77, 255, 0.34);
    border-color: var(--ce-border-strong);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6aa8;
  font-size: 10px;
  margin-top: 8px;
  padding: 4px 8px;
  background: rgba(255, 64, 129, 0.1);
  border: 1px solid rgba(255, 64, 129, 0.2);
  border-radius: 4px;
  line-height: 1.4;
`;

const LoadingProgress = styled.div`
  color: var(--ce-purple-soft);
  font-size: 9px;
  margin-top: 8px;
  padding: 4px 8px;
  background: rgba(178, 77, 255, 0.1);
  border: 1px solid rgba(178, 77, 255, 0.24);
  border-radius: 4px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
`;

const SectionTitle = styled.h2`
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ce-purple-soft);
  margin: 0 0 10px;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 0 12px rgba(178, 77, 255, 0.34);
`;

const SelectionRow = styled.div<{ $active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  min-height: 37px;
  padding: 6px 9px;
  border-radius: 4px;
  margin-bottom: 4px;
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(90deg, rgba(178, 77, 255, 0.2), rgba(75, 216, 255, 0.05))'
      : 'rgba(255, 255, 255, 0.018)'};
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(178, 77, 255, 0.5)' : 'rgba(255, 255, 255, 0.055)')};

  & .label {
    color: ${({ $active }) => ($active ? '#d7c0e8' : '#817387')};
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  & .value {
    color: ${({ $active }) => ($active ? '#fff' : '#4c4352')};
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 42px;
    justify-content: flex-end;
    text-align: right;
  }

  & button.clear {
    background: none;
    border: none;
    color: #888;
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
      color: #ff4081;
    }
  }
`;

const PromptBox = styled.div<{ $empty?: boolean }>`
  background:
    linear-gradient(180deg, rgba(0, 32, 58, 0.32), rgba(3, 4, 12, 0.82)),
    rgba(0, 0, 0, 0.52);
  border: 1px solid ${({ $empty }) => ($empty ? 'rgba(178, 77, 255, 0.24)' : 'rgba(75, 216, 255, 0.38)')};
  border-radius: 4px;
  padding: 12px;
  font-size: 11px;
  line-height: 1.6;
  color: ${({ $empty }) => ($empty ? '#63576b' : '#d7f3ff')};
  font-style: ${({ $empty }) => ($empty ? 'italic' : 'normal')};
  min-height: 60px;
  word-break: break-word;
  white-space: pre-wrap;
  text-align: center;
  box-shadow:
    inset 0 0 24px rgba(0, 77, 128, 0.18),
    0 0 20px rgba(0, 0, 0, 0.28);
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 9px 10px;
  border-radius: 4px;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.15s, border-color 0.15s, background 0.15s, opacity 0.15s;
  background: ${({ $primary }) =>
    $primary
      ? 'linear-gradient(180deg, rgba(216, 168, 255, 0.18), rgba(178, 77, 255, 0.32))'
      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015))'};
  color: #fff;
  border: 1px solid
    ${({ $primary }) => ($primary ? 'rgba(178, 77, 255, 0.68)' : 'rgba(255, 255, 255, 0.12)')};

  &:hover:not(:disabled) {
    background: rgba(178, 77, 255, 0.34);
    border-color: var(--ce-border-strong);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ToggleRow = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #d8cce2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.055);

  &:last-of-type {
    border-bottom: none;
  }

  & input {
    display: none;
  }
`;

const Switch = styled.span<{ $on?: boolean }>`
  width: 28px;
  height: 14px;
  border-radius: 7px;
  background: ${({ $on }) => ($on ? 'rgba(178, 77, 255, 0.65)' : 'rgba(255, 255, 255, 0.1)')};
  border: 1px solid
    ${({ $on }) => ($on ? 'rgba(216, 168, 255, 0.8)' : 'rgba(255, 255, 255, 0.16)')};
  position: relative;
  transition: all 0.15s;
  box-shadow: ${({ $on }) => ($on ? '0 0 12px rgba(178, 77, 255, 0.42)' : 'none')};

  &::after {
    content: '';
    position: absolute;
    top: 1px;
    left: ${({ $on }) => ($on ? '14px' : '1px')};
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ $on }) => ($on ? '#fff' : '#c8c1cf')};
    transition: left 0.15s;
  }
`;

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: var(--ce-muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 4px 0;
`;
