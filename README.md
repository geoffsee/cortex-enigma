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

## Headless & Agent Interfaces

The prompt-composition domain (`src/domain` + `src/application`) is React-free
and browser-free, re-exported from `src/core`. Two headless consumers wrap it so
the exact same validated logic runs in pipelines and agents:

### CLI

```bash
bun run cli --foundation "a lone lighthouse" --medium painting --style surreal
bun run cli --sweep style --medium painting --dialect midjourney
bun run cli --count 30 --seed 7 --out variations.txt
bun run cli --help    # full flag reference
```

### MCP Server

`mcp/cortex-mcp.ts` exposes the same domain as [Model Context
Protocol](https://modelcontextprotocol.io) tools over stdio (JSON-RPC 2.0, no
external SDK, no React). Start it with:

```bash
bun run mcp
```

**Tools**

| Tool | Purpose | Input |
|------|---------|-------|
| `build_prompt` | Compose one prompt | `foundation`, `negative`, any of the eight axes (`medium`, `method`, `subject`, `style`, `elements`, `function`, `context`, `history`), optional `dialect` (`standard` \| `midjourney` \| `natural`) |
| `axis_sweep` | One prompt per value of an axis, others held fixed | `axis` (required) + the same selection fields as `build_prompt` |
| `list_axes` | Every axis and its allowed values | — |
| `list_dialects` | Available output dialects | — |

Each axis field is constrained to its allowed values (an `enum` in the tool's
JSON schema); call `tools/list` for the full machine-readable schema, or the
`list_axes` tool for a human-readable listing. Tool results carry an `isError`
flag — invalid axis values or dialects return `isError: true` with an actionable
message rather than a protocol error.

**Example agent invocation**

Register the server with any MCP-capable client. A Claude Desktop / Claude Code
`mcpServers` entry:

```json
{
  "mcpServers": {
    "cortex-enigma": {
      "command": "bun",
      "args": ["run", "mcp/cortex-mcp.ts"],
      "cwd": "/absolute/path/to/cortex-enigma"
    }
  }
}
```

The raw stdio session an agent drives (newline-delimited JSON-RPC) looks like:

```jsonc
// → initialize
{"jsonrpc":"2.0","id":1,"method":"initialize"}
// ← {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"cortex-enigma-prompt","version":"0.1.0"}}}

// → call build_prompt
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"build_prompt","arguments":{"foundation":"a lone lighthouse","medium":"painting","style":"surreal","negative":"blurry","dialect":"midjourney"}}}
// ← {"jsonrpc":"2.0","id":2,"result":{"content":[{"type":"text","text":"a lone lighthouse, painting, surreal --no blurry"}],"isError":false}}
```

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

## Browser Requirements

The in-browser LLM requires **WebGPU** support. Chrome 113+ and Edge 113+ work out of the box. Firefox and Safari do not yet support WebGPU by default. The rest of the app (3D canvas, selection UI) works in any modern browser.
