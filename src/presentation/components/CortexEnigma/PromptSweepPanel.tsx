import { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { buildAxisSweep } from '../../../domain/promptSweep';
import { CATEGORY_NAMES } from '../../../domain/types';
import type { CategoryName, SelectionState } from '../../../domain/types';

type Props = {
  selections: SelectionState;
  onClose: () => void;
};

export default function PromptSweepPanel({ selections, onClose }: Props) {
  const [axis, setAxis] = useState<CategoryName>('MEDIUM');
  const columns = useMemo(() => buildAxisSweep(selections, axis), [selections, axis]);
  const current = selections[axis];

  return (
    <Overlay onClick={onClose}>
      <Panel role="dialog" aria-label="Axis sweep" onClick={e => e.stopPropagation()}>
        <PanelHeader>
          <PanelTitle>Axis Sweep</PanelTitle>
          <CloseButton onClick={onClose} aria-label="Close axis sweep">×</CloseButton>
        </PanelHeader>

        <AxisPicker role="tablist" aria-label="Sweep axis">
          {CATEGORY_NAMES.map(name => (
            <AxisTab
              key={name}
              role="tab"
              aria-selected={name === axis}
              $active={name === axis}
              onClick={() => setAxis(name)}
            >
              {name}
            </AxisTab>
          ))}
        </AxisPicker>

        <Columns>
          {columns.map(column => (
            <Column key={column.value} $current={column.value === current}>
              <ColumnHeader>
                <ColumnValue $current={column.value === current}>{column.value}</ColumnValue>
                {column.value === current && <CurrentTag>current</CurrentTag>}
              </ColumnHeader>
              <PromptText>{column.prompt || '—'}</PromptText>
            </Column>
          ))}
        </Columns>

        <Legend>
          One prompt per <strong>{axis}</strong> value — all other selections held fixed.
        </Legend>
      </Panel>
    </Overlay>
  );
}

const fadeIn = keyframes`
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Panel = styled.section`
  width: 900px;
  max-width: 94vw;
  max-height: 84vh;
  background: rgba(8, 8, 14, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(160, 32, 240, 0.3);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 12px;
  color: #e5e4e7;
  animation: ${fadeIn} 0.2s ease-out;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(160, 32, 240, 0.2);
  flex-shrink: 0;
`;

const PanelTitle = styled.h2`
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #c084fc;
  margin: 0;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #fff;
  }
`;

const AxisPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
`;

const AxisTab = styled.button<{ $active: boolean }>`
  background: ${({ $active }) =>
    $active ? 'rgba(160, 32, 240, 0.28)' : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid
    ${({ $active }) =>
      $active ? 'rgba(160, 32, 240, 0.7)' : 'rgba(255, 255, 255, 0.12)'};
  color: ${({ $active }) => ($active ? '#c084fc' : '#888')};
  border-radius: 3px;
  padding: 4px 9px;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    border-color: rgba(160, 32, 240, 0.6);
    color: #c084fc;
  }
`;

const Columns = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  padding: 16px 20px;
  gap: 12px;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(160, 32, 240, 0.3);
    border-radius: 3px;
  }
`;

const Column = styled.div<{ $current: boolean }>`
  flex: 0 0 180px;
  width: 180px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid
    ${({ $current }) =>
      $current ? 'rgba(160, 32, 240, 0.5)' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 4px;
  background: ${({ $current }) =>
    $current ? 'rgba(160, 32, 240, 0.08)' : 'rgba(255, 255, 255, 0.02)'};

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(160, 32, 240, 0.3);
    border-radius: 3px;
  }
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;

const ColumnValue = styled.span<{ $current: boolean }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $current }) => ($current ? '#d8b4fe' : '#c084fc')};
`;

const CurrentTag = styled.span`
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #d8b4fe;
  border: 1px solid rgba(160, 32, 240, 0.5);
  border-radius: 3px;
  padding: 1px 4px;
`;

const PromptText = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: #ccc;
  word-break: break-word;
  white-space: pre-wrap;
`;

const Legend = styled.p`
  margin: 0;
  padding: 10px 20px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 9px;
  color: #666;
  letter-spacing: 0.06em;
  flex-shrink: 0;

  strong {
    color: #c084fc;
  }
`;
