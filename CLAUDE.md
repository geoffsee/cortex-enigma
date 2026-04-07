# cortex-enigma

Interactive AI image prompt generator with a 3D visual interface. Deployed as a static site to GitHub Pages via SSR pre-rendering.

## Tech Stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **Three.js** via `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- **styled-components 6** with dark/light theme support
- **@mlc-ai/web-llm** — in-browser LLM (Llama-3.2-1B-Instruct) for prompt expansion
- **lucide-react** for icons

## Commands

```bash
npm run dev       # dev server with HMR
npm run build     # tsc + SSR pre-render (node prerender.mjs)
npm run lint      # ESLint
npm run preview   # preview production build
```

No test suite is configured.

## Project Structure

Layered Clean Architecture — dependency flow: `presentation → application → domain`; infrastructure implements application ports.

```
src/
  domain/
    types.ts              # SelectionState, CategoryName, EMPTY_SELECTIONS
    categories.ts         # CATEGORIES constant
    promptBuilder.ts      # buildPrompt() pure function
  application/
    ports/
      IStoragePort.ts     # storage port interface
      ILLMPort.ts         # LLM port interface
    SelectionService.ts   # toggle, randomize, clear, validate (named exports)
  infrastructure/
    LocalStorageAdapter.ts  # implements IStoragePort; owns STORAGE_KEY
    WebLLMAdapter.ts        # implements ILLMPort; dynamic import of @mlc-ai/web-llm
  presentation/
    hooks/
      useSelections.ts    # state + SelectionService + LocalStorageAdapter
      usePromptEngine.ts  # LLM state + WebLLMAdapter
    components/CortexEnigma/
      CortexEnigma.tsx    # thin orchestrator (~50 lines)
      Sidebar.tsx         # sidebar UI + styled components
      EdgePanels.tsx      # top/right category panels + styled components
      Canvas/
        CortexCanvas.tsx  # Canvas wrapper + lights + controls
        scene/
          CortexCore.tsx       # floating sphere + CoreGlow
          OutputPanel.tsx      # synth chassis + knob row + display
          Knob.tsx             # individual rotary knob
          SynthButton.tsx      # illuminated panel button
          BackgroundStars.tsx  # 500-point star field
          ReflectiveFloor.tsx  # mirror floor + TRON grid
          SceneEffects.tsx     # EffectComposer (bloom/noise/vignette)
  styles/
    GlobalStyles.ts
    theme.ts              # Dark/light theme tokens
    styled.d.ts           # styled-components theme types
    useThemeDetector.ts   # System theme hook
  App.tsx
  main.tsx
  entry-server.tsx        # SSR entry point
prerender.mjs             # Builds client + SSR bundles, generates static HTML
```

## Deployment

- Base path: `/cortex-enigma/`
- GitHub Actions (`.github/workflows/deploy.yml`) builds and pushes to GitHub Pages on every push to `master`
- `prerender.mjs` handles SSR pre-rendering for static output in `dist/`

## Key Conventions

- Styled-components for all styling; theme via `DefaultTheme` in `styled.d.ts`
- State persisted in `localStorage`
- ESLint flat config (`eslint.config.js`) with `noUnusedLocals` / `noUnusedParameters` enforced by TypeScript
- No separate test files — verify with `npm run build` and `npm run lint`
