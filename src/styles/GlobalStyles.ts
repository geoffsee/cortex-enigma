import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --ce-bg: #030308;
    --ce-surface: rgba(8, 7, 15, 0.88);
    --ce-surface-strong: rgba(5, 4, 11, 0.96);
    --ce-border: rgba(183, 81, 255, 0.32);
    --ce-border-strong: rgba(199, 96, 255, 0.7);
    --ce-purple: #b24dff;
    --ce-purple-soft: #d8a8ff;
    --ce-cyan: #4bd8ff;
    --ce-muted: #807087;
    --ce-sidebar-width: clamp(270px, 17vw, 300px);
    --ce-right-rail-width: clamp(240px, 16vw, 280px);
    font: 18px/145% ${({ theme }) => theme.fonts.sans};
    letter-spacing: 0.18px;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    @media (max-width: 1024px) {
      font-size: 16px;
    }
  }

  html,
  body {
    width: 100%;
    min-width: 320px;
    min-height: 100%;
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
    background: #030308;
    overflow: hidden;
    overscroll-behavior: none;
  }

  #root {
    width: 100vw;
    height: 100svh;
    min-height: 100svh;
    background: #030308;
    isolation: isolate;
    overflow: hidden;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  button,
  input {
    font: inherit;
  }

  h1, h2 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.heading};
  }

  h1 {
    font-size: 56px;
    letter-spacing: -1.68px;
    margin: 32px 0;
    @media (max-width: 1024px) {
      font-size: 36px;
      margin: 20px 0;
    }
  }

  h2 {
    font-size: 24px;
    line-height: 118%;
    letter-spacing: -0.24px;
    margin: 0 0 8px;
    @media (max-width: 1024px) {
      font-size: 20px;
    }
  }

  p {
    margin: 0;
  }

  code {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 15px;
    line-height: 135%;
    padding: 4px 8px;
    background: ${({ theme }) => theme.colors.codeBg};
    border-radius: 4px;
    color: ${({ theme }) => theme.colors.heading};
    display: inline-flex;
  }
`;
