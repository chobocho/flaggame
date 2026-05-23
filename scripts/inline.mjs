import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const releaseDir = join(root, 'release');
const htmlPath = join(distDir, 'index.html');
const assetsDir = join(distDir, 'assets');

if (!existsSync(htmlPath)) {
  console.error(`[inline] missing ${htmlPath}. Run vite build first.`);
  process.exit(1);
}

let html = readFileSync(htmlPath, 'utf8');

const jsFiles = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
const cssFiles = readdirSync(assetsDir).filter((f) => f.endsWith('.css'));

for (const css of cssFiles) {
  const code = readFileSync(join(assetsDir, css), 'utf8');
  const linkRe = new RegExp(`<link[^>]*href="[^"]*${css}"[^>]*>`);
  html = html.replace(linkRe, `<style>${code}</style>`);
}

for (const js of jsFiles) {
  const code = readFileSync(join(assetsDir, js), 'utf8');
  const scriptRe = new RegExp(`<script[^>]*src="[^"]*${js}"[^>]*></script>`);
  const safe = code.replace(/<\/script>/g, '<\\/script>');
  html = html.replace(scriptRe, `<script type="module">${safe}</script>`);
}

if (existsSync(releaseDir)) rmSync(releaseDir, { recursive: true, force: true });
mkdirSync(releaseDir, { recursive: true });
writeFileSync(join(releaseDir, 'index.html'), html, 'utf8');

const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(`[inline] release/index.html (${sizeKb} KB)`);
