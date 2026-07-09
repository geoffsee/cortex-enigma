---
name: art-types-taxonomy
description: Comprehensive taxonomy of visual art media, forms, subjects, methods, periods, and contemporary categories. Use when expanding prompt vocabulary, validating category choices, mapping terms to cortex-enigma axes, or reviewing art-history vs production-pipeline lexicon.
---

# Art Types Taxonomy

Cortex Enigma's 8 axes distill a broader art-classification system. The full taxonomy is in [references/art-types-index.txt](references/art-types-index.txt).

## When to load the full index

- Proposing new `CATEGORIES` options in `src/domain/categories.ts`
- Mapping a user prompt term to MEDIUM, METHOD, SUBJECT, STYLE, etc.
- Persona review of art-history vs production-pipeline vocabulary alignment

## Structure overview

The index has 13 top-level sections:

1. Fundamental Divisions (Fine, Applied, Folk, Commercial)
2. Primary Media
3. Formal Elements
4. Principles of Organization
5. Subject Matter
6. Modes of Representation
7. Historical Periods and Traditions
8. Cultural / Geographic Frames
9. Production Contexts
10. Display Contexts
11. Critical Lenses
12. Border / Hybrid Zones
13. Contemporary Emergent Categories (generative, AI-associated, XR, bio/eco, networked)

## Important constraint

Not every taxonomy leaf is a valid UI knob value. `src/domain/categories.ts` is authoritative for the app. Use this skill for vocabulary and alignment, not as a drop-in replacement for `CATEGORIES`.

## Related skills

- `visual-art-framework` — dimensional decomposition formula
- `cortex-prompt-axes` — curated 8-axis compatibility matrix and composition rules
