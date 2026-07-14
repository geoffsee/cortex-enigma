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
bun run dev       # dev server with HMR
bun run build     # tsc + SSR pre-render (node prerender.mjs)
bun run lint      # ESLint
bun run preview   # preview production build
bun run test      # run the Vitest suite once (vitest run)
```

Unit tests use [Vitest](https://vitest.dev/). Run `bun run test` for a single pass,
or `bunx vitest` for interactive watch mode. Test files live next to the code they
cover as `*.test.ts` (e.g. `src/domain/promptBuilder.test.ts`,
`src/application/SelectionService.test.ts`).

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
.agents/skills/           # OpenAI-compatible agent skills (art domain knowledge)
```

## Agent Skills

Domain knowledge for prompt composition lives in `.agents/skills/` as [Agent Skills](https://agentskills.io/specification) (OpenAI Codex–compatible). Each skill is a directory with a `SKILL.md` and optional `references/`.

### How to use

1. **Match the task** — read a skill's `SKILL.md` only when the work touches that skill's scope (see table below). Do not preload all skills or reference files into context.
2. **Progressive disclosure** — `SKILL.md` holds instructions and navigation; load `references/` files inside a skill only when you need the full taxonomy or matrix.
3. **Authority order** — for UI knob values and tooltips, `src/domain/categories.ts` wins. Skills explain *why* and *what else exists*; they are not a drop-in replacement for `CATEGORIES`.
4. **Cross-skill order** — start with `cortex-prompt-axes` for code changes; use `visual-art-framework` for conceptual framing; use `art-types-taxonomy` when expanding vocabulary beyond the curated axes.

### When to load which skill

| Skill | Path | Load when |
|-------|------|-----------|
| `cortex-prompt-axes` | `.agents/skills/cortex-prompt-axes/` | Editing `categories.ts`, `promptBuilder.ts`, `CATEGORY_TOOLTIPS`, LLM expansion prompts, or reviewing composed prompt quality |
| `art-types-taxonomy` | `.agents/skills/art-types-taxonomy/` | Proposing new axis values, mapping user terms to axes, or evaluating art-history vs production-pipeline vocabulary |
| `visual-art-framework` | `.agents/skills/visual-art-framework/` | Reasoning about why the eight axes exist, validating dimensional coverage, or analyzing artwork/prompt structure at a conceptual level |

### Reference files (load on demand)

- `.agents/skills/art-types-taxonomy/references/art-types-index.txt` — full art classification tree
- `.agents/skills/cortex-prompt-axes/references/compatibility-matrix.txt` — per-axis allowed values (baseline; `categories.ts` may extend STYLE and ELEMENTS)

## Deployment

- Base path: `/cortex-enigma/`
- GitHub Actions (`.github/workflows/deploy.yml`) builds and pushes to GitHub Pages on every push to `master`
- `prerender.mjs` handles SSR pre-rendering for static output in `dist/`

## Key Conventions

- Styled-components for all styling; theme via `DefaultTheme` in `styled.d.ts`
- State persisted in `localStorage`
- ESLint flat config (`eslint.config.js`) with `noUnusedLocals` / `noUnusedParameters` enforced by TypeScript
- Vitest `*.test.ts` files colocated with the code they cover — verify with `bun run test`, `bun run build`, and `bun run lint`
