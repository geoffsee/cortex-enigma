import { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { deriveAudioScene } from '../../../domain/generativeAudio';
import { sessionSummary } from '../../../domain/collaborativeSession';
import type { SelectionState } from '../../../domain/types';
import { useGenerativeAudio } from '../../hooks/useGenerativeAudio';
import { useCollaborativeSession } from '../../hooks/useCollaborativeSession';

type Props = {
  selections: SelectionState;
  prompt: string;
  onClose: () => void;
};

export default function SessionStudioPanel({ selections, prompt, onClose }: Props) {
  const scene = useMemo(() => deriveAudioScene(selections), [selections]);
  const { supported, isPlaying, start, stop, update } = useGenerativeAudio();
  const { session, add, remove } = useCollaborativeSession();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  // While the soundscape is live, keep it in sync with the shared composition.
  useEffect(() => {
    if (isPlaying) update(scene);
  }, [scene, isPlaying, update]);

  const toggleAudio = () => {
    if (isPlaying) stop();
    else void start(scene);
  };

  const submitParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    add(name, note);
    setName('');
    setNote('');
  };

  const copySummary = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(sessionSummary(session, prompt))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {
        /* clipboard permission denied */
      });
  };

  return (
    <Overlay onClick={onClose}>
      <Panel role="dialog" aria-label="Live session" onClick={e => e.stopPropagation()}>
        <PanelHeader>
          <PanelTitle>Live Session</PanelTitle>
          <CloseButton onClick={onClose} aria-label="Close live session">
            ×
          </CloseButton>
        </PanelHeader>

        <Body>
          <Block>
            <BlockTitle>Generative Audio</BlockTitle>
            <Caption>The current composition drives an ambient soundscape.</Caption>
            {supported ? (
              <>
                <PlayButton type="button" $on={isPlaying} onClick={toggleAudio}>
                  {isPlaying ? 'Stop Soundscape' : 'Play Soundscape'}
                </PlayButton>
                <Stats>
                  <Stat>
                    <span>Voices</span>
                    <strong>{scene.voices.length}</strong>
                  </Stat>
                  <Stat>
                    <span>Root</span>
                    <strong>{scene.rootFrequency} Hz</strong>
                  </Stat>
                  <Stat>
                    <span>Cutoff</span>
                    <strong>{scene.filterCutoff} Hz</strong>
                  </Stat>
                  <Stat>
                    <span>Tempo</span>
                    <strong>{scene.tempo} BPM</strong>
                  </Stat>
                </Stats>
                {scene.voices.length === 0 && (
                  <Hint>Select composition axes to add voices to the mix.</Hint>
                )}
              </>
            ) : (
              <Hint>Web Audio is unavailable in this browser.</Hint>
            )}
          </Block>

          <Block>
            <BlockTitle>Session {session.id}</BlockTitle>
            <Caption>Coordinate collaborators with art-director notes.</Caption>
            <Form onSubmit={submitParticipant}>
              <Field
                aria-label="Collaborator name"
                placeholder="Collaborator name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <Field
                aria-label="Art-director note"
                placeholder="Note (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <AddButton type="submit" disabled={!name.trim()}>
                Add
              </AddButton>
            </Form>
            <Roster>
              {session.participants.length === 0 ? (
                <Hint>No collaborators yet.</Hint>
              ) : (
                session.participants.map(p => (
                  <RosterRow key={p.id}>
                    <RosterName>{p.name}</RosterName>
                    {p.note && <RosterNote>{p.note}</RosterNote>}
                    <RemoveButton
                      type="button"
                      onClick={() => remove(p.id)}
                      aria-label={`Remove ${p.name}`}
                    >
                      ×
                    </RemoveButton>
                  </RosterRow>
                ))
              )}
            </Roster>
            <CopyButton type="button" onClick={copySummary}>
              {copied ? 'Summary Copied ✓' : 'Copy Session Summary'}
            </CopyButton>
          </Block>
        </Body>

        <Legend>
          Exploratory spike — a local audio + collaboration prototype that leaves the core
          composition surface untouched.
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
  width: 640px;
  max-width: 94vw;
  max-height: 84vh;
  background: ${({ theme }) => theme.synth.panelBg};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid ${({ theme }) => theme.synth.accentBase};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.synth.textPrimary};
  animation: ${fadeIn} 0.2s ease-out;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.synth.accentBorderLight};
  flex-shrink: 0;
`;

const PanelTitle = styled.h2`
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

const Body = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 18px 20px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.synth.scrollbarThumb};
    border-radius: 3px;
  }
`;

const Block = styled.div`
  flex: 1 1 260px;
  min-width: 240px;
  border: 1px solid ${({ theme }) => theme.synth.subtleButtonBorder};
  border-radius: 4px;
  background: ${({ theme }) => theme.synth.subtleBg};
  padding: 14px;
`;

const BlockTitle = styled.h3`
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.synth.accent};
  margin: 0 0 4px;
  font-weight: 600;
`;

const Caption = styled.p`
  margin: 0 0 12px;
  font-size: 10px;
  line-height: 1.5;
  color: ${({ theme }) => theme.synth.textMuted};
`;

const PlayButton = styled.button<{ $on: boolean }>`
  width: 100%;
  padding: 10px;
  border-radius: 3px;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  color: ${({ theme }) => theme.synth.white};
  background: ${({ $on, theme }) => ($on ? theme.synth.accentStrong : theme.synth.accentBase)};
  border: 1px solid
    ${({ $on, theme }) => ($on ? theme.synth.accentHover : theme.synth.accentStrong)};

  &:hover {
    background: ${({ theme }) => theme.synth.accentMed};
    border-color: ${({ theme }) => theme.synth.accentHover};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
`;

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: ${({ theme }) => theme.synth.textMuted};

  strong {
    color: ${({ theme }) => theme.synth.textPrimary};
    font-weight: 600;
  }
`;

const Hint = styled.p`
  margin: 10px 0 0;
  font-size: 9px;
  line-height: 1.5;
  color: ${({ theme }) => theme.synth.textFaint};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Field = styled.input`
  background: ${({ theme }) => theme.synth.inputBg};
  border: 1px solid ${({ theme }) => theme.synth.accentBase};
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 11px;
  color: ${({ theme }) => theme.synth.white};
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.synth.textEmpty};
  }

  &:focus {
    border-color: ${({ theme }) => theme.synth.accentStrong};
  }
`;

const AddButton = styled.button`
  padding: 8px;
  border-radius: 3px;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  color: ${({ theme }) => theme.synth.white};
  background: ${({ theme }) => theme.synth.accentBase};
  border: 1px solid ${({ theme }) => theme.synth.accentStrong};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.synth.accentMed};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const Roster = styled.div`
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RosterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 3px;
  background: ${({ theme }) => theme.synth.accentSubtle};
  border: 1px solid ${({ theme }) => theme.synth.subtleButtonBorder};
`;

const RosterName = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.synth.textPrimary};
`;

const RosterNote = styled.span`
  flex: 1;
  font-size: 9px;
  color: ${({ theme }) => theme.synth.textMuted};
  word-break: break-word;
`;

const RemoveButton = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  color: ${({ theme }) => theme.synth.textMuted};
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.synth.errorColor};
  }
`;

const CopyButton = styled.button`
  width: 100%;
  padding: 8px;
  border-radius: 3px;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  color: ${({ theme }) => theme.synth.textToggle};
  background: ${({ theme }) => theme.synth.subtleBg};
  border: 1px solid ${({ theme }) => theme.synth.subtleButtonBorder};

  &:hover {
    background: ${({ theme }) => theme.synth.accentMed};
    border-color: ${({ theme }) => theme.synth.accentHover};
    color: ${({ theme }) => theme.synth.white};
  }
`;

const Legend = styled.p`
  margin: 0;
  padding: 10px 20px 14px;
  border-top: 1px solid ${({ theme }) => theme.synth.subtleBorder};
  font-size: 9px;
  color: ${({ theme }) => theme.synth.textFaint};
  letter-spacing: 0.06em;
  line-height: 1.5;
  flex-shrink: 0;
`;
