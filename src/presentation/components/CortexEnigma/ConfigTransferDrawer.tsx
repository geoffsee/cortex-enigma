import { useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  EXPORT_FILENAME,
  serializeConfig,
  parseConfig,
} from '../../../infrastructure/configTransfer';
import type { SelectionState } from '../../../domain/types';

type Props = {
  selections: SelectionState;
  onImport: (selections: SelectionState) => void;
  onClose: () => void;
};

export default function ConfigTransferDrawer({ selections, onImport, onClose }: Props) {
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    const blob = new Blob([serializeConfig(selections)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = EXPORT_FILENAME;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const applyText = (text: string) => {
    const result = parseConfig(text);
    if (result.ok) {
      onImport(result.selections);
      onClose();
    } else {
      setError(result.error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    file
      .text()
      .then(applyText)
      .catch(() => setError("Couldn't read that file. Please try again."));
  };

  return (
    <Overlay onClick={onClose}>
      <Drawer onClick={e => e.stopPropagation()} aria-label="Export and import">
        <DrawerHeader>
          <DrawerTitle>Export / Import</DrawerTitle>
          <CloseButton onClick={onClose} aria-label="Close export and import">×</CloseButton>
        </DrawerHeader>

        <DrawerBody>
          <SectionLabel>Export</SectionLabel>
          <Hint>
            Download the current selection state as a JSON file you can keep, share,
            or import later.
          </Hint>
          <ActionButton onClick={handleDownload}>Download Config</ActionButton>

          <Divider />

          <SectionLabel>Import</SectionLabel>
          <Hint>
            Restore selections from a previously exported file, or paste its contents
            below. Importing replaces your current selections.
          </Hint>
          <ActionButton onClick={() => fileInputRef.current?.click()}>
            Upload Config File
          </ActionButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            aria-label="Upload config file"
          />
          <PasteArea
            value={pasteText}
            onChange={e => {
              setPasteText(e.target.value);
              setError(null);
            }}
            placeholder="…or paste exported JSON here"
            aria-label="Paste exported config JSON"
            rows={6}
          />
          <ActionButton onClick={() => applyText(pasteText)} disabled={!pasteText.trim()}>
            Import Pasted Config
          </ActionButton>

          {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
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
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;

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

const SectionLabel = styled.h3`
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #c084fc;
  margin: 0;
  font-weight: 600;
`;

const Hint = styled.p`
  margin: 0;
  font-size: 10px;
  color: #888;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  background: rgba(160, 32, 240, 0.25);
  border: 1px solid rgba(160, 32, 240, 0.5);
  color: #c084fc;
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
    background: rgba(160, 32, 240, 0.4);
    border-color: rgba(160, 32, 240, 0.8);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const PasteArea = styled.textarea`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(160, 32, 240, 0.3);
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 10px;
  color: #e5e4e7;
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;

  &::placeholder {
    color: #555;
  }

  &:focus {
    outline: none;
    border-color: rgba(160, 32, 240, 0.7);
  }
`;

const ErrorMessage = styled.div`
  color: #ff4081;
  font-size: 10px;
  padding: 6px 10px;
  background: rgba(255, 64, 129, 0.08);
  border: 1px solid rgba(255, 64, 129, 0.4);
  border-radius: 4px;
  line-height: 1.5;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin: 8px 0;
  width: 100%;
`;
