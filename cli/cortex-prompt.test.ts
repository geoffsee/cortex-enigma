import { describe, it, expect } from 'vitest';
import { runCli } from './cortex-prompt';
import { CATEGORIES, CATEGORY_NAMES } from '../src/core';

describe('runCli', () => {
  it('composes a full prompt end-to-end from flags', () => {
    const { stdout, stderr } = runCli([
      '--foundation', 'a lone lighthouse',
      '--medium', 'painting',
      '--style', 'surreal',
      '--negative', 'blurry, text',
    ]);
    expect(stdout).toBe('a lone lighthouse, painting, surreal\nNegative prompt: blurry, text');
    expect(stderr).toBe('');
  });

  it('supports --flag=value form', () => {
    const { stdout } = runCli(['--subject=figure', '--context=studio']);
    expect(stdout).toBe('figure, in a studio context');
  });

  it('returns an empty prompt when no selections are given', () => {
    expect(runCli([]).stdout).toBe('');
  });

  it('warns about and ignores invalid category values', () => {
    const { stdout, stderr } = runCli(['--medium', 'banana', '--subject', 'figure']);
    expect(stdout).toBe('figure');
    expect(stderr).toContain('not a valid MEDIUM value');
  });

  it('warns about unknown flags', () => {
    const { stderr } = runCli(['--bogus', 'x']);
    expect(stderr).toContain('unknown flag --bogus');
  });

  it('produces a deterministic, valid selection for --random --seed', () => {
    const first = runCli(['--random', '--seed', '42']).stdout;
    const second = runCli(['--random', '--seed', '42']).stdout;
    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(0);
  });

  it('lets explicit flags override --random', () => {
    const { stdout } = runCli(['--random', '--seed', '1', '--medium', 'painting']);
    expect(stdout).toContain('painting');
  });

  it('--list reports every axis and its allowed values', () => {
    const { stdout } = runCli(['--list']);
    for (const cat of CATEGORY_NAMES) {
      expect(stdout).toContain(`${cat}: ${CATEGORIES[cat].join(', ')}`);
    }
  });

  it('--help returns usage text', () => {
    expect(runCli(['--help']).stdout).toContain('Usage:');
  });

  it('renders a single prompt in the midjourney dialect', () => {
    const { stdout } = runCli([
      '--foundation', 'a lone lighthouse',
      '--medium', 'painting',
      '--negative', 'blurry',
      '--dialect', 'midjourney',
    ]);
    expect(stdout).toBe('a lone lighthouse, painting --no blurry');
  });

  it('warns about and ignores an unknown dialect', () => {
    const { stdout, stderr } = runCli(['--subject', 'figure', '--dialect', 'bogus']);
    expect(stdout).toBe('figure');
    expect(stderr).toContain('unknown dialect "bogus"');
  });

  it('--sweep emits one prompt per value of the chosen axis, holding others fixed', () => {
    const { stdout } = runCli(['--medium', 'painting', '--sweep', 'style']);
    const lines = stdout.split('\n');
    expect(lines).toHaveLength(CATEGORIES.STYLE.length);
    for (const value of CATEGORIES.STYLE) {
      expect(lines).toContain(`painting, ${value}`);
    }
  });

  it('warns about and ignores a non-sweepable axis', () => {
    const { stdout, stderr } = runCli(['--subject', 'figure', '--sweep', 'nope']);
    expect(stdout).toBe('figure');
    expect(stderr).toContain('is not a sweepable axis');
  });

  it('--count emits N deterministic variations for a fixed seed', () => {
    const first = runCli(['--count', '5', '--seed', '7']).stdout;
    const second = runCli(['--count', '5', '--seed', '7']).stdout;
    expect(first).toBe(second);
    expect(first.split('\n')).toHaveLength(5);
    expect(first).not.toBe(runCli(['--count', '5', '--seed', '8']).stdout);
  });

  it('--count keeps explicit flags fixed across every variation', () => {
    const { stdout } = runCli(['--count', '4', '--seed', '3', '--medium', 'painting']);
    const lines = stdout.split('\n');
    expect(lines).toHaveLength(4);
    for (const line of lines) expect(line).toContain('painting');
  });

  it('drives a batch from an injected config file, with CLI flags overriding it', () => {
    const readFile = () =>
      JSON.stringify({ seed: 7, count: 3, dialect: 'midjourney', base: { medium: 'sculpture' } });
    const fromConfig = runCli(['--config', 'batch.json'], { readFile });
    expect(fromConfig.stdout.split('\n')).toHaveLength(3);
    for (const line of fromConfig.stdout.split('\n')) expect(line).toContain('sculpture');

    const overridden = runCli(['--config', 'batch.json', '--medium', 'painting'], { readFile });
    for (const line of overridden.stdout.split('\n')) {
      expect(line).toContain('painting');
      expect(line).not.toContain('sculpture');
    }
  });

  it('surfaces the resolved output path without performing I/O', () => {
    const { out } = runCli(['--subject', 'figure', '--out', 'prompts.txt']);
    expect(out).toBe('prompts.txt');
  });

  it('reports an error when the config file cannot be read', () => {
    const readFile = () => { throw new Error('ENOENT'); };
    const { stdout, stderr } = runCli(['--config', 'missing.json'], { readFile });
    expect(stdout).toBe('');
    expect(stderr).toContain('failed to load config');
  });
});
