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

## Accessibility

The 3D synth scene is **decorative**: every control it renders (rotary knobs, randomize/copy buttons, the prompt display) has a DOM equivalent in the sidebar or edge panels. The canvas container is marked `aria-hidden="true"`, so assistive technology skips it entirely — the DOM controls are the canonical accessible route.

A keyboard-only user can complete the full flow without a pointer:

1. **Select** — Tab to the category panels along the top and right edges (right-rail axes sit behind the ADVANCED disclosure) and activate options with Enter/Space. Active selections can be cleared per-axis from the sidebar.
2. **Randomize** — sidebar → Actions → Randomize.
3. **Generate** — sidebar → Foundation input + GEN button (requires WebGPU).
4. **Copy** — sidebar → Actions → Copy to Clipboard.

**Decision record (issue #71):** rather than giving the Three.js meshes synthetic focus and ARIA semantics, the DOM path is documented as the supported accessible route and the canvas is hidden from the accessibility tree. The 3D surface duplicates — never extends — the DOM controls, so keeping it pointer-only loses no functionality. Future accessibility reviews should treat this as settled unless the canvas gains a control with no DOM equivalent.

## Privacy & Usage Signal

Cortex Enigma ships an **opt-in, anonymous** usage signal that is **off by default**. On first use a banner asks whether you want to help by sharing anonymous usage counts. If you decline (or ignore it), the app is fully functional and nothing is captured.

- **Anonymous** — no account, no identity, no IP, no fingerprint, no PII.
- **On-device only** — counts live in this browser's `localStorage`; there is no network transport, so nothing leaves your machine before or after opt-in.
- **Counts, not content** — only per-action occurrence counts are kept. Prompt text and selected axis values are never recorded.
- **Reversible** — declining or revoking consent purges any counts already stored.

See [PRIVACY.md](./PRIVACY.md) for the full list of what is and isn't collected.

## Browser Requirements

The in-browser LLM requires **WebGPU** support. Chrome 113+ and Edge 113+ work out of the box. Firefox and Safari do not yet support WebGPU by default. The rest of the app (3D canvas, selection UI) works in any modern browser.
