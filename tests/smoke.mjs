// Smoke test: builds nothing, serves dist/ and checks every section in a real browser.
// Run: npm run build && node tests/smoke.mjs
// First time on a new machine: npx playwright install chromium
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { PROJECTS } from '../src/data/projects.js';

const DIST = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../dist');
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(DIST, url === '/' ? 'index.html' : url);
  if (!file.startsWith(DIST) || !fs.existsSync(file)) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const failures = [];
const check = (ok, message) => {
  console.log(`${ok ? '✓' : '✖'} ${message}`);
  if (!ok) failures.push(message);
};

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: '', contentType: 'text/css' }));

try {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.body.classList.contains('loading'), null, { timeout: 15000 });
  check(true, 'loader finishes and releases the page');

  check((await page.evaluate(() => scrollY)) === 0, 'page opens at the top');
  check((await page.locator('#track .pn').count()) === PROJECTS.length, `renders ${PROJECTS.length} project panels`);
  check(
    (await page.locator('#track a.go').count()) === PROJECTS.filter((p) => p.live).length,
    'every live project has a button',
  );

  await page.waitForTimeout(2500);
  check((await page.locator('#edCode .ln').count()) > 1, 'hero editor is typing');

  await page.evaluate(() => document.querySelector('#raya').scrollIntoView());
  await page.locator('#board .col').nth(3).click();
  await page.waitForTimeout(1200);
  check((await page.locator('#board .chip').count()) === 2, '4 en Raya: player and machine both move');

  await page.evaluate(() => document.querySelector('#modelado').scrollIntoView());
  await page.waitForFunction(() => !document.querySelector('#vLoad'), null, { timeout: 60000 });
  check(true, '3D helmet loads');

  for (const id of ['hero', 'productos', 'juegos', 'bonk', 'raya', 'modelado', 'trayectoria', 'sobre', 'contacto']) {
    check(await page.locator(`#${id}`).isVisible(), `section #${id} is present`);
  }
} catch (e) {
  check(false, e.message);
}

check(errors.length === 0, `no page errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
await browser.close();
server.close();
process.exitCode = failures.length ? 1 : 0;
