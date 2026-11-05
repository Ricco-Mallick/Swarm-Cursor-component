import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = 4179;
const executablePath = process.env.CHROME_PATH || ['/usr/local/bin/google-chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
let server, browser;

before(async () => {
  server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'pipe' });
  await new Promise((r) => server.stdout.once('data', r));
  browser = await chromium.launch({ executablePath, args: ['--autoplay-policy=no-user-gesture-required'] });
});
after(async () => { await browser?.close(); server?.kill(); });

const hiddenCount = (page, sel) => page.$eval(sel, (host) => [...host.querySelectorAll('*')].filter((el) => el.style.visibility === 'hidden' || el.style.clipPath).length);

test('hero builds, completes and leaves no inline styles behind', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/fonts/.test(m.text()) && errors.push(m.text()));
  await page.goto(`http://localhost:${PORT}/`);
  const events = await page.evaluate(() => new Promise((resolve) => {
    const hero = document.querySelector('#hero');
    const seen = [];
    if (hero.state === 'building') seen.push('swarmstart');
    ['swarmstart', 'swarmcomplete', 'swarmend'].forEach((t) => hero.addEventListener(t, () => { seen.push(t); if (t === 'swarmend') resolve(seen); }));
  }));
  assert.ok(events.includes('swarmcomplete') && events.includes('swarmend'));
  await page.waitForTimeout(100);
  assert.equal(await hiddenCount(page, '#hero'), 0);
  assert.equal(await page.$eval('#hero', (h) => h.shadowRoot.querySelector('.layer').children.length), 0);
  assert.deepEqual(errors, []);
});

test('content is hidden mid-build and cursors are visible', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(600);
  const info = await page.$eval('#hero', (h) => ({ state: h.state, agents: h.shadowRoot.querySelectorAll('.agent').length }));
  assert.equal(info.state, 'building');
  assert.equal(info.agents, 6);
  assert.ok((await hiddenCount(page, '#hero')) > 0);
});

test('playground: replay, finish, scroll-gated section and reduced motion', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`http://localhost:${PORT}/`);
  await page.locator('#playground').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#pg').state === 'building');
  await page.click('#pg-finish');
  assert.equal(await page.$eval('#pg', (h) => h.state), 'done');
  assert.equal(await hiddenCount(page, '#pg'), 0);
  await page.click('#pg-replay');
  assert.equal(await page.$eval('#pg', (h) => h.state), 'building');
  await page.waitForFunction(() => document.querySelector('#pg').state === 'done', null, { timeout: 30000 });
  assert.equal(await hiddenCount(page, '#pg'), 0);

  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const rm = await ctx.newPage();
  await rm.goto(`http://localhost:${PORT}/`);
  await rm.waitForTimeout(400);
  assert.equal(await hiddenCount(rm, '#hero'), 0);
  assert.equal(await rm.$eval('#hero', (h) => h.state), 'done');
  await ctx.close();
});
