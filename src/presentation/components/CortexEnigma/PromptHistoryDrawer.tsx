import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import type { HistoryEntry } from '../../../infrastructure/storageSchema';

type Props = {
  entries: HistoryEntry[];
  onClear: () => void;
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

export default function PromptHistoryDrawer({ entries, onClear, onClose }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (entry: HistoryEntry) => {
    navigator.clipboard.writeText(entry.prompt)
      .then(() => {
        setCopiedId(entry.id);
        setTimeout(() => setCopiedId(null), 1500);
      })
      .catch(() => { /* permission denied — leave button state unchanged */ });
  };

  return (
    <Overlay onClick={onClose}>
      <Drawer onClick={e => e.stopPropagation()}>
        <DrawerHeader>
          <DrawerTitle>Prompt History</DrawerTitle>
          <HeaderActions>
            {entries.length > 0 && (
              <ClearButton onClick={onClear}>Clear All</ClearButton>
            )}
            <CloseButton onClick={onClose} aria-label="Close history">×</CloseButton>
          </HeaderActions>
        </DrawerHeader>

        <DrawerBody>
          {entries.length === 0 ? (
            <EmptyState>No prompts generated yet.</EmptyState>
          ) : (
            entries.map(entry => (
              <HistoryItem key={entry.id}>
                <ItemMeta>
                  <Timestamp>{formatTimestamp(entry.timestamp)}</Timestamp>
                  <CopyButton
                    onClick={() => handleCopy(entry)}
                    $copied={copiedId === entry.id}
                    aria-label="Copy prompt"
                  >
                    {copiedId === entry.id ? 'Copied!' : 'Copy'}
                  </CopyButton>
                </ItemMeta>
                <PromptText>{entry.prompt}</PromptText>
              </HistoryItem>
            ))
          )}
        </DrawerBody>
      </Drawer>
    </Overlay>
  );
}

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  justify-content: flex-end;
`;

const Drawer = styled.aside`
  width: 360px;
  max-width: 90vw;
  height: 100%;
  background: rgba(8, 8, 14, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-left: 1px solid rgba(160, 32, 240, 0.3);
  display: flex;
  flex-direction: column;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 12px;
  color: #e5e4e7;
  animation: ${slideIn} 0.2s ease-out;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(160, 32, 240, 0.2);
  flex-shrink: 0;
`;

const DrawerTitle = styled.h2`
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #c084fc;
  margin: 0;
  font-weight: 600;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ClearButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 64, 129, 0.3);
  color: rgba(255, 64, 129, 0.7);
  border-radius: 3px;
  padding: 3px 8px;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    border-color: rgba(255, 64, 129, 0.7);
    color: #ff4081;
  }
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

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 24px;

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

const EmptyState = styled.p`
  color: #555;
  font-size: 11px;
  font-style: italic;
  text-align: center;
  margin-top: 40px;
`;

const HistoryItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
`;

const ItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const Timestamp = styled.span`
  font-size: 9px;
  color: #666;
  letter-spacing: 0.08em;
`;

const CopyButton = styled.button<{ $copied: boolean }>`
  background: ${({ $copied }) =>
    $copied ? 'rgba(160, 32, 240, 0.3)' : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid
    ${({ $copied }) =>
    $copied ? 'rgba(160, 32, 240, 0.7)' : 'rgba(255, 255, 255, 0.12)'};
  color: ${({ $copied }) => ($copied ? '#c084fc' : '#888')};
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    border-color: rgba(160, 32, 240, 0.6);
    color: #c084fc;
  }
`;

const PromptText = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: #ccc;
  word-break: break-word;
  white-space: pre-wrap;
`;
