import { ThemeProvider } from 'styled-components'
import { darkTheme } from './styles/theme'
import { GlobalStyles } from './styles/GlobalStyles'
import CortexTwister from './components/CortexTwister/CortexTwister'

export const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyles />
      <CortexTwister />
    </ThemeProvider>
  );
};

export default App
