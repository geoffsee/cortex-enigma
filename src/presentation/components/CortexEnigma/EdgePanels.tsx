import styled from 'styled-components';
import { CATEGORIES } from '../../../domain/categories';
import type { SelectionState } from '../../../domain/types';

type Props = {
  selections: SelectionState;
  onSelect: (cat: string, val: string) => void;
};

const TOP_CATS = ['MEDIUM', 'METHOD', 'SUBJECT', 'STYLE'];
const RIGHT_CATS = ['ELEMENTS', 'FUNCTION', 'CONTEXT', 'HISTORY'];

export default function EdgePanels({ selections, onSelect }: Props) {
  const renderPanel = (cat: string) => {
    const value = selections[cat];
    return (
      <Panel key={cat}>
        <PanelHeader>
          <span className="cat">{cat}</span>
          <span className="val">{value ? value.toUpperCase() : '—'}</span>
        </PanelHeader>
        <Options>
          {CATEGORIES[cat].map((opt) => {
            const active = value === opt;
            return (
              <Option
                key={opt}
                $active={active}
                onClick={() => onSelect(cat, opt)}
              >
                {opt}
              </Option>
            );
          })}
        </Options>
      </Panel>
    );
  };

  return (
    <>
      <TopRail>{TOP_CATS.map(renderPanel)}</TopRail>
      <RightRail>{RIGHT_CATS.map(renderPanel)}</RightRail>
    </>
  );
}

const TopRail = styled.div`
  position: fixed;
  top: 0;
  left: 300px;
  right: 280px;
  height: 220px;
  display: flex;
  gap: 8px;
  padding: 12px;
  z-index: 9;
  pointer-events: none;
  box-sizing: border-box;

  & > * {
    pointer-events: auto;
  }

  @media (max-width: 1100px) {
    right: 0;
  }

  @media (max-width: 768px) {
    left: 0;
    top: auto;
    bottom: 0;
    height: 45vh;
    flex-wrap: wrap;
  }
`;

const RightRail = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  z-index: 9;
  box-sizing: border-box;

  @media (max-width: 1100px) {
    top: 232px;
    right: 0;
    width: 260px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Panel = styled.div`
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  background: ${({ theme }) => theme.synth.panelBg};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid ${({ theme }) => theme.synth.accentBase};
  border-radius: 4px;
  padding: 10px 12px;
  font-family: ${({ theme }) => theme.fonts.mono};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.synth.accentBorderLight};
  padding-bottom: 7px;
  margin-bottom: 7px;
  flex-shrink: 0;

  & .cat {
    display: block;
    font-size: 9px;
    color: ${({ theme }) => theme.synth.accent};
    letter-spacing: 0.22em;
    font-weight: 600;
  }
  & .val {
    display: block;
    font-size: 10px;
    color: ${({ theme }) => theme.synth.white};
    letter-spacing: 0.06em;
    margin-top: 4px;
    min-height: 12px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.synth.scrollbarThumb};
    border-radius: 2px;
  }
`;

const Option = styled.button<{ $active?: boolean }>`
  text-align: left;
  background: ${({ $active, theme }) => ($active ? theme.synth.accentOptionBg : 'transparent')};
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.synth.accentStrong : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.synth.white : theme.synth.textMuted)};
  font-size: 9px;
  padding: 4px 6px;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: all 0.12s;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.synth.accentHoverBg};
    color: ${({ theme }) => theme.synth.white};
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.synth.accentStrong};
    outline-offset: 2px;
  }
`;
