# Cortex Enigma

An AR DJ copilot interface with a 3D control surface. Select live-set dimensions, derive DJ context, compose performance-aware prompts, and expand the foundation with an in-browser LLM — all rendered against a real-time Three.js scene.

## Features

- **8-axis DJ prompt composition** — choose from curated options across genre, transition method, crowd intent, set objective, FX palette, performance goal, venue context, and reference era
- **DJ context telemetry** — selections are converted into objective, transition intent, crowd heat, risk, fatigue, and a live recommendation
- **In-browser LLM expansion** — Llama 3.2 1B runs locally via WebGPU; no server, no API key
- **3D control surface** — an analog synth panel with rotary knobs maps directly to your selections
- **Viewport waveform HUD** — bottom-fixed audio waveform with a toggleable playhead overlay
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

## DJ Context

The DJ context layer translates the eight prompt axes into live-performance language before the prompt is displayed or copied.

### Category Mapping

The domain keys are intentionally generic, but the UI labels them as DJ controls:

| Domain key | DJ label | Meaning |
|---|---|---|
| `MEDIUM` | Deck A Genre | Current or target genre family |
| `METHOD` | Transition Method | Mix technique, such as harmonic blend, EQ swap, quick cut, or echo out |
| `SUBJECT` | Crowd Intent | What the transition should do to the room |
| `STYLE` | Set Objective | Set phase: warmup, build, sustain, peak, rain, reset, or close |
| `ELEMENTS` | FX Palette | Performance effects to emphasize |
| `FUNCTION` | Performance Goal | Tactical purpose of the next move |
| `CONTEXT` | Venue Context | Room or stage environment |
| `HISTORY` | Reference Era | Historical DJ/music reference point |

These labels live in `src/application/djCockpit.ts` as `DJ_CATEGORY_LABELS`.

### Runtime Flow

1. `useSelections()` owns the selected values and persists them to localStorage.
2. `deriveDJTelemetry(selections)` converts selections into performance telemetry.
3. `CortexEnigma` formats the telemetry into a compact `djRichContext` string.
4. `buildPrompt(selections, djRichContext)` appends that context to the user-facing prompt.
5. The same telemetry drives the HUD, core glow intensity, EQ module movement, and DJ recommendation display.

Current telemetry fields:

| Field | Source logic | Used for |
|---|---|---|
| `objective` | Uses selected `STYLE`, otherwise infers from foundation text and active selection count | Bottom HUD, core color, recommendation |
| `transitionIntent` | Uses selected `METHOD`, otherwise defaults from objective | Prompt context |
| `crowdHeat` | Derived from active selection count and boosted by peak/rain objectives | Bottom HUD, EQ animation, core intensity |
| `risk` | Derived from active selection count and boosted by cut-based transitions | Bottom HUD |
| `dropFatigue` | Inverse of crowd heat, with rain adjustment | Bottom HUD |
| `recommendation` | Objective-specific guidance | 3D console recommendation screen |

Example prompt tail:

```text
DJ rich context: objective=warmup; intent=harmonic blend; heat=1/5; risk=1/5; fatigue=4/5
```

### Related Context Modules

- `src/application/djCockpit.ts` is the active UI telemetry layer.
- `src/application/buildDJRichContext.ts` contains a richer formatter for objective, heat, risk appetite, drop fatigue, transition intent, posture, and signals. It is available for future wiring but is not the current `CortexEnigma` prompt path.
- `contexts/dj/state.ts` contains a MobX-State-Tree DJ machine prototype for deck state, track analysis, crowd state, recommendation requests, transition lifecycle, and rain mode. It is modeled with injected `audio`, `analyzer`, and `ai` services so it can remain deterministic and testable.

## Architecture

The project follows a layered Clean Architecture:

```
src/
  domain/          # Pure TypeScript — types, categories, prompt builder
  application/     # Port interfaces, SelectionService, DJ telemetry/context helpers
  infrastructure/  # LocalStorageAdapter, WebLLMAdapter
  presentation/    # React hooks, components, 3D scene files
  styles/          # Theme tokens, GlobalStyles
contexts/
  dj/              # Experimental DJ machine/state context
```

Dependency flow: `presentation → application → domain`; infrastructure implements application ports.

## Deployment

Pushes to `master` trigger a GitHub Actions workflow that builds the static site and deploys it to GitHub Pages at `/cortex-enigma/`.

## Browser Requirements

The in-browser LLM requires **WebGPU** support. Chrome 113+ and Edge 113+ work out of the box. Firefox and Safari do not yet support WebGPU by default. The rest of the app (3D canvas, selection UI) works in any modern browser.
