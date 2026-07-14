import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  MAX_GALLERY_ENTRIES,
  type GalleryEntry,
} from '../../../infrastructure/storageSchema';
import type { SelectionState } from '../../../core';
import type { DialectId } from '../../../domain/promptDialects';

type Props = {
  entries: GalleryEntry[];
  currentSelections: SelectionState;
  currentDialect: DialectId;
  remixSource: GalleryEntry | null;
  onPublish: (title: string, author: string) => void;
  onRemix: (entry: GalleryEntry) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function selectionSummary(selections: SelectionState): string {
  const active = Object.entries(selections)
    .filter(([k, v]) => k !== 'foundation' && k !== 'negative' && v)
    .map(([, v]) => v);
  if (selections.foundation.trim()) active.unshift(selections.foundation.trim());
  if (active.length === 0) return 'No axes selected';
  return active.join(', ');
}

export default function PromptGalleryDrawer({
  entries,
  currentSelections,
  currentDialect,
  remixSource,
  onPublish,
  onRemix,
  onDelete,
  onClose,
}: Props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handlePublish = () => {
    if (!title.trim()) return;
    onPublish(title.trim(), author.trim());
    setTitle('');
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
      <Drawer onClick={e => e.stopPropagation()} aria-label="Prompt gallery">
        <DrawerHeader>
          <DrawerTitle>Prompt Gallery</DrawerTitle>
          <CloseButton onClick={onClose} aria-label="Close prompt gallery">×</CloseButton>
        </DrawerHeader>

        <PublishSection>
          <SectionLabel>Publish current config</SectionLabel>
          {remixSource && (
            <RemixNote>
              Remix of “{remixSource.title}” by {remixSource.author} — publishing keeps
              its provenance chain.
            </RemixNote>
          )}
          <FieldInput
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title…"
            aria-label="Gallery entry title"
            maxLength={80}
          />
          <FieldInput
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Author handle (optional)…"
            aria-label="Author handle"
            maxLength={40}
          />
          <Summary>{selectionSummary(currentSelections)}</Summary>
          <ActionButton onClick={handlePublish} disabled={!title.trim()}>
            Publish to Gallery
          </ActionButton>
        </PublishSection>

        <DrawerBody>
          <SectionLabel>Browse ({entries.length})</SectionLabel>
          {entries.length === 0 ? (
            <EmptyState>
              Nothing published yet. Give the current config a title above and publish it
              to start the gallery.
            </EmptyState>
          ) : (
            entries.map(entry => (
              <EntryItem key={entry.id}>
                <ItemHeader>
                  <EntryTitle>{entry.title}</EntryTitle>
                  <ItemActions>
                    <RemixButton onClick={() => { onRemix(entry); onClose(); }}>
                      Remix
                    </RemixButton>
                    <DeleteButton
                      $confirming={confirmDeleteId === entry.id}
                      onClick={() => handleDeleteClick(entry.id)}
                      aria-label={`Delete ${entry.title}`}
                    >
                      {confirmDeleteId === entry.id ? 'Confirm' : '×'}
                    </DeleteButton>
                  </ItemActions>
                </ItemHeader>
                <Byline>
                  by {entry.author} · {formatTimestamp(entry.timestamp)} · {entry.dialect}
                </Byline>
                {entry.lineage.length > 0 && (
                  <Lineage title="Provenance chain (oldest → newest)">
                    Remixed from {entry.lineage.map(a => `${a.title} (${a.author})`).join(' → ')}
                  </Lineage>
                )}
                <Summary>{selectionSummary(entry.selections)}</Summary>
              </EntryItem>
            ))
          )}
        </DrawerBody>

        <DrawerFooter>
          <FooterNote>
            {entries.length}/{MAX_GALLERY_ENTRIES} entries · oldest evicted at limit
          </FooterNote>
          <FooterNote>Gallery is stored locally · no sign-in needed to browse</FooterNote>
          <FooterNote>Dialect: {currentDialect}</FooterNote>
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
  width: 380px;
  max-width: 92vw;
  height: 100%;
  background: ${({ theme }) => theme.synth.panelBg};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-left: 1px solid ${({ theme }) => theme.synth.accentBase};
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.synth.textPrimary};
  animation: ${slideIn} 0.2s ease-out;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.synth.panelHeaderBorder};
  flex-shrink: 0;
`;

const DrawerTitle = styled.h2`
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.synth.accent};
  margin: 0;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.synth.textMuted};
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
    color: ${({ theme }) => theme.synth.white};
  }
`;

const PublishSection = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.synth.panelHeaderBorder};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.h3`
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.synth.accent};
  margin: 0;
  font-weight: 600;
`;

const RemixNote = styled.p`
  margin: 0;
  font-size: 10px;
  color: ${({ theme }) => theme.synth.textMuted};
  line-height: 1.5;
`;

const FieldInput = styled.input`
  background: ${({ theme }) => theme.synth.inputBg};
  border: 1px solid ${({ theme }) => theme.synth.accentBase};
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 11px;
  color: ${({ theme }) => theme.synth.textPrimary};
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.synth.textEmpty};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.synth.accentStrong};
  }
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.synth.accentBase};
  border: 1px solid ${({ theme }) => theme.synth.accentStrong};
  color: ${({ theme }) => theme.synth.accent};
  border-radius: 4px;
  padding: 8px 14px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.synth.accentMed};
    border-color: ${({ theme }) => theme.synth.accentHover};
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
  display: flex;
  flex-direction: column;
  gap: 6px;

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

const EmptyState = styled.p`
  color: ${({ theme }) => theme.synth.textEmpty};
  font-size: 11px;
  font-style: italic;
  text-align: center;
  margin-top: 32px;
  line-height: 1.6;
`;

const EntryItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.synth.subtleBorder};

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

const EntryTitle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.synth.textPrimary};
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

const RemixButton = styled.button`
  background: ${({ theme }) => theme.synth.accentBase};
  border: 1px solid ${({ theme }) => theme.synth.accentStrong};
  color: ${({ theme }) => theme.synth.accent};
  border-radius: 3px;
  padding: 3px 10px;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    background: ${({ theme }) => theme.synth.accentMed};
    border-color: ${({ theme }) => theme.synth.accentHover};
  }
`;

const DeleteButton = styled.button<{ $confirming: boolean }>`
  background: ${({ theme, $confirming }) =>
    $confirming ? theme.synth.errorBg : 'none'};
  border: 1px solid
    ${({ theme, $confirming }) =>
    $confirming ? theme.synth.errorBorder : theme.synth.subtleBorder};
  color: ${({ theme, $confirming }) =>
    $confirming ? theme.synth.errorColor : theme.synth.textMuted};
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
    border-color: ${({ theme }) => theme.synth.errorBorder};
    color: ${({ theme }) => theme.synth.errorColor};
  }
`;

const Byline = styled.p`
  margin: 0 0 3px;
  font-size: 9px;
  color: ${({ theme }) => theme.synth.textMuted};
  letter-spacing: 0.06em;
`;

const Lineage = styled.p`
  margin: 0 0 4px;
  font-size: 9px;
  color: ${({ theme }) => theme.synth.accent};
  line-height: 1.5;
  word-break: break-word;
`;

const Summary = styled.p`
  margin: 0;
  font-size: 10px;
  color: ${({ theme }) => theme.synth.textMuted};
  line-height: 1.5;
  word-break: break-word;
`;

const DrawerFooter = styled.div`
  padding: 10px 20px 14px;
  border-top: 1px solid ${({ theme }) => theme.synth.subtleBorder};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FooterNote = styled.p`
  margin: 0;
  font-size: 9px;
  color: ${({ theme }) => theme.synth.textEmpty};
  letter-spacing: 0.06em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
