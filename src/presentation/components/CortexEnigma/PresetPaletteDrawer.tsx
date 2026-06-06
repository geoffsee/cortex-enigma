import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { MAX_TEMPLATES } from '../../../infrastructure/storageSchema';
import type { TemplateRecord } from '../../../infrastructure/storageSchema';
import type { SelectionState } from '../../../domain/types';

type Props = {
  templates: TemplateRecord[];
  currentSelections: SelectionState;
  onSave: (name: string) => void;
  onApply: (template: TemplateRecord) => void;
  onDelete: (id: string) => void;
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

function selectionSummary(selections: SelectionState): string {
  const active = Object.entries(selections)
    .filter(([k, v]) => k !== 'foundation' && v)
    .map(([, v]) => v);
  if (active.length === 0) return 'No axes selected';
  return active.join(', ');
}

export default function PresetPaletteDrawer({
  templates,
  currentSelections,
  onSave,
  onApply,
  onDelete,
  onClose,
}: Props) {
  const [saveName, setSaveName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave(saveName.trim());
    setSaveName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
  };

  const handleDeleteClick = (id: string) => {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Drawer onClick={e => e.stopPropagation()}>
        <DrawerHeader>
          <DrawerTitle>Style Templates</DrawerTitle>
          <CloseButton onClick={onClose} aria-label="Close templates">×</CloseButton>
        </DrawerHeader>

        <SaveRow>
          <SaveInput
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Template name…"
            aria-label="Template name"
            maxLength={64}
          />
          <SaveButton onClick={handleSave} disabled={!saveName.trim()}>
            Save
          </SaveButton>
        </SaveRow>

        <DrawerBody>
          {templates.length === 0 ? (
            <EmptyState>
              No templates saved yet. Enter a name above and click Save to capture the
              current selection state.
            </EmptyState>
          ) : (
            templates.map(t => (
              <TemplateItem key={t.id}>
                <ItemHeader>
                  <TemplateName>{t.name}</TemplateName>
                  <ItemActions>
                    <ApplyButton onClick={() => { onApply(t); onClose(); }}>
                      Apply
                    </ApplyButton>
                    <DeleteButton
                      $confirming={confirmDeleteId === t.id}
                      onClick={() => handleDeleteClick(t.id)}
                      aria-label={`Delete template ${t.name}`}
                    >
                      {confirmDeleteId === t.id ? 'Confirm' : '×'}
                    </DeleteButton>
                  </ItemActions>
                </ItemHeader>
                <ItemMeta>
                  <Timestamp>{formatTimestamp(t.timestamp)}</Timestamp>
                </ItemMeta>
                <Summary>{selectionSummary(t.selections)}</Summary>
              </TemplateItem>
            ))
          )}
        </DrawerBody>

        <DrawerFooter>
          <FooterNote>
            {templates.length}/{MAX_TEMPLATES} templates · oldest evicted at limit
          </FooterNote>
          <FooterNote>
            Current: {selectionSummary(currentSelections)}
          </FooterNote>
        </DrawerFooter>
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

const SaveRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(160, 32, 240, 0.15);
  flex-shrink: 0;
`;

const SaveInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(160, 32, 240, 0.3);
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 11px;
  color: #e5e4e7;
  font-family: inherit;

  &::placeholder {
    color: #555;
  }

  &:focus {
    outline: none;
    border-color: rgba(160, 32, 240, 0.7);
  }
`;

const SaveButton = styled.button`
  background: rgba(160, 32, 240, 0.25);
  border: 1px solid rgba(160, 32, 240, 0.5);
  color: #c084fc;
  border-radius: 4px;
  padding: 7px 14px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
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

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 8px;

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
  line-height: 1.6;
`;

const TemplateItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const TemplateName = styled.span`
  font-size: 12px;
  color: #e5e4e7;
  font-weight: 600;
  letter-spacing: 0.04em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const ApplyButton = styled.button`
  background: rgba(160, 32, 240, 0.2);
  border: 1px solid rgba(160, 32, 240, 0.5);
  color: #c084fc;
  border-radius: 3px;
  padding: 3px 10px;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    background: rgba(160, 32, 240, 0.4);
    border-color: rgba(160, 32, 240, 0.8);
  }
`;

const DeleteButton = styled.button<{ $confirming: boolean }>`
  background: ${({ $confirming }) =>
    $confirming ? 'rgba(255, 64, 129, 0.25)' : 'none'};
  border: 1px solid
    ${({ $confirming }) =>
    $confirming ? 'rgba(255, 64, 129, 0.7)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $confirming }) => ($confirming ? '#ff4081' : '#666')};
  border-radius: 3px;
  padding: 3px 7px;
  font-size: ${({ $confirming }) => ($confirming ? '8px' : '14px')};
  line-height: 1;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  letter-spacing: ${({ $confirming }) => ($confirming ? '0.05em' : '0')};
  text-transform: ${({ $confirming }) => ($confirming ? 'uppercase' : 'none')};

  &:hover {
    border-color: rgba(255, 64, 129, 0.5);
    color: #ff4081;
  }
`;

const ItemMeta = styled.div`
  margin-bottom: 4px;
`;

const Timestamp = styled.span`
  font-size: 9px;
  color: #555;
  letter-spacing: 0.08em;
`;

const Summary = styled.p`
  margin: 0;
  font-size: 10px;
  color: #888;
  line-height: 1.5;
  word-break: break-word;
`;

const DrawerFooter = styled.div`
  padding: 10px 20px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FooterNote = styled.p`
  margin: 0;
  font-size: 9px;
  color: #444;
  letter-spacing: 0.06em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
