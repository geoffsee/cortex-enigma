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
  }
}
