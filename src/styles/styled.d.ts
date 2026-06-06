import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      text: string;
      heading: string;
      border: string;
      codeBg: string;
      accent: string;
      accentBg: string;
      accentBorder: string;
      socialBg: string;
      shadow: string;
    };
    fonts: {
      sans: string;
      heading: string;
      mono: string;
    };
    synth: {
      panelBg: string;
      panelHeaderBorder: string;
      accentBorderLight: string;

      accent: string;
      accentBase: string;
      accentMed: string;
      accentStrong: string;
      accentHover: string;
      accentSubtle: string;
      accentActiveBg: string;
      accentOptionBg: string;
      accentHoverBg: string;
      scrollbarThumb: string;

      inputBg: string;

      white: string;
      textPrimary: string;
      textMuted: string;
      textDim: string;
      textFaint: string;
      textEmpty: string;
      textInactive: string;
      textToggle: string;

      subtleBorder: string;
      subtleBg: string;
      subtleButtonBorder: string;
      subtleBorderLight: string;

      errorColor: string;
      errorBg: string;
      errorBorder: string;

      lockBg: string;
      lockBorder: string;
      lockIcon: string;
      lockIconHover: string;
    };
  }
}
