// Build the client and server bundles, then inject the SSR-rendered HTML
// (and styled-components style tags) into the final dist/index.html so the
// page is statically pre-rendered before being shipped to GitHub Pages.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');
const ssrDir = path.resolve(__dirname, 'dist-ssr');
const require = createRequire(import.meta.url);

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

console.log('▸ Running accessibility audit...');
const { JSDOM } = await import('jsdom');
const dom = new JSDOM(rendered, { url: 'https://localhost/' });

// Expose jsdom globals so axe-core's CJS initialisation can reference `document`
// and other browser APIs. Restored immediately after axe loads.
const jsdomGlobals = ['window', 'document', 'Node', 'Element', 'HTMLElement', 'MutationObserver'];
const savedGlobals = Object.fromEntries(jsdomGlobals.map((k) => [k, global[k]]));
for (const k of jsdomGlobals) global[k] = dom.window[k];

const axe = require('axe-core');

for (const k of jsdomGlobals) global[k] = savedGlobals[k];

const axeResults = await new Promise((resolve, reject) => {
  axe.run(dom.window.document, (err, results) => {
    if (err) reject(new Error(String(err)));
    else resolve(results);
  });
});

const critical = axeResults.violations.filter((v) => v.impact === 'critical');
if (critical.length > 0) {
  console.error('✗ Accessibility audit failed — critical violations:');
  critical.forEach((v) => {
    console.error(`  [${v.id}] ${v.description}`);
    v.nodes.slice(0, 3).forEach((n) => console.error(`    → ${n.failureSummary}`));
  });
  process.exit(1);
}
console.log(`✓ Accessibility audit passed (${axeResults.violations.length} total violations, 0 critical)`);

console.log('▸ Cleaning up SSR bundle...');
rmSync(ssrDir, { recursive: true, force: true });

console.log('✓ Pre-render complete');
