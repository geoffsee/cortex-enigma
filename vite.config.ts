import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/cortext-enigma/',
  plugins: [react()],
  ssr: {
    // styled-components only ships a CJS build; let Vite bundle it so the
    // default export is wired up correctly inside the SSR module.
    noExternal: ['styled-components'],
  },
})
