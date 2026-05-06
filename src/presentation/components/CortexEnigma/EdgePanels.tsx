import styled from 'styled-components';
import type { CSSProperties } from 'react';
import { CATEGORIES } from '../../../domain/categories';
import type { SelectionState } from '../../../domain/types';
import { DJ_CATEGORY_LABELS, type DJTelemetry } from '../../../application/djCockpit';

type Props = {
  selections: SelectionState;
  onSelect: (cat: string, val: string) => void;
  telemetry: DJTelemetry;
  playheadEnabled: boolean;
};

const TOP_CATS = ['MEDIUM', 'METHOD', 'SUBJECT', 'STYLE'];
const RIGHT_CATS = ['ELEMENTS', 'FUNCTION', 'CONTEXT', 'HISTORY'];
const WAVEFORM_BARS = [
  0.22, 0.36, 0.52, 0.64, 0.78, 0.7, 0.55, 0.42, 0.34, 0.5, 0.68, 0.58,
  0.31, 0.25, 0.37, 0.49, 0.72, 0.88, 0.76, 0.61, 0.44, 0.32, 0.46, 0.63,
  0.84, 0.71, 0.57, 0.39, 0.28, 0.35, 0.53, 0.67, 0.81, 0.74, 0.56, 0.43,
  0.3, 0.47, 0.69, 0.9, 0.83, 0.66, 0.48, 0.27, 0.38, 0.59, 0.73, 0.62,
];

export default function EdgePanels({ selections, onSelect, telemetry, playheadEnabled }: Props) {
  const renderPanel = (cat: string) => {
    const value = selections[cat];
    const label = DJ_CATEGORY_LABELS[cat] ?? cat;
    return (
      <Panel key={cat}>
        <PanelHeader>
          <span className="cat">{label}</span>
          <span className="val">{value ? value.toUpperCase() : '—'}</span>
        </PanelHeader>
        <Options>
          {CATEGORIES[cat].map((opt) => {
            const active = value === opt;
            return (
              <Option
                key={opt}
                type="button"
                $active={active}
                onClick={() => onSelect(cat, opt)}
              >
                {opt}
              </Option>
            );
          })}
        </Options>
      </Panel>
    );
  };

  return (
    <>
      <TopRail>{TOP_CATS.map(renderPanel)}</TopRail>
      <RightRail>{RIGHT_CATS.map(renderPanel)}</RightRail>
      <ViewportWaveform aria-hidden="true">
        <span className="label">AUDIO CLIP FEED</span>
        <span className="baseline" />
        {playheadEnabled && <span className="playhead" />}
        <span className="bars">
          {WAVEFORM_BARS.map((height, index) => (
            <span
              key={`${height}-${index}`}
              style={{
                '--bar-height': `${Math.round(height * 100)}%`,
                '--bar-delay': `${index * -0.045}s`,
              } as CSSProperties}
            />
          ))}
        </span>
      </ViewportWaveform>
      <TelemetryRail>
        <span>OBJ {telemetry.objective.toUpperCase()}</span>
        <span>HEAT {telemetry.crowdHeat}/5</span>
        <span>RISK {telemetry.risk}/5</span>
        <span>FATIGUE {telemetry.dropFatigue}/5</span>
      </TelemetryRail>
    </>
  );
}

const TopRail = styled.div`
  position: fixed;
  top: 0;
  left: var(--ce-sidebar-width);
  right: var(--ce-right-rail-width);
  height: min(24vh, 220px);
  display: flex;
  gap: 8px;
  padding: 12px;
  z-index: 9;
  pointer-events: none;
  box-sizing: border-box;

  & > * {
    pointer-events: auto;
  }

  @media (max-width: 1100px) {
    right: 0;
  }

  @media (max-width: 768px) {
    left: 0;
    top: auto;
    bottom: 0;
    height: 50svh;
    flex-wrap: wrap;
    padding: 10px;
  }
`;

const RightRail = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--ce-right-rail-width);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  z-index: 9;
  box-sizing: border-box;

  @media (max-width: 1100px) {
    top: 232px;
    right: 0;
    width: var(--ce-right-rail-width);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Panel = styled.div`
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  position: relative;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(0, 0, 0, 0.2)),
    radial-gradient(circle at 50% 0, rgba(178, 77, 255, 0.16), transparent 45%),
    rgba(5, 5, 12, 0.84);
  backdrop-filter: blur(18px) saturate(1.08);
  -webkit-backdrop-filter: blur(18px) saturate(1.08);
  border: 1px solid var(--ce-border);
  border-radius: 4px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -1px 0 rgba(178, 77, 255, 0.14),
    0 14px 34px rgba(0, 0, 0, 0.24);
  color: #e9ddf5;
  padding: 10px 12px;
  font-family: "Share Tech Mono", "Space Mono", "IBM Plex Mono", ui-monospace, Consolas, monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--ce-purple), transparent);
    opacity: 0.72;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.025) 0 1px, transparent 1px 5px);
    opacity: 0.22;
  }
`;

const PanelHeader = styled.div`
  border-bottom: 1px solid rgba(178, 77, 255, 0.24);
  padding-bottom: 7px;
  margin-bottom: 7px;
  flex-shrink: 0;
  text-align: center;

  & .cat {
    display: block;
    font-size: 9px;
    color: var(--ce-purple-soft);
    letter-spacing: 0.22em;
    font-weight: 700;
    text-shadow: 0 0 12px rgba(178, 77, 255, 0.36);
  }
  & .val {
    display: block;
    font-size: 10px;
    color: #fff;
    letter-spacing: 0.06em;
    margin-top: 4px;
    min-height: 12px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(178, 77, 255, 0.4);
    border-radius: 2px;
  }
`;

const Option = styled.button<{ $active?: boolean }>`
  text-align: left;
  background: ${({ $active }) =>
    $active ? 'linear-gradient(90deg, rgba(178, 77, 255, 0.35), rgba(75, 216, 255, 0.08))' : 'transparent'};
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(216, 168, 255, 0.52)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : '#8a7d91')};
  font-size: 9px;
  padding: 4px 6px;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: all 0.12s;
  flex-shrink: 0;

  &:hover {
    background: rgba(178, 77, 255, 0.18);
    color: #fff;
  }
`;

const TelemetryRail = styled.div`
  position: fixed;
  left: calc(var(--ce-sidebar-width) + 20px);
  right: calc(var(--ce-right-rail-width) + 20px);
  bottom: 56px;
  z-index: 12;
  pointer-events: none;
  display: flex;
  justify-content: center;
  gap: 18px;
  color: var(--ce-purple-soft);
  font-size: 10px;
  letter-spacing: 0.16em;
  font-family: "Share Tech Mono", "Space Mono", "IBM Plex Mono", ui-monospace, Consolas, monospace;
  text-transform: uppercase;
  text-shadow:
    0 0 8px rgba(178, 77, 255, 0.72),
    0 0 20px rgba(0, 0, 0, 0.85);

  @media (max-width: 1100px) {
    right: 20px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const ViewportWaveform = styled.div`
  position: fixed;
  left: var(--ce-sidebar-width);
  right: var(--ce-right-rail-width);
  bottom: 0;
  height: 46px;
  z-index: 11;
  pointer-events: none;
  overflow: hidden;
  background:
    linear-gradient(180deg, transparent, rgba(0, 3, 9, 0.9) 30%, rgba(0, 0, 0, 0.96)),
    radial-gradient(80% 100% at 50% 100%, rgba(75, 216, 255, 0.16), transparent 68%);
  border-top: 1px solid rgba(75, 216, 255, 0.24);
  box-shadow:
    0 -12px 28px rgba(0, 0, 0, 0.46),
    inset 0 1px 0 rgba(178, 77, 255, 0.22);
  font-family: "Share Tech Mono", "Space Mono", "IBM Plex Mono", ui-monospace, Consolas, monospace;

  & .label {
    position: absolute;
    left: 18px;
    top: 5px;
    color: var(--ce-cyan);
    font-size: 7px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.72;
    text-shadow: 0 0 8px rgba(75, 216, 255, 0.55);
  }

  & .baseline {
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 9px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(75, 216, 255, 0.75), transparent);
    box-shadow: 0 0 10px rgba(75, 216, 255, 0.4);
  }

  & .playhead {
    position: absolute;
    top: 6px;
    bottom: 7px;
    width: 2px;
    background: linear-gradient(180deg, transparent, #ffffff 12%, var(--ce-cyan) 54%, transparent);
    box-shadow:
      0 0 10px rgba(75, 216, 255, 0.9),
      0 0 22px rgba(178, 77, 255, 0.48);
    animation: viewport-playhead-scan 4.2s linear infinite;
  }

  & .bars {
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 10px;
    height: 28px;
    display: flex;
    align-items: flex-end;
    gap: 5px;
  }

  & .bars span {
    width: 5px;
    height: var(--bar-height);
    min-height: 4px;
    background: linear-gradient(180deg, #7feaff, #35b9ff);
    box-shadow: 0 0 8px rgba(53, 185, 255, 0.68);
    animation: viewport-waveform-pulse 1.15s ease-in-out infinite alternate;
    animation-delay: var(--bar-delay);
    transform-origin: bottom;
  }

  @keyframes viewport-waveform-pulse {
    from {
      transform: scaleY(0.58);
      opacity: 0.62;
    }
    to {
      transform: scaleY(1.08);
      opacity: 1;
    }
  }

  @keyframes viewport-playhead-scan {
    from {
      left: 18px;
    }
    to {
      left: calc(100% - 20px);
    }
  }

  @media (max-width: 1100px) {
    right: 0;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;
