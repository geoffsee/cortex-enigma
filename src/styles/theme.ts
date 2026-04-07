import type { DefaultTheme } from 'styled-components';

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
};
