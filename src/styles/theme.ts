import type { DefaultTheme } from 'styled-components';

const darkSynthTokens: DefaultTheme['synth'] = {
  panelBg: 'rgba(8, 8, 14, 0.82)',
  panelHeaderBorder: 'rgba(160, 32, 240, 0.18)',
  accentBorderLight: 'rgba(160, 32, 240, 0.2)',

  accent: '#c084fc',
  accentBase: 'rgba(160, 32, 240, 0.25)',
  accentMed: 'rgba(160, 32, 240, 0.4)',
  accentStrong: 'rgba(160, 32, 240, 0.6)',
  accentHover: 'rgba(160, 32, 240, 0.8)',
  accentSubtle: 'rgba(160, 32, 240, 0.1)',
  accentActiveBg: 'rgba(160, 32, 240, 0.14)',
  accentOptionBg: 'rgba(160, 32, 240, 0.28)',
  accentHoverBg: 'rgba(160, 32, 240, 0.15)',
  scrollbarThumb: 'rgba(160, 32, 240, 0.3)',

  inputBg: 'rgba(0, 0, 0, 0.4)',

  white: '#fff',
  textPrimary: '#e5e4e7',
  textMuted: '#888',
  textDim: '#777',
  textFaint: '#666',
  textEmpty: '#555',
  textInactive: '#444',
  textToggle: '#ccc',

  subtleBorder: 'rgba(255, 255, 255, 0.05)',
  subtleBg: 'rgba(255, 255, 255, 0.04)',
  subtleButtonBorder: 'rgba(255, 255, 255, 0.1)',
  subtleBorderLight: 'rgba(255, 255, 255, 0.15)',

  errorColor: '#ff4081',
  errorBg: 'rgba(255, 64, 129, 0.1)',
  errorBorder: 'rgba(255, 64, 129, 0.2)',

  lockBg: 'rgba(255, 180, 0, 0.08)',
  lockBorder: 'rgba(255, 180, 0, 0.35)',
  lockIcon: '#f0a800',
  lockIconHover: '#ffc400',
};

const lightSynthTokens: DefaultTheme['synth'] = darkSynthTokens;

export const lightTheme: DefaultTheme = {
  colors: {
    background: '#fff',
    text: '#6b6375',
    heading: '#08060d',
    border: '#e5e4e7',
    codeBg: '#f4f3ec',
    accent: '#aa3bff',
    accentBg: 'rgba(170, 59, 255, 0.1)',
    accentBorder: 'rgba(170, 59, 255, 0.5)',
    socialBg: 'rgba(244, 243, 236, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px',
  },
  fonts: {
    sans: "system-ui, 'Segoe UI', Roboto, sans-serif",
    heading: "system-ui, 'Segoe UI', Roboto, sans-serif",
    mono: "ui-monospace, Consolas, monospace",
  },
  synth: lightSynthTokens,
};

export const darkTheme: DefaultTheme = {
  colors: {
    background: '#16171d',
    text: '#9ca3af',
    heading: '#f3f4f6',
    border: '#2e303a',
    codeBg: '#1f2028',
    accent: '#c084fc',
    accentBg: 'rgba(192, 132, 252, 0.15)',
    accentBorder: 'rgba(192, 132, 252, 0.5)',
    socialBg: 'rgba(47, 48, 58, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px',
  },
  fonts: {
    sans: "system-ui, 'Segoe UI', Roboto, sans-serif",
    heading: "system-ui, 'Segoe UI', Roboto, sans-serif",
    mono: "ui-monospace, Consolas, monospace",
  },
  synth: darkSynthTokens,
};
