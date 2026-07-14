import { describe, it, expect } from 'vitest';
import { handleRequest, callTool, SERVER_INFO, PROTOCOL_VERSION } from './cortex-mcp';
import { CATEGORIES, CATEGORY_NAMES, PROMPT_DIALECTS } from '../src/core';

describe('handleRequest (MCP JSON-RPC)', () => {
  it('responds to initialize with protocol version and server info', () => {
    const res = handleRequest({ jsonrpc: '2.0', id: 1, method: 'initialize' });
    expect(res).toEqual({
      jsonrpc: '2.0',
      id: 1,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      },
    });
  });

  it('returns no response for the initialized notification', () => {
    expect(handleRequest({ jsonrpc: '2.0', method: 'notifications/initialized' })).toBeNull();
  });

  it('lists every tool with an input schema', () => {
    const res = handleRequest({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const tools = (res?.result as { tools: Array<{ name: string; inputSchema: unknown }> }).tools;
    expect(tools.map((t) => t.name).sort()).toEqual([
      'axis_sweep',
      'build_prompt',
      'list_axes',
      'list_dialects',
    ]);
    for (const tool of tools) expect(tool.inputSchema).toBeDefined();
  });

  it('errors with -32601 for an unknown method', () => {
    const res = handleRequest({ jsonrpc: '2.0', id: 3, method: 'does/not/exist' });
    expect(res?.error?.code).toBe(-32601);
  });

  it('errors with -32602 when tools/call omits a tool name', () => {
    const res = handleRequest({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: {} });
    expect(res?.error?.code).toBe(-32602);
  });

  it('builds a prompt end-to-end through tools/call', () => {
    const res = handleRequest({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'build_prompt',
        arguments: { foundation: 'a lone lighthouse', medium: 'painting', style: 'surreal' },
      },
    });
    expect(res?.result).toEqual({
      content: [{ type: 'text', text: 'a lone lighthouse, painting, surreal' }],
      isError: false,
    });
  });
});

describe('callTool', () => {
  it('renders a prompt in the midjourney dialect', () => {
    const { text, isError } = callTool('build_prompt', {
      foundation: 'a lone lighthouse',
      medium: 'painting',
      negative: 'blurry',
      dialect: 'midjourney',
    });
    expect(isError).toBe(false);
    expect(text).toBe('a lone lighthouse, painting --no blurry');
  });

  it('flags an invalid axis value as an error result', () => {
    const { text, isError } = callTool('build_prompt', { medium: 'banana' });
    expect(isError).toBe(true);
    expect(text).toContain('not a valid MEDIUM value');
  });

  it('flags an unknown dialect as an error result', () => {
    const { text, isError } = callTool('build_prompt', { subject: 'figure', dialect: 'bogus' });
    expect(isError).toBe(true);
    expect(text).toContain('unknown dialect');
  });

  it('sweeps an axis, emitting one prompt per value with others held fixed', () => {
    const { text, isError } = callTool('axis_sweep', { medium: 'painting', axis: 'style' });
    expect(isError).toBe(false);
    const lines = text.split('\n');
    expect(lines).toHaveLength(CATEGORIES.STYLE.length);
    for (const value of CATEGORIES.STYLE) expect(lines).toContain(`painting, ${value}`);
  });

  it('flags a non-sweepable axis as an error result', () => {
    const { text, isError } = callTool('axis_sweep', { axis: 'nope' });
    expect(isError).toBe(true);
    expect(text).toContain('is not a sweepable axis');
  });

  it('lists every axis and its allowed values', () => {
    const { text } = callTool('list_axes');
    for (const cat of CATEGORY_NAMES) {
      expect(text).toContain(`${cat}: ${CATEGORIES[cat].join(', ')}`);
    }
  });

  it('lists every dialect', () => {
    const { text } = callTool('list_dialects');
    for (const dialect of PROMPT_DIALECTS) expect(text).toContain(dialect.id);
  });

  it('flags an unknown tool as an error result', () => {
    const { isError } = callTool('no_such_tool');
    expect(isError).toBe(true);
  });
});
