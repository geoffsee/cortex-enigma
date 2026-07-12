import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { wordBoundaryDiff } from '../../../core';
import type { DiffSegment } from '../../../core';
import type { HistoryEntry } from '../../../infrastructure/storageSchema';

type Props = {
  left: HistoryEntry;
  right: HistoryEntry;
  onClose: () => void;
};

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DiffText({ segments }: { segments: DiffSegment[] }) {
  return (
    <PromptText>
      {segments.map((seg, i) =>
        seg.added ? <Highlight key={i}>{seg.text}</Highlight> : <span key={i}>{seg.text}</span>
      )}
    </PromptText>
  );
}

export default function PromptComparePanel({ left, right, onClose }: Props) {
  // Each side highlights the phrases absent from the other entry.
  const leftSegments = useMemo(
    () => wordBoundaryDiff(right.prompt, left.prompt),
    [left.prompt, right.prompt],
  );
  const rightSegments = useMemo(
    () => wordBoundaryDiff(left.prompt, right.prompt),
    [left.prompt, right.prompt],
  );

  return (
    <Overlay onClick={e => { e.stopPropagation(); onClose(); }}>
      <Panel role="dialog" aria-label="Prompt comparison" onClick={e => e.stopPropagation()}>
        <PanelHeader>
          <PanelTitle>Compare Prompts</PanelTitle>
          <CloseButton onClick={onClose} aria-label="Close comparison">×</CloseButton>
        </PanelHeader>
        <Columns>
          <Column>
            <ColumnHeader>
              <ColumnLabel>A</ColumnLabel>
              <Timestamp>{formatTimestamp(left.timestamp)}</Timestamp>
            </ColumnHeader>
            <DiffText segments={leftSegments} />
          </Column>
          <Column>
            <ColumnHeader>
              <ColumnLabel>B</ColumnLabel>
              <Timestamp>{formatTimestamp(right.timestamp)}</Timestamp>
            </ColumnHeader>
            <DiffText segments={rightSegments} />
          </Column>
        </Columns>
        <Legend>
          <Highlight>highlighted</Highlight> phrases appear only in that prompt
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
  width: 720px;
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

const Columns = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Column = styled.div`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 16px 20px;

  &:first-child {
    border-right: 1px solid rgba(255, 255, 255, 0.08);

    @media (max-width: 640px) {
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
  }

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

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const ColumnLabel = styled.span`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #c084fc;
  border: 1px solid rgba(160, 32, 240, 0.5);
  border-radius: 3px;
  padding: 1px 6px;
`;

const Timestamp = styled.span`
  font-size: 9px;
  color: #666;
  letter-spacing: 0.08em;
`;

const PromptText = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 1.7;
  color: #ccc;
  word-break: break-word;
  white-space: pre-wrap;
`;

const Highlight = styled.mark`
  background: rgba(160, 32, 240, 0.22);
  color: #d8b4fe;
  border-radius: 2px;
  padding: 0 1px;
`;

const Legend = styled.p`
  margin: 0;
  padding: 10px 20px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 9px;
  color: #666;
  letter-spacing: 0.06em;
  flex-shrink: 0;
`;
