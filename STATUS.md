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

## Tracked Capabilities (recommended, not yet scheduled)

Source: strategic review #46, "Recommended Path Forward". Sprint planning cuts
these into numbered issues; none are scheduled yet.

| Capability | Sizing | Primary Persona | Notes |
|---|---|---|---|
| Prompt Config Export/Import | S | Tariq | v1: selection state only, schema-versioned |
| Side-by-Side Prompt Comparison | M | Tariq | Docks any two history entries; reuses `promptDiff.ts` |
| Canvas-Level Accessibility Follow-Through | M | All | Close or document the 3D ARIA gap from #53 |
| Style-Intensity Dial for LLM Expansion | M | All | Generalises skip mode's two-state intensity |
| Persona-Aware Randomize | M | Priya, Maya | Suggestion half of controlled variation |
| Lightweight Feedback Link | S | All | No telemetry; prefilled issue/discussion link |
| Negative Prompt Layer | M | Maya, Tariq | Extends `buildPrompt` domain model |
| Prompt Gallery / Social Artifacts | L | Priya | First item requiring new infrastructure |

## Queue (endorsed, not graduated)

Headless/CLI domain package, collaborative session mode, generative audio,
3D-synth-as-onboarding.
