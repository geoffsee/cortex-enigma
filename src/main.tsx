import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.tsx'

const container = document.getElementById('root')!
const tree = <App />

// In dev, mount fresh to avoid hydration mismatches during HMR.
// In preview/prod, hydrate only when prerendered markup exists.
if (!import.meta.env.DEV && container.hasChildNodes()) {
  hydrateRoot(container, tree)
} else {
  createRoot(container).render(tree)
}
