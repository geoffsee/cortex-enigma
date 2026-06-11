import styled, { keyframes } from 'styled-components';
import type { GalleryEntry } from '../../../infrastructure/gallery';
import type { SelectionState } from '../../../domain/types';
import { buildPrompt } from '../../../domain/promptBuilder';

type Props = {
  entries: GalleryEntry[];
  onApply: (selections: SelectionState) => void;
  onClose: () => void;
};

export default function PromptGalleryDrawer({ entries, onApply, onClose }: Props) {
  return (
    <Overlay onClick={onClose}>
      <Drawer onClick={e => e.stopPropagation()} aria-label="Prompt gallery">
        <DrawerHeader>
          <DrawerTitle>Prompt Gallery</DrawerTitle>
          <CloseButton onClick={onClose} aria-label="Close gallery">×</CloseButton>
        </DrawerHeader>

        <DrawerBody>
          {entries.length === 0 ? (
            <EmptyState>The gallery manifest is empty or could not be read.</EmptyState>
          ) : (
            entries.map(entry => (
              <GalleryItem key={entry.id}>
                <ItemHeader>
                  <EntryTitle>{entry.title}</EntryTitle>
                  <LoadButton
                    onClick={() => { onApply(entry.selections); onClose(); }}
                    aria-label={`Load gallery prompt ${entry.title}`}
                  >
                    Load
                  </LoadButton>
                </ItemHeader>
                <Description>{entry.description}</Description>
                <PromptPreview>{buildPrompt(entry.selections)}</PromptPreview>
              </GalleryItem>
            ))
          )}
        </DrawerBody>

        <DrawerFooter>
          <FooterNote>
            Curated configurations · loading one updates your share link
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

const GalleryItem = styled.div`
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

const EntryTitle = styled.span`
  font-size: 12px;
  color: #e5e4e7;
  font-weight: 600;
  letter-spacing: 0.04em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LoadButton = styled.button`
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
  flex-shrink: 0;

  &:hover {
    background: rgba(160, 32, 240, 0.4);
    border-color: rgba(160, 32, 240, 0.8);
  }
`;

const Description = styled.p`
  margin: 0 0 4px;
  font-size: 10px;
  color: #aaa;
  line-height: 1.5;
`;

const PromptPreview = styled.p`
  margin: 0;
  font-size: 10px;
  color: #666;
  line-height: 1.5;
  word-break: break-word;
  font-style: italic;
`;

const DrawerFooter = styled.div`
  padding: 10px 20px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
`;

const FooterNote = styled.p`
  margin: 0;
  font-size: 9px;
  color: #444;
  letter-spacing: 0.06em;
`;
