import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ANALYTICS_EVENT_NAMES, ANALYTICS_EVENT_DESCRIPTIONS } from '../../../core';

type Props = {
  onEnable: () => void;
  onDecline: () => void;
};

export default function AnalyticsConsentBanner({ onEnable, onDecline }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <Banner role="region" aria-label="Anonymous usage signal">
      <Content>
        <Title>Help improve Cortex Enigma?</Title>
        <Blurb>
          Share <strong>anonymous, on-device</strong> usage counts so we can see which features
          get used. No account, no identity, no prompt text — and nothing is sent to a server.
          The tool works exactly the same if you decline.
        </Blurb>

        <DetailsToggle
          onClick={() => setDetailsOpen(v => !v)}
          aria-expanded={detailsOpen}
        >
          {detailsOpen ? 'Hide details' : 'What is collected?'}
        </DetailsToggle>

        {detailsOpen && (
          <Details>
            <DetailGroup>
              <DetailHeading>Collected (as counts only)</DetailHeading>
              <DetailList>
                {ANALYTICS_EVENT_NAMES.map(name => (
                  <li key={name}>
                    <Code>{name}</Code> — {ANALYTICS_EVENT_DESCRIPTIONS[name]}
                  </li>
                ))}
              </DetailList>
            </DetailGroup>
            <DetailGroup>
              <DetailHeading>Never collected</DetailHeading>
              <DetailList>
                <li>Names, emails, accounts, or any identifier.</li>
                <li>Prompt text, foundation text, or selected axis values.</li>
                <li>IP address, location, or device fingerprint.</li>
                <li>Anything transmitted over the network — data stays in this browser.</li>
              </DetailList>
            </DetailGroup>
          </Details>
        )}
      </Content>

      <Actions>
        <DeclineButton onClick={onDecline}>No thanks</DeclineButton>
        <EnableButton onClick={onEnable}>Enable</EnableButton>
      </Actions>
    </Banner>
  );
}

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const Banner = styled.div`
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  width: 480px;
  max-width: calc(100vw - 32px);
  z-index: 60;
  background: rgba(8, 8, 14, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(160, 32, 240, 0.35);
  border-radius: 8px;
  padding: 16px 18px;
  font-family: ui-monospace, Consolas, monospace;
  color: #e5e4e7;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  animation: ${slideUp} 0.25s ease-out;
`;

const Content = styled.div`
  margin-bottom: 12px;
`;

const Title = styled.h2`
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #c084fc;
  margin: 0 0 8px;
  font-weight: 600;
`;

const Blurb = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #ccc;

  strong {
    color: #e5e4e7;
  }
`;

const DetailsToggle = styled.button`
  background: none;
  border: none;
  color: #c084fc;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  padding: 8px 0 0;

  &:hover {
    color: #d8b4fe;
    text-decoration: underline;
  }
`;

const Details = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DetailGroup = styled.div``;

const DetailHeading = styled.h3`
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #888;
  margin: 0 0 4px;
  font-weight: 600;
`;

const DetailList = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
  line-height: 1.6;
  color: #b8b6bd;

  li {
    margin-bottom: 2px;
  }
`;

const Code = styled.code`
  color: #c084fc;
  font-size: 10px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const DeclineButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #999;
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: #fff;
  }
`;

const EnableButton = styled.button`
  background: rgba(160, 32, 240, 0.2);
  border: 1px solid rgba(160, 32, 240, 0.6);
  color: #c084fc;
  border-radius: 4px;
  padding: 6px 16px;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    border-color: rgba(160, 32, 240, 0.95);
    background: rgba(160, 32, 240, 0.32);
    color: #d8b4fe;
  }
`;
