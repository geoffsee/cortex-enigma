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
});
