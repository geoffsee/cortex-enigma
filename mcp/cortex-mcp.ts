// Model Context Protocol (MCP) server exposing the cortex-enigma prompt-
// composition domain as agent-callable tools.
//
// Like the CLI in `cli/`, this is a headless consumer of `src/core`: it pulls
// in NO React or browser runtime, only the validated domain logic the browser
// app uses. It speaks JSON-RPC 2.0 over stdio (newline-delimited messages) —
// the MCP stdio transport — with a hand-rolled dispatcher so no external SDK
// dependency is added. Run it with `bun run mcp/cortex-mcp.ts` and connect an
// MCP-capable agent (see README "Agent Interface").
//
// Tools mirror the shipped programmatic surface:
//   build_prompt   — compose one prompt from axis selections + optional dialect
//   axis_sweep     — one prompt per value of a chosen axis (others held fixed)
//   list_axes      — every axis and its allowed values
//   list_dialects  — available output dialects and their descriptions

import process from 'node:process';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';
import {
  CATEGORIES,
  CATEGORY_NAMES,
  PROMPT_DIALECTS,
  DEFAULT_DIALECT,
  isDialectId,
  renderPrompt,
  validate,
  type CategoryName,
  type DialectId,
  type SelectionState,
} from '../src/core';

export const SERVER_INFO = { name: 'cortex-enigma-prompt', version: '0.1.0' };
export const PROTOCOL_VERSION = '2024-11-05';

const AXIS_FLAGS = CATEGORY_NAMES.map((c) => c.toLowerCase());
const DIALECT_IDS = PROMPT_DIALECTS.map((d) => d.id);

// ---- JSON-RPC 2.0 types --------------------------------------------------

type JsonRpcId = string | number | null;

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: JsonRpcId;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: JsonRpcId;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

// ---- Tool schemas --------------------------------------------------------

function axisProperties(): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const axis of CATEGORY_NAMES) {
    props[axis.toLowerCase()] = {
      type: 'string',
      enum: CATEGORIES[axis],
      description: `${axis} axis selection.`,
    };
  }
  return props;
}

const FOUNDATION_PROP = { type: 'string', description: 'Free-text base of the prompt.' };
const NEGATIVE_PROP = { type: 'string', description: 'Terms to exclude (negative prompt).' };
const DIALECT_PROP = {
  type: 'string',
  enum: DIALECT_IDS,
  description: `Output syntax (default "${DEFAULT_DIALECT}").`,
};

const TOOLS = [
  {
    name: 'build_prompt',
    description:
      'Compose a single AI image prompt from axis selections and an optional output dialect.',
    inputSchema: {
      type: 'object',
      properties: {
        foundation: FOUNDATION_PROP,
        negative: NEGATIVE_PROP,
        ...axisProperties(),
        dialect: DIALECT_PROP,
      },
      additionalProperties: false,
    },
  },
  {
    name: 'axis_sweep',
    description:
      'Emit one prompt per allowed value of a chosen axis, holding every other selection fixed.',
    inputSchema: {
      type: 'object',
      properties: {
        axis: { type: 'string', enum: AXIS_FLAGS, description: 'Axis to sweep across.' },
        foundation: FOUNDATION_PROP,
        negative: NEGATIVE_PROP,
        ...axisProperties(),
        dialect: DIALECT_PROP,
      },
      required: ['axis'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_axes',
    description: 'List every prompt axis and its allowed values.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'list_dialects',
    description: 'List available output dialects and their descriptions.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

// ---- Tool implementations ------------------------------------------------

// Thrown for caller-facing problems (bad axis value, unknown dialect); the
// dispatcher turns it into an MCP `isError` tool result rather than a protocol
// error, so agents get actionable feedback in the tool output itself.
class ToolError extends Error {}

function resolveDialect(args: Record<string, unknown>): DialectId {
  const raw = args.dialect;
  if (raw === undefined) return DEFAULT_DIALECT;
  if (typeof raw !== 'string' || !isDialectId(raw)) {
    throw new ToolError(`unknown dialect "${String(raw)}". Allowed: ${DIALECT_IDS.join(', ')}`);
  }
  return raw;
}

function toSelection(args: Record<string, unknown>): SelectionState {
  const raw: Record<string, string> = {};
  for (const axis of CATEGORY_NAMES) {
    const value = args[axis.toLowerCase()];
    if (value === undefined) continue;
    if (typeof value !== 'string') throw new ToolError(`${axis.toLowerCase()} must be a string`);
    if (value !== '' && !CATEGORIES[axis].includes(value)) {
      throw new ToolError(
        `"${value}" is not a valid ${axis} value. Allowed: ${CATEGORIES[axis].join(', ')}`,
      );
    }
    raw[axis] = value;
  }
  for (const key of ['foundation', 'negative'] as const) {
    const value = args[key];
    if (value === undefined) continue;
    if (typeof value !== 'string') throw new ToolError(`${key} must be a string`);
    raw[key] = value;
  }
  return validate(raw);
}

function toolBuildPrompt(args: Record<string, unknown>): string {
  const dialect = resolveDialect(args);
  return renderPrompt(toSelection(args), dialect);
}

function toolAxisSweep(args: Record<string, unknown>): string {
  const axisRaw = args.axis;
  if (typeof axisRaw !== 'string') throw new ToolError('axis is required');
  const axis = axisRaw.toUpperCase() as CategoryName;
  if (!CATEGORY_NAMES.includes(axis)) {
    throw new ToolError(`"${axisRaw}" is not a sweepable axis. Allowed: ${AXIS_FLAGS.join(', ')}`);
  }
  const dialect = resolveDialect(args);
  const held = toSelection(args);
  return CATEGORIES[axis].map((value) => renderPrompt({ ...held, [axis]: value }, dialect)).join('\n');
}

function toolListAxes(): string {
  return CATEGORY_NAMES.map((c) => `${c}: ${CATEGORIES[c].join(', ')}`).join('\n');
}

function toolListDialects(): string {
  return PROMPT_DIALECTS.map((d) => `${d.id} — ${d.description}`).join('\n');
}

export function callTool(
  name: string,
  args: Record<string, unknown> = {},
): { text: string; isError: boolean } {
  try {
    switch (name) {
      case 'build_prompt':
        return { text: toolBuildPrompt(args), isError: false };
      case 'axis_sweep':
        return { text: toolAxisSweep(args), isError: false };
      case 'list_axes':
        return { text: toolListAxes(), isError: false };
      case 'list_dialects':
        return { text: toolListDialects(), isError: false };
      default:
        return { text: `unknown tool: ${name}`, isError: true };
    }
  } catch (err) {
    return { text: err instanceof Error ? err.message : String(err), isError: true };
  }
}

// ---- JSON-RPC dispatch ---------------------------------------------------

function reply(id: JsonRpcId | undefined, result: unknown): JsonRpcResponse | null {
  if (id === undefined) return null;
  return { jsonrpc: '2.0', id, result };
}

function errorResponse(
  id: JsonRpcId | undefined,
  code: number,
  message: string,
): JsonRpcResponse | null {
  if (id === undefined) return null;
  return { jsonrpc: '2.0', id, error: { code, message } };
}

// Returns the response to write, or null for notifications (no `id`) and other
// messages that warrant no reply.
export function handleRequest(request: JsonRpcRequest): JsonRpcResponse | null {
  const { method, id } = request;
  switch (method) {
    case 'initialize':
      return reply(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
    case 'notifications/initialized':
    case 'initialized':
      return null;
    case 'ping':
      return reply(id, {});
    case 'tools/list':
      return reply(id, { tools: TOOLS });
    case 'tools/call': {
      const params = (request.params ?? {}) as {
        name?: unknown;
        arguments?: Record<string, unknown>;
      };
      if (typeof params.name !== 'string') {
        return errorResponse(id, -32602, 'tools/call requires a string "name"');
      }
      const { text, isError } = callTool(params.name, params.arguments ?? {});
      return reply(id, { content: [{ type: 'text', text }], isError });
    }
    default:
      return errorResponse(id, -32601, `method not found: ${method}`);
  }
}

// ---- stdio transport -----------------------------------------------------

function main(): void {
  const rl = createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let request: JsonRpcRequest;
    try {
      request = JSON.parse(trimmed) as JsonRpcRequest;
    } catch {
      process.stdout.write(
        `${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'parse error' } })}\n`,
      );
      return;
    }
    const response = handleRequest(request);
    if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
  });
}

const invokedPath = process.argv[1];
const isMain = invokedPath !== undefined && import.meta.url === pathToFileURL(invokedPath).href;
if (isMain) main();
