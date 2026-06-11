# Project Status

Last updated: 2026-06-11

## Shipped Capabilities

| Capability | Issue/PR | Status | Primary Persona |
|---|---|---|---|
| Shareable URL hash | — | Shipped | Tariq |
| Prompt history (last 20) | — | Shipped | Tariq |
| Versioned Zod storage schema | — | Shipped | Tariq |
| LLM Fallback / Skip Mode | #47 / PR #55 | Shipped | Priya |
| Category Onboarding Tooltips | #48 / PR #56 | Shipped | Priya |
| Expansion Diff Overlay | #49 / PR #57 | Shipped | Priya, Tariq |
| Preset Palette / Style Templates | #50 / PR #58 | Shipped | Maya |
| Locked-Axis Randomize | #51 / PR #59 | Shipped | Maya |
| Progressive Disclosure for Advanced Axes | #52 / PR #60 | Shipped | Priya |
| Keyboard Navigation (DOM-equivalent path) | #53 / PR #61 | Shipped (canvas ARIA gap open) | All |

## Scheduled Capabilities (sprint tracker #77)

Source: strategic review #46, "Recommended Path Forward". All eight items are
cut into numbered issues under sprint tracker #77 (2026-06-11 cycle).

| Capability | Issue | Sizing | Primary Persona | Status | Notes |
|---|---|---|---|---|---|
| Prompt Config Export/Import | #69 | S | Tariq | Scheduled | v1: selection state only, schema-versioned |
| Side-by-Side Prompt Comparison | #70 | M | Tariq | Scheduled | Docks any two history entries; reuses `promptDiff.ts` |
| Canvas-Level Accessibility Follow-Through | #71 | M | All | Scheduled | Close or document the 3D ARIA gap from #53 |
| Style-Intensity Dial for LLM Expansion | #72 | M | All | Scheduled | Generalises skip mode's two-state intensity |
| Persona-Aware Randomize | #73 | M | Priya, Maya | Scheduled | Suggestion half of controlled variation |
| Lightweight Feedback Link | #74 | S | All | Scheduled | No telemetry; prefilled issue URL, no `.github/` changes |
| Negative Prompt Layer | #75 | M | Maya, Tariq | Scheduled (blocked by #69) | Extends `buildPrompt` domain model |
| Prompt Gallery / Social Artifacts | #76 | L | Priya | Scheduled (blocked by #69, #70) | Static JSON manifest; no dynamic backend |

## Queue (endorsed, not graduated)

Headless/CLI domain package, collaborative session mode, generative audio,
3D-synth-as-onboarding.
