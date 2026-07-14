# Privacy — Usage Signal

Cortex Enigma has no backend. It is a static site with an in-browser LLM, and it
ships a single, optional usage signal designed to be **anonymous** and
**opt-in**. This document is the authoritative description of what that signal
does and does not collect.

## Consent model

- The signal is **off by default**. On first use a banner asks whether you want
  to enable it.
- Choosing **No thanks** (or simply ignoring the banner) leaves the tool fully
  functional. Nothing is captured.
- Choosing **Enable** turns on local capture. You are answered once; the choice
  is remembered in `localStorage`.
- Revoking consent (or declining) **purges** any counts already stored.
- **No network calls are made before opt-in.** In fact, the current
  implementation makes no network calls at all — captured data never leaves your
  browser (see "Where the data lives").

## What IS collected

When — and only when — you have opted in, the app increments an anonymous
**occurrence counter** for each of the following actions. The stored value is a
count per action name and nothing else.

| Event name     | Meaning |
|----------------|---------|
| `axis_select`  | You picked a value on one of the prompt axes. |
| `expand`       | You ran an LLM expansion of the foundation. |
| `share`        | You copied a shareable config link. |
| `randomize`    | You randomized the selections. |
| `copy_prompt`  | You copied the composed prompt. |

That is the entire schema: `{ "axis_select": 12, "expand": 3, ... }`.

## What is NEVER collected

- Names, emails, accounts, or any identifier.
- Prompt text, foundation text, or the specific axis values you selected.
- IP address, geolocation, or device/browser fingerprint.
- Timestamps, event ordering, or session reconstruction.
- Anything transmitted over a network — there is no analytics endpoint.

## Where the data lives

Counts are stored under the `localStorage` key
`cortex-enigma:analytics-events-v1`, and your consent choice under
`cortex-enigma:analytics-consent-v1`. Both are scoped to your browser on this
origin. Clearing site data removes them. Declining or revoking consent clears
the counts immediately.

## Why it is built this way

The signal must survive an anonymity constraint: it may not require identity
disclosure. Under static GitHub Pages hosting there is no server to receive
data, so the honest first step is an on-device, opt-in aggregate. If a network
sink is ever added, it would sit behind this same consent gate and this document
would be updated before any data is transmitted.
