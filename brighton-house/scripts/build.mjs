// Build script. Uses esbuild to bundle React + the 3D engine.
//   npm run build         -> dist/            (normal site: index.html + assets/)
//   npm run build:single  -> dist-single/     (everything inlined in one index.html)
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

const single = process.argv.includes('--single');
const outdir = single ? 'dist-single' : 'dist';

await fs.rm(outdir, { recursive: true, force: true });
await fs.mkdir(path.join(outdir, 'assets'), { recursive: true });

await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  outdir: path.join(outdir, 'assets'),
  entryNames: 'app',
  legalComments: 'none',
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
});

let html = await fs.readFile('index.html', 'utf8');

if (single) {
  const js = (await fs.readFile(path.join(outdir, 'assets/app.js'), 'utf8')).replace(/<\/script/gi, '<\\/script');
  const css = await fs.readFile(path.join(outdir, 'assets/app.css'), 'utf8');
  html = html
    .replace('<!-- @css -->', () => `<style>${css}</style>`)
    .replace('<!-- @js -->', () => `<script>${js}</script>`);
  await fs.rm(path.join(outdir, 'assets'), { recursive: true, force: true });
} else {
  html = html
    .replace('<!-- @css -->', '<link rel="stylesheet" href="assets/app.css" />')
    .replace('<!-- @js -->', '<script src="assets/app.js"></script>');
}

await fs.writeFile(path.join(outdir, 'index.html'), html);

// Copy anything in /public (images, brochure PDF, favicon...) next to the page.
try {
  await fs.cp('public', outdir, { recursive: true });
} catch {
  /* no public folder: fine */
}

const size = (await fs.stat(path.join(outdir, 'index.html'))).size;
console.log(`\nBuilt ${outdir}/index.html (${(size / 1024).toFixed(0)} KB)`);
