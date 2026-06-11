# Issue Tracking

## Strategic Direction

The single living strategic-direction artifact is
[#46 — Strategic Review: 2026-06-11 — Reproducibility and Sharing Frontier: Export/Import and Comparison Lead the Next Cycle](https://github.com/geoffsee/cortex-enigma/issues/46).

Its **Recommended Path Forward** section is the endorsed backlog. Sprint planning
consumes that section and cuts selected items into trackable sprint issues; no
recommendation issues exist outside of sprint planning.

## Related Open Issues

| Issue | Label | Purpose |
|---|---|---|
| #46 | `strategic-review` | Living strategic review (this cycle: 2026-06-11) |
| #67 | `uxr-synthesis` | UXR synthesis the current review depends on |
| #66 | `ideation` | Endorsed ideation set feeding the review |
| #65 | `housekeeping` | No-op housekeeping run, 2026-06-11 |
| #77 | `sprint`, `tracker` | Active sprint tracker (2026-06-11 cycle) |

## Sprint: Reproducibility & Sharing (2026-06-11) — Tracker #77

Cut from #46's Recommended Path Forward, fully endorsed. All eight items
carried forward as-is; simplest interpretation applied where choices were
open. No item touches `.github/` — #74 uses prefilled issue URLs rather
than template files.

### Task Dependency Hierarchy

| Issue | Depends On | Depended On By | Layer | Status |
|-------|-----------|----------------|-------|--------|
| #69 Prompt Config Export/Import | — | #75, #76 | 0 | 🔴 Not Started |
| #70 Side-by-Side Prompt Comparison | — | #76 | 0 | 🔴 Not Started |
| #71 Canvas-Level Accessibility Follow-Through | — | — | 0 | 🔴 Not Started |
| #72 Style-Intensity Dial for LLM Expansion | — | — | 0 | 🔴 Not Started |
| #73 Persona-Aware Randomize | — | — | 0 | 🔴 Not Started |
| #74 Lightweight Feedback Link | — | — | 0 | 🔴 Not Started |
| #75 Negative Prompt Layer | #69 | — | 1 | 🔴 Not Started |
| #76 Prompt Gallery / Social Artifacts | #69, #70 | — | 1 | 🔴 Not Started |

## Notes

- The strategic review is edited in place each cycle; do not file a new
  strategic-review issue while #46 is open.
- The remaining endorsed-but-not-graduated queue (headless/CLI domain
  package, collaborative session mode, generative audio,
  3D-synth-as-onboarding) stays in #46 for a future cycle.
