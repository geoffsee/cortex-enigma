import { useState } from 'react';
import styled, { keyframes } from 'styled-components';

type Props = {
  onDismiss: () => void;
};

const STEPS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: 'Compose an axis',
    body: 'Pick values on the edge panels and sidebar — MEDIUM, STYLE, SUBJECT and more stack into one prompt.',
  },
  {
    title: 'Explore fast',
    body: 'Hit Randomize to roll fresh combinations, or Generate to expand your foundation with the in-browser model.',
  },
  {
    title: 'Take it with you',
    body: 'Copy the prompt or grab a share link — everything round-trips through the URL and your export.',
  },
];

export default function OnboardingGuide({ onDismiss }: Props) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <Card role="complementary" aria-label="Getting started">
      <TopRow>
        <Kicker>Getting started</Kicker>
        <SkipButton onClick={onDismiss} aria-label="Skip onboarding">
          Skip
        </SkipButton>
      </TopRow>

      <Title>{current.title}</Title>
      <Body>{current.body}</Body>

      <BottomRow>
        <Dots aria-hidden="true">
          {STEPS.map((s, i) => (
            <Dot key={s.title} $active={i === step} />
          ))}
        </Dots>
        <NextButton onClick={() => (isLast ? onDismiss() : setStep(s => s + 1))}>
          {isLast ? 'Got it' : 'Next'}
        </NextButton>
      </BottomRow>
    </Card>
  );
}

const slideUp = keyframes`
  from { transform: translate(-50%, 16px); opacity: 0; }
  to   { transform: translate(-50%, 0);    opacity: 1; }
`;

// Positioned, non-blocking card: no full-screen overlay, so the app stays
// fully interactive underneath and the fast path gains zero steps.
const Card = styled.aside`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 55;
  width: 340px;
  max-width: calc(100vw - 32px);
  padding: 16px 18px;
  background: ${({ theme }) => theme.synth.panelBg};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid ${({ theme }) => theme.synth.accentBase};
  border-radius: 6px;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.synth.textPrimary};
  animation: ${slideUp} 0.2s ease-out;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Kicker = styled.span`
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.synth.accent};
  font-weight: 600;
`;

const SkipButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.synth.textMuted};
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    color: ${({ theme }) => theme.synth.white};
  }
`;

const Title = styled.h2`
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.synth.textPrimary};
`;

const Body = styled.p`
  margin: 0 0 14px;
  font-size: 11px;
  line-height: 1.6;
  color: ${({ theme }) => theme.synth.textToggle};
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Dots = styled.div`
  display: flex;
  gap: 6px;
`;

const Dot = styled.span<{ $active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $active, theme }) =>
    $active ? theme.synth.accent : theme.synth.subtleButtonBorder};
  transition: background 0.15s;
`;

const NextButton = styled.button`
  background: ${({ theme }) => theme.synth.accentOptionBg};
  border: 1px solid ${({ theme }) => theme.synth.accentHover};
  color: ${({ theme }) => theme.synth.accent};
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 3px;
  padding: 5px 12px;
  transition: all 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.synth.accentStrong};
  }
`;
