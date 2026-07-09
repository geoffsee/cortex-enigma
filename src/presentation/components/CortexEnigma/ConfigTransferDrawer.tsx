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
    background: ${({ theme }) => theme.synth.scrollbarThumb};
    border-radius: 3px;
  }
`;

const SectionLabel = styled.h3`
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.synth.accent};
  margin: 0;
  font-weight: 600;
`;

const Hint = styled.p`
  margin: 0;
  font-size: 10px;
  color: ${({ theme }) => theme.synth.textMuted};
  line-height: 1.5;
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

const HiddenFileInput = styled.input`
  display: none;
`;

const PasteArea = styled.textarea`
  background: ${({ theme }) => theme.synth.inputBg};
  border: 1px solid ${({ theme }) => theme.synth.accentBase};
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 10px;
  color: ${({ theme }) => theme.synth.textPrimary};
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;

  &::placeholder {
    color: ${({ theme }) => theme.synth.textEmpty};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.synth.accentStrong};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.synth.errorColor};
  font-size: 10px;
  padding: 6px 10px;
  background: ${({ theme }) => theme.synth.errorBg};
  border: 1px solid ${({ theme }) => theme.synth.errorBorder};
  border-radius: 4px;
  line-height: 1.5;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.synth.subtleBorder};
  margin: 8px 0;
  width: 100%;
`;
