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
  background: rgba(8, 8, 14, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(160, 32, 240, 0.25);
  border-radius: 4px;
  padding: 10px 12px;
  font-family: ui-monospace, Consolas, monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  border-bottom: 1px solid rgba(160, 32, 240, 0.2);
  padding-bottom: 7px;
  margin-bottom: 7px;
  flex-shrink: 0;

  & .cat {
    display: block;
    font-size: 9px;
    color: #c084fc;
    letter-spacing: 0.22em;
    font-weight: 600;
  }
  & .val {
    display: block;
    font-size: 10px;
    color: #fff;
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
    background: rgba(160, 32, 240, 0.3);
    border-radius: 2px;
  }
`;

const Option = styled.button<{ $active?: boolean }>`
  text-align: left;
  background: ${({ $active }) =>
    $active ? 'rgba(160, 32, 240, 0.28)' : 'transparent'};
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(160, 32, 240, 0.6)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : '#888')};
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
    background: rgba(160, 32, 240, 0.15);
    color: #fff;
  }
`;
