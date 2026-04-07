# Cortex Enigma

An interactive AI image prompt generator with a 3D visual interface. Select artistic categories, compose prompts, and expand them with an in-browser LLM — all rendered against a real-time Three.js scene.

## Features

- **8-axis prompt composition** — choose from curated options across MEDIUM, METHOD, SUBJECT, STYLE, ELEMENTS, FUNCTION, CONTEXT, and HISTORY
- **In-browser LLM expansion** — Llama 3.2 1B runs locally via WebGPU; no server, no API key
- **3D control surface** — an analog synth panel with rotary knobs maps directly to your selections
- **Persistent state** — selections survive page reloads via localStorage
- **Static deployment** — SSR pre-rendered and hosted on GitHub Pages

## Tech Stack

| Concern | Library |
|---|---|
| UI framework | React 19 + TypeScript 6 |
| Build tool | Vite 8 |
| 3D rendering | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Post-processing | `@react-three/postprocessing` (bloom, noise, vignette) |
| Styling | styled-components 6 |
| In-browser LLM | `@mlc-ai/web-llm` (Llama-3.2-1B-Instruct) |
| Icons | lucide-react |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173/cortex-enigma/](http://localhost:5173/cortex-enigma/).

## Commands

```bash
npm run dev       # dev server with HMR
npm run build     # TypeScript check + SSR pre-render → dist/
npm run lint      # ESLint
npm run preview   # serve the production build locally
```

## Architecture

The project follows a layered Clean Architecture:

```
src/
  domain/          # Pure TypeScript — types, categories, prompt builder
  application/     # Port interfaces + SelectionService (no React)
  infrastructure/  # LocalStorageAdapter, WebLLMAdapter
  presentation/    # React hooks, components, 3D scene files
  styles/          # Theme tokens, GlobalStyles
```

Dependency flow: `presentation → application → domain`; infrastructure implements application ports.

## Deployment

Pushes to `master` trigger a GitHub Actions workflow that builds the static site and deploys it to GitHub Pages at `/cortex-enigma/`.

## Browser Requirements

The in-browser LLM requires **WebGPU** support. Chrome 113+ and Edge 113+ work out of the box. Firefox and Safari do not yet support WebGPU by default. The rest of the app (3D canvas, selection UI) works in any modern browser.
