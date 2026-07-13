// Headless CLI consumer of the cortex-enigma prompt-composition package.
//
// Proves the domain logic runs with no React/browser runtime: it maps
// command-line flags onto a SelectionState, runs it through the same
// `validate` -> `buildPrompt` functions the browser app uses, and prints the
// composed prompt to stdout. Run it with `bun run cli/cortex-prompt.ts`.

import process from 'node:process';
import { pathToFileURL } from 'node:url';
import {
  buildPrompt,
  randomize,
  validate,
  CATEGORIES,
  CATEGORY_NAMES,
  EMPTY_SELECTIONS,
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
  values: Record<string, string>;
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
    parsed.values[key] = value;
  }
  return parsed;
}

// Small deterministic PRNG so `--random --seed N` is reproducible (e.g. in tests).
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
  return `cortex-enigma — compose an AI image prompt from the command line

Usage:
  bun run cli/cortex-prompt.ts [options]

Selection flags:
${axes}
  --foundation <text>   free-text base of the prompt
  --negative <text>     negative prompt appended after the positive prompt

Options:
  --random              randomize all axes before applying explicit flags
  --seed <n>            deterministic seed used with --random
  --list                print every axis and its allowed values, then exit
  --help                show this help, then exit

Example:
  bun run cli/cortex-prompt.ts --foundation "a lone lighthouse" \\
    --medium painting --style surreal --negative "blurry, text"`;
}

function listText(): string {
  return CATEGORY_NAMES.map((c) => `${c}: ${CATEGORIES[c].join(', ')}`).join('\n');
}

type CliResult = { stdout: string; stderr: string };

export function runCli(argv: readonly string[]): CliResult {
  const args = parseArgs(argv);
  if (args.help) return { stdout: helpText(), stderr: '' };
  if (args.list) return { stdout: listText(), stderr: '' };

  const warnings: string[] = [];

  let base: SelectionState = { ...EMPTY_SELECTIONS };
  if (args.random) {
    const rng = args.seed !== undefined && Number.isFinite(args.seed)
      ? mulberry32(args.seed)
      : Math.random;
    base = randomize(EMPTY_SELECTIONS, undefined, 'uniform', [], rng);
  }

  const raw: Record<string, string> = { ...base };
  for (const [flag, value] of Object.entries(args.values)) {
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

  const selections = validate(raw);
  return { stdout: buildPrompt(selections), stderr: warnings.join('\n') };
}

const invokedPath = process.argv[1];
const isMain = invokedPath !== undefined && import.meta.url === pathToFileURL(invokedPath).href;
if (isMain) {
  const { stdout, stderr } = runCli(process.argv.slice(2));
  if (stderr) process.stderr.write(`${stderr}\n`);
  if (stdout) process.stdout.write(`${stdout}\n`);
}
