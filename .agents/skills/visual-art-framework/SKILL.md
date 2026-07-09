---
name: visual-art-framework
description: Defines the eight-dimensional framework for visual art composition (media, form, subject, method, context, history, display, interpretation). Use when analyzing artworks, expanding image prompts, validating axis coverage, or reasoning about cortex-enigma category design.
---

# Visual Art Framework

Visual art decomposes into eight compositional dimensions:

```
VISUAL ART = media + form + subject + method + context + history + display + interpretation
```

## How to use

1. Identify which dimensions are explicit vs implied in a prompt or artwork description.
2. Map each dimension to a Cortex Enigma axis (see `cortex-prompt-axes`).
3. Load `art-types-taxonomy` when you need vocabulary beyond the curated knob values.

## Mapping to Cortex Enigma axes

| Framework dimension | Cortex Enigma axis |
|---------------------|-------------------|
| media | MEDIUM |
| method | METHOD |
| subject | SUBJECT |
| form / style | STYLE + ELEMENTS |
| context | CONTEXT |
| history | HISTORY |
| display / function | FUNCTION |
| interpretation | implicit in LLM expansion |

## Related skills

- `cortex-prompt-axes` — authoritative 8-axis values and composition order
- `art-types-taxonomy` — full art-history classification tree
