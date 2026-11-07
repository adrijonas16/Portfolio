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
  check(
    (await page.locator('#book .pg-details').count()) === PROJECTS.length,
    `book has a page for each of ${PROJECTS.length} projects`,
  );
  check(
    (await page.locator('#book a.go').count()) === PROJECTS.filter((p) => p.live).length,
    'every live project has a button',
  );
  await page.locator('#bookNext').scrollIntoViewIfNeeded();
  await page.locator('#bookNext').click();
  await page.waitForTimeout(1200);
  await page.locator('#book .toc-row[data-goto="2"]').click();
  await page.waitForTimeout(1600);
  check(
    (await page.locator('#bookPos').textContent()).includes(PROJECTS[2].name) &&
      !(await page
        .locator('#book .leaf')
        .nth(4)
        .locator('.front')
        .evaluate((f) => f.inert)),
    'book opens and the index jumps to a project',
  );
  await page.evaluate(() => scrollTo(0, 0));

  await page.waitForTimeout(2500);
  check((await page.locator('#edCode .ln').count()) > 1, 'hero editor is typing');

  await page.evaluate(() => document.querySelector('#juegos').scrollIntoView());
  await page.locator('#lib-tab-raya').click();
  check(
    (await page.locator('#lib-page-raya').isVisible()) && !(await page.locator('#lib-page-bonk').isVisible()),
    'library: choosing a game opens its page',
  );
  await page.locator('#board .col').nth(3).click();
  const bothMoved = await page
    .waitForFunction(() => document.querySelectorAll('#board .chip').length === 2, null, { timeout: 8000 })
    .then(
      () => true,
      () => false,
    );
  check(bothMoved, '4 en Raya: player and machine both move');

  await page.evaluate(() => document.querySelector('#modelado').scrollIntoView());
  await page.waitForFunction(() => !document.querySelector('#vLoad'), null, { timeout: 60000 });
  check(true, '3D helmet loads');
  check(/Vértices \d/.test(await page.locator('#edStats').textContent()), '3D editor shows the real vertex count');
  await page.locator('.ed-shading [data-shade="wire"]').click();
  await page.locator('#livs [data-l="champion"]').click();
  check(
    (await page.locator('.ed-shading [data-shade="material"]').getAttribute('aria-checked')) === 'true',
    '3D editor: picking a finish switches back to the material view',
  );

  await page.evaluate(() => document.querySelector('#trayectoria').scrollIntoView());
  await page.locator('#git-bsg').click();
  check(
    (await page.locator('.gs-body[data-job="bsg"]').isVisible()) &&
      !(await page.locator('.gs-body[data-job="imb"]').isVisible()) &&
      (await page.locator('#gitGraph .git-lane').count()) > 0,
    'experience: choosing a branch in the git log shows that job',
  );

  await page.evaluate(() => document.querySelector('#path').scrollIntoView({ block: 'end' }));
  await page.waitForTimeout(1500);
  check((await page.locator('.stop.lit').count()) >= 1, 'formación: the path lights up while scrolling');

  for (const id of ['hero', 'productos', 'juegos', 'modelado', 'trayectoria', 'sobre', 'contacto']) {
    check(await page.locator(`#${id}`).isVisible(), `section #${id} is present`);
  }
} catch (e) {
  check(false, e.message);
}

check(errors.length === 0, `no page errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
await browser.close();
server.close();
process.exitCode = failures.length ? 1 : 0;
