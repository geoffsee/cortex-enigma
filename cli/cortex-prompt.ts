// Headless CLI consumer of the cortex-enigma prompt-composition package.
//
// Proves the domain logic runs with no React/browser runtime: it maps
// command-line flags onto a SelectionState, runs it through the same
// `validate` -> `renderPrompt` functions the browser app uses, and prints the
// composed prompt(s) to stdout. Run it with `bun run cli/cortex-prompt.ts`.
//
// Beyond single prompts it supports batch generation: emit one prompt per
// value of an axis (`--sweep`), N randomized variations (`--count`), or drive
// either from a reusable JSON config file (`--config`) for reproducible,
// auditable runs. All batch output honours an optional `--dialect`.

import process from 'node:process';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  randomize,
  renderPrompt,
  validate,
  isDialectId,
  DEFAULT_DIALECT,
  CATEGORIES,
  CATEGORY_NAMES,
  EMPTY_SELECTIONS,
  type DialectId,
  type SelectionState,
} from '../src/core';

const FLAG_TO_KEY: Record<string, keyof SelectionState> = {
  foundation: 'foundation',
  negative: 'negative',
};
for (const category of CATEGORY_NAMES) {
  FLAG_TO_KEY[category.toLowerCase()] = category;
}

type ParsedArgs = {
  help: boolean;
  list: boolean;
  random: boolean;
  seed?: number;
  count?: number;
  sweep?: string;
  dialect?: string;
  config?: string;
  out?: string;
  values: Record<string, string>;
};

// Fields a `--config` JSON file may set. Explicit CLI flags override these so a
// config can serve as a reusable baseline that individual runs tweak.
type BatchConfig = {
  seed?: number;
  count?: number;
  sweep?: string;
  dialect?: string;
  out?: string;
  base?: Record<string, string>;
};

function parseArgs(argv: readonly string[]): ParsedArgs {
  const parsed: ParsedArgs = { help: false, list: false, random: false, values: {} };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    let key = token.slice(2);
    let value: string | undefined;
    const eq = key.indexOf('=');
    if (eq !== -1) {
      value = key.slice(eq + 1);
      key = key.slice(0, eq);
    }
    if (key === 'help' || key === 'h') { parsed.help = true; continue; }
    if (key === 'list') { parsed.list = true; continue; }
    if (key === 'random') { parsed.random = true; continue; }
    if (value === undefined) {
      const next = argv[i + 1];
      value = next !== undefined && !next.startsWith('--') ? argv[++i] : '';
    }
    if (key === 'seed') { parsed.seed = Number(value); continue; }
    if (key === 'count') { parsed.count = Number(value); continue; }
    if (key === 'sweep') { parsed.sweep = value; continue; }
    if (key === 'dialect') { parsed.dialect = value; continue; }
    if (key === 'config') { parsed.config = value; continue; }
    if (key === 'out') { parsed.out = value; continue; }
    parsed.values[key] = value;
  }
  return parsed;
}

// Small deterministic PRNG so `--random`/`--count` with `--seed N` is
// reproducible (e.g. in tests). A single generator threaded across every draw
// in a batch keeps the whole sequence deterministic for a fixed seed.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function helpText(): string {
  const axes = CATEGORY_NAMES.map((c) => `  --${c.toLowerCase()} <value>`).join('\n');
  return `cortex-enigma — compose AI image prompt(s) from the command line

Usage:
  bun run cli/cortex-prompt.ts [options]

Selection flags:
${axes}
  --foundation <text>   free-text base of the prompt
  --negative <text>     negative prompt appended after the positive prompt

Batch options:
  --sweep <axis>        emit one prompt per value of <axis>, others held fixed
  --count <n>           emit n randomized variations (use --seed for repeatability)
  --config <file>       JSON baseline (seed, count, sweep, dialect, out, base);
                        explicit CLI flags override its values
  --out <file>          write output to <file> instead of stdout
  --dialect <id>        render as standard | midjourney | natural

Options:
  --random              randomize all axes before applying explicit flags
  --seed <n>            deterministic seed used with --random / --count
  --list                print every axis and its allowed values, then exit
  --help                show this help, then exit

Examples:
  bun run cli/cortex-prompt.ts --foundation "a lone lighthouse" \\
    --medium painting --style surreal --negative "blurry, text"
  bun run cli/cortex-prompt.ts --sweep style --medium painting --dialect midjourney
  bun run cli/cortex-prompt.ts --count 30 --seed 7 --out variations.txt`;
}

function listText(): string {
  return CATEGORY_NAMES.map((c) => `${c}: ${CATEGORIES[c].join(', ')}`).join('\n');
}

function parseConfig(text: string): BatchConfig {
  const raw = JSON.parse(text) as Record<string, unknown>;
  const config: BatchConfig = {};
  if (typeof raw.seed === 'number') config.seed = raw.seed;
  if (typeof raw.count === 'number') config.count = raw.count;
  if (typeof raw.sweep === 'string') config.sweep = raw.sweep;
  if (typeof raw.dialect === 'string') config.dialect = raw.dialect;
  if (typeof raw.out === 'string') config.out = raw.out;
  if (raw.base && typeof raw.base === 'object') {
    const base: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw.base as Record<string, unknown>)) {
      if (typeof v === 'string') base[k] = v;
    }
    config.base = base;
  }
  return config;
}

// Map CLI-flag-shaped values (e.g. { medium: 'painting' }) onto SelectionState
// keys, warning about unknown flags / invalid axis values just as before.
function toRawSelection(flagValues: Record<string, string>, warnings: string[]): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const [flag, value] of Object.entries(flagValues)) {
    const key = FLAG_TO_KEY[flag];
    if (key === undefined) {
      warnings.push(`warning: unknown flag --${flag} (ignored)`);
      continue;
    }
    if (key !== 'foundation' && key !== 'negative' && value !== '' && !CATEGORIES[key]?.includes(value)) {
      warnings.push(`warning: "${value}" is not a valid ${key} value (ignored)`);
    }
    raw[key] = value;
  }
  return raw;
}

// Build one validated selection: optionally randomize a base, then layer the
// explicit values on top so explicit flags always win over randomization.
function composeSelection(explicit: Record<string, string>, rng?: () => number): SelectionState {
  const base = rng
    ? randomize(EMPTY_SELECTIONS, undefined, 'uniform', [], rng)
    : { ...EMPTY_SELECTIONS };
  return validate({ ...base, ...explicit });
}

type CliResult = { stdout: string; stderr: string; out?: string };

export type CliDeps = { readFile?: (path: string) => string };

export function runCli(argv: readonly string[], deps: CliDeps = {}): CliResult {
  const args = parseArgs(argv);
  if (args.help) return { stdout: helpText(), stderr: '' };
  if (args.list) return { stdout: listText(), stderr: '' };

  const warnings: string[] = [];

  let config: BatchConfig = {};
  if (args.config !== undefined) {
    if (!deps.readFile) {
      return { stdout: '', stderr: 'error: --config is not supported in this context' };
    }
    try {
      config = parseConfig(deps.readFile(args.config));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { stdout: '', stderr: `error: failed to load config ${args.config}: ${message}` };
    }
  }

  // Resolve dialect (CLI flag > config > default).
  let dialect: DialectId = DEFAULT_DIALECT;
  const dialectRaw = args.dialect ?? config.dialect;
  if (dialectRaw !== undefined) {
    if (isDialectId(dialectRaw)) dialect = dialectRaw;
    else warnings.push(`warning: unknown dialect "${dialectRaw}" (using ${DEFAULT_DIALECT})`);
  }

  const seed = args.seed ?? config.seed;
  const out = args.out ?? config.out;

  // Explicit selection values: config baseline first, then CLI flags override.
  const explicit = toRawSelection({ ...config.base, ...args.values }, warnings);

  let lines: string[];

  const sweepRaw = args.sweep ?? config.sweep;
  const count = args.count ?? config.count;

  if (sweepRaw !== undefined) {
    const axis = sweepRaw.toUpperCase();
    if (!CATEGORY_NAMES.includes(axis as never)) {
      warnings.push(`warning: "${sweepRaw}" is not a sweepable axis (ignored)`);
      lines = [renderPrompt(composeSelection(explicit), dialect)];
    } else {
      const held = composeSelection(explicit);
      lines = CATEGORIES[axis].map((value) => renderPrompt({ ...held, [axis]: value }, dialect));
    }
  } else if (count !== undefined && Number.isFinite(count) && count >= 1) {
    const rng = seed !== undefined && Number.isFinite(seed) ? mulberry32(seed) : Math.random;
    lines = Array.from({ length: Math.floor(count) }, () =>
      renderPrompt(composeSelection(explicit, rng), dialect),
    );
  } else {
    const rng = args.random
      ? (seed !== undefined && Number.isFinite(seed) ? mulberry32(seed) : Math.random)
      : undefined;
    lines = [renderPrompt(composeSelection(explicit, rng), dialect)];
  }

  return { stdout: lines.join('\n'), stderr: warnings.join('\n'), out };
}

const invokedPath = process.argv[1];
const isMain = invokedPath !== undefined && import.meta.url === pathToFileURL(invokedPath).href;
if (isMain) {
  const { stdout, stderr, out } = runCli(process.argv.slice(2), {
    readFile: (path) => fs.readFileSync(path, 'utf8'),
  });
  if (stderr) process.stderr.write(`${stderr}\n`);
  if (out !== undefined) {
    fs.writeFileSync(out, stdout === '' ? '' : `${stdout}\n`);
    process.stdout.write(`wrote ${out}\n`);
  } else if (stdout) {
    process.stdout.write(`${stdout}\n`);
  }
}
