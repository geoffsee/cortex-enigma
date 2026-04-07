import styled from 'styled-components';
import { CATEGORIES } from '../../data/categories';

type SelectionState = {
  [key: string]: string;
  foundation: string;
};

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
            return (
              <SelectionRow key={cat} $active={!!value}>
                <span className="label">{cat}</span>
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
  background: rgba(8, 8, 14, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-right: 1px solid rgba(160, 32, 240, 0.25);
  color: #e5e4e7;
  font-family: ui-monospace, Consolas, monospace;
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
    border-bottom: 1px solid rgba(160, 32, 240, 0.25);
  }
`;

const Header = styled.div`
  padding: 20px 22px 16px;
  border-bottom: 1px solid rgba(160, 32, 240, 0.18);
`;

const Brand = styled.h1`
  font-size: 13px;
  letter-spacing: 0.32em;
  color: #fff;
  margin: 0;
  font-weight: 600;
`;

const Tagline = styled.p`
  font-size: 9px;
  letter-spacing: 0.18em;
  color: #777;
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
    background: rgba(160, 32, 240, 0.3);
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
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(160, 32, 240, 0.25);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 11px;
  color: #fff;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: rgba(160, 32, 240, 0.6);
  }
`;

const GenerateButton = styled.button`
  background: rgba(160, 32, 240, 0.25);
  border: 1px solid rgba(160, 32, 240, 0.6);
  color: #fff;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: rgba(160, 32, 240, 0.4);
    border-color: rgba(160, 32, 240, 0.8);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4081;
  font-size: 10px;
  margin-top: 8px;
  padding: 4px 8px;
  background: rgba(255, 64, 129, 0.1);
  border: 1px solid rgba(255, 64, 129, 0.2);
  border-radius: 4px;
  line-height: 1.4;
`;

const LoadingProgress = styled.div`
  color: #c084fc;
  font-size: 9px;
  margin-top: 8px;
  padding: 4px 8px;
  background: rgba(160, 32, 240, 0.1);
  border: 1px solid rgba(160, 32, 240, 0.2);
  border-radius: 4px;
  line-height: 1.4;
  font-family: ui-monospace, Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-all;
`;

const SectionTitle = styled.h2`
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #c084fc;
  margin: 0 0 10px;
  font-weight: 600;
`;

const SelectionRow = styled.div<{ $active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 9px;
  border-radius: 3px;
  margin-bottom: 3px;
  background: ${({ $active }) => ($active ? 'rgba(160, 32, 240, 0.14)' : 'transparent')};
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(160, 32, 240, 0.4)' : 'rgba(255, 255, 255, 0.05)')};

  & .label {
    color: #888;
    font-size: 10px;
    letter-spacing: 0.08em;
  }

  & .value {
    color: ${({ $active }) => ($active ? '#fff' : '#444')};
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
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(160, 32, 240, 0.25);
  border-radius: 4px;
  padding: 12px;
  font-size: 11px;
  line-height: 1.6;
  color: ${({ $empty }) => ($empty ? '#555' : '#e5e4e7')};
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
  background: ${({ $primary }) =>
    $primary ? 'rgba(160, 32, 240, 0.25)' : 'rgba(255, 255, 255, 0.04)'};
  color: #fff;
  border: 1px solid
    ${({ $primary }) => ($primary ? 'rgba(160, 32, 240, 0.6)' : 'rgba(255, 255, 255, 0.1)')};

  &:hover:not(:disabled) {
    background: rgba(160, 32, 240, 0.4);
    border-color: rgba(160, 32, 240, 0.8);
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
  color: #ccc;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

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
  background: ${({ $on }) => ($on ? 'rgba(160, 32, 240, 0.6)' : 'rgba(255, 255, 255, 0.1)')};
  border: 1px solid
    ${({ $on }) => ($on ? 'rgba(160, 32, 240, 0.8)' : 'rgba(255, 255, 255, 0.15)')};
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
    background: #fff;
    transition: left 0.15s;
  }
`;

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #666;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 4px 0;
`;