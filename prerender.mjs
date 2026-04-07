// Build the client and server bundles, then inject the SSR-rendered HTML
// (and styled-components style tags) into the final dist/index.html so the
// page is statically pre-rendered before being shipped to GitHub Pages.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');
const ssrDir = path.resolve(__dirname, 'dist-ssr');

const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd: __dirname });

console.log('▸ Building client bundle...');
run('vite build');

console.log('▸ Building server bundle...');
run('vite build --ssr src/entry-server.tsx --outDir dist-ssr');

console.log('▸ Pre-rendering HTML...');
const entryServerPath = path.join(ssrDir, 'entry-server.js');
const { render } = await import(pathToFileURL(entryServerPath).href);
const { html, styleTags } = render();

const templatePath = path.join(distDir, 'index.html');
const template = readFileSync(templatePath, 'utf-8');
const rendered = template
  .replace('<!--ssr-styles-->', styleTags)
  .replace('<!--ssr-html-->', html);
writeFileSync(templatePath, rendered);

console.log('▸ Cleaning up SSR bundle...');
rmSync(ssrDir, { recursive: true, force: true });

console.log('✓ Pre-render complete');
