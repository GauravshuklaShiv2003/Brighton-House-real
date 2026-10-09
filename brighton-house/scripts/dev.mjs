// Dev server with auto-reload. Run:  npm run dev   then open http://localhost:5173
import { context } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

const outdir = 'dist-dev';
await fs.rm(outdir, { recursive: true, force: true });
await fs.mkdir(path.join(outdir, 'assets'), { recursive: true });

const ctx = await context({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  sourcemap: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  outdir: path.join(outdir, 'assets'),
  entryNames: 'app',
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'info',
});

let html = await fs.readFile('index.html', 'utf8');
html = html
  .replace('<!-- @css -->', '<link rel="stylesheet" href="assets/app.css" />')
  .replace(
    '<!-- @js -->',
    `<script src="assets/app.js"></script>
  <script>new EventSource('/esbuild').addEventListener('change', () => location.reload());</script>`
  );
await fs.writeFile(path.join(outdir, 'index.html'), html);
try { await fs.cp('public', outdir, { recursive: true }); } catch { /* optional */ }

await ctx.watch();
const { port } = await ctx.serve({ servedir: outdir, port: 5173 });
console.log(`\nBrighton House dev server: http://localhost:${port}\n(Save any file and the page reloads.)`);
