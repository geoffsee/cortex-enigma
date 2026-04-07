import { ThemeProvider } from 'styled-components'
import { darkTheme } from './styles/theme'
import { GlobalStyles } from './styles/GlobalStyles'
import CortexEnigma from './components/CortexEnigma/CortexEnigma'

export const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyles />
      <CortexEnigma />
    </ThemeProvider>
  );
};

export default App
