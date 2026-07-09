---
name: cortex-prompt-axes
description: Documents Cortex Enigma's 8-axis image prompt composition (MEDIUM, METHOD, SUBJECT, STYLE, ELEMENTS, FUNCTION, CONTEXT, HISTORY), compatibility matrix, and buildPrompt assembly order. Use when editing categories.ts, promptBuilder, LLM expansion prompts, or reviewing prompt quality.
---

# Cortex Enigma Prompt Axes

Cortex Enigma composes AI image prompts across eight intentional axes. Selections flow through `buildPrompt()` in `src/domain/promptBuilder.ts`.

## Compatibility matrix

Per-axis allowed values are in [references/compatibility-matrix.txt](references/compatibility-matrix.txt).

Authoritative UI values — including STYLE and ELEMENTS extensions — live in `src/domain/categories.ts` with tooltips in `CATEGORY_TOOLTIPS`.

## Composition order

`buildPrompt` concatenates (comma-separated, empty parts omitted):

1. `foundation`
2. `MEDIUM`
3. `SUBJECT`
4. `STYLE`
5. `ELEMENTS`
6. `HISTORY`
7. `FUNCTION`
8. `METHOD` → `made via {METHOD}`
9. `CONTEXT` → `in a {CONTEXT} context`

## Workflow: editing axes

1. Read `src/domain/categories.ts` for current knob values.
2. Cross-check additions against `art-types-taxonomy` references.
3. Update `src/domain/promptBuilder.test.ts` if composition logic changes.
4. Run `bun run test` and `bun run build`.

## Compatibility guidance

Axes are combinatorial — any legal per-axis selection can compose. Prefer semantically coherent combinations (e.g. `sculpture` + `carve`, `digital` + `code`; avoid strained pairings like `photo` + `carve` unless intentional).

## Related skills

- `visual-art-framework` — why these eight dimensions exist
- `art-types-taxonomy` — broader vocabulary for axis expansion
