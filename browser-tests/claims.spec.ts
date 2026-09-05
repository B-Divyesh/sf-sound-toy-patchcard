import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const demoPath = '/demo/';

async function openDemo(page: import('@playwright/test').Page) {
  await page.goto(demoPath);
  await expect(page.locator('#patch-widget')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
}

async function shareUrl(page: import('@playwright/test').Page, context: import('@playwright/test').BrowserContext) {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy share link' }).click();
  await expect(page.getByRole('region', { name: 'Share this card' })).toBeVisible();
  return page.evaluate(() => navigator.clipboard.readText());
}

test('@claim:installable-package installs the site download in a clean project', async ({ request }) => {
  const response = await request.get('/downloads/sociobot-patchcard-0.1.0.tgz');
  expect(response.ok()).toBe(true);
  const directory = mkdtempSync(join(tmpdir(), 'patchcard-install-'));
  const tarball = join(directory, 'patchcard.tgz');
  writeFileSync(tarball, await response.body());
  writeFileSync(join(directory, 'package.json'), '{"private":true,"type":"module"}\n');
  execFileSync('npm', ['install', tarball, '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: directory });
  const result = execFileSync('node', ['--input-type=module', '--eval',
    "import {createPatch,encodePatch,decodePatch} from '@sociobot/patchcard'; const p=createPatch({name:'Consumer card',toy:{name:'Toy'},parameters:[{id:'pitch',label:'Pitch',value:440}]}); process.stdout.write(String(decodePatch(encodePatch(p)).parameters[0].value));"
  ], { cwd: directory, encoding: 'utf8' }).trim();
  expect(result).toBe('440');
});

test('@claim:json-export downloads the current card as readable JSON', async ({ page }) => {
  await openDemo(page);
  await page.locator('#patch-name').fill('Workshop bell');
  await page.locator('[data-pc-param="pitch"]').fill('512');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('workshop-bell.patchcard.json');
  const path = await download.path();
  const card = JSON.parse(readFileSync(path!, 'utf8')) as { name: string; parameters: Array<{ id: string; value: unknown }> };
  expect(card.name).toBe('Workshop bell');
  expect(card.parameters.find((item) => item.id === 'pitch')?.value).toBe(512);
});

test('@claim:print-card sends the current card to browser print', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'print', { value: () => document.documentElement.setAttribute('data-print-called', 'true') });
  });
  await openDemo(page);
  await page.getByRole('button', { name: 'Print card' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-print-called', 'true');
});

test('@claim:share-reopen shows a QR code and reopens exact values in a fresh browser', async ({ page, context, browser }) => {
  await openDemo(page);
  await page.locator('#patch-name').fill('Boundary signal');
  await page.locator('[data-pc-param="pitch"]').fill('880');
  await page.locator('[data-pc-param="flutter"]').fill('1');
  await page.locator('[data-pc-param="voice"]').selectOption('square');
  await page.locator('[data-pc-param="echo"]').uncheck();
  const url = await shareUrl(page, context);
  await expect(page.locator('[data-pc-qr] svg')).toBeVisible();

  const secondDevice = await browser.newContext();
  const reopened = await secondDevice.newPage();
  await reopened.goto(url);
  await expect(reopened.locator('#patch-name')).toHaveValue('Boundary signal');
  await expect(reopened.locator('[data-pc-param="pitch"]')).toHaveValue('880');
  await expect(reopened.locator('[data-pc-param="flutter"]')).toHaveValue('1');
  await expect(reopened.locator('[data-pc-param="voice"]')).toHaveValue('square');
  await expect(reopened.locator('[data-pc-param="echo"]')).not.toBeChecked();
  await secondDevice.close();
});

test('@claim:wav-local downloads a valid WAV without an external request', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  const before = requests.length;
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Render WAV' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('saffron-echo.wav');
  const bytes = readFileSync((await download.path())!);
  expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
  expect(bytes.subarray(8, 12).toString()).toBe('WAVE');
  const origin = new URL(page.url()).origin;
  expect(requests.slice(before).filter((url) => new URL(url).origin !== origin)).toEqual([]);
});

test('@claim:local-save-delete isolates demo cards and supports reset', async ({ page }) => {
  const realValue = JSON.stringify([{ untouched: true }]);
  await page.addInitScript((value) => localStorage.setItem('patchcard:saved:v1', value), realValue);
  await openDemo(page);
  await page.locator('#patch-name').fill('Demo keeper');
  await page.getByRole('button', { name: 'Save card' }).click();
  await expect(page.getByRole('button', { name: /^Demo keeper Pocket oscillator/ })).toBeVisible();
  const keys = await page.evaluate(() => ({
    real: localStorage.getItem('patchcard:saved:v1'),
    demo: localStorage.getItem('demo:patchcard:saved:v1')
  }));
  expect(keys.real).toBe(realValue);
  expect(keys.demo).toContain('Demo keeper');

  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#patch-name')).toHaveValue('Demo keeper');
  await expect(page.getByRole('button', { name: /^Demo keeper Pocket oscillator/ })).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete Demo keeper' }).click();
  await expect(page.getByText('No cards saved.')).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#patch-name')).toHaveValue('Saffron echo');
  await expect(page.getByText('Sample restored.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('patchcard:saved:v1'))).toBe(realValue);

  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/u);
  expect(await page.evaluate(() => ({
    real: localStorage.getItem('patchcard:saved:v1'),
    demo: localStorage.getItem('demo:patchcard:saved:v1')
  }))).toEqual({ real: realValue, demo: null });
});

test('@claim:offline-shell reloads the demo offline after one visit', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(new URL(demoPath, baseURL).toString());
  await expect(page.locator('#patch-widget')).toHaveAttribute('aria-busy', 'false');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  await page.reload();
  await context.setOffline(true);
  await expect(page.locator('[data-offline]')).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Try a sample sound card' })).toBeVisible();
  await expect(page.locator('[data-offline]')).toBeVisible();
  await context.close();
});

test('@claim:local-private keeps a full demo flow on the product origin', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ acceptDownloads: true });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const requests: string[] = [];
  const page = await context.newPage();
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(new URL(demoPath, baseURL).toString());
  await expect(page.locator('#patch-widget')).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('button', { name: 'Save card' }).click();
  await page.getByRole('button', { name: 'Copy share link' }).click();
  await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export JSON' }).click()
  ]);
  const productOrigin = new URL(baseURL!).origin;
  expect([...new Set(requests.map((url) => new URL(url).origin))]).toEqual([productOrigin]);
  expect(requests.map((url) => new URL(url).pathname).filter((path) =>
    !/^\/(?:demo\/|assets\/|release\.json$|sw\.js$|skip-link\.js$|favicon\.svg$|manifest\.webmanifest$)/u.test(path)
  )).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  await expect(page.locator('input[type="email"], input[type="password"], form[action]')).toHaveCount(0);
  const storage = await page.evaluate(() => Object.keys(localStorage));
  expect(storage).toEqual(['demo:patchcard:saved:v1']);
  await context.close();
});

test('@claim:package-outputs ships both module formats and documented files', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'patchcard-package-'));
  const tarball = resolve('dist/site/downloads/sociobot-patchcard-0.1.0.tgz');
  writeFileSync(join(directory, 'package.json'), '{"private":true}\n');
  execFileSync('npm', ['install', tarball, '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: directory });
  const packageRoot = join(directory, 'node_modules/@sociobot/patchcard');
  for (const file of ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'dist/style.css', 'schema/patchcard-v1.schema.json', 'docs/format.md', 'LICENSE']) {
    expect(readFileSync(join(packageRoot, file)).byteLength).toBeGreaterThan(20);
  }
  const cjs = execFileSync('node', ['--eval', "const p=require('@sociobot/patchcard'); console.log(typeof p.createPatch)"], { cwd: directory, encoding: 'utf8' }).trim();
  expect(cjs).toBe('function');
  const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as { license: string };
  expect(manifest.license).toBe('MIT');
});

test('@claim:accessible-widget works by keyboard and has no serious axe findings', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await openDemo(page);
  const slider = page.locator('[data-pc-param="pitch"]');
  await slider.focus();
  const before = Number(await slider.inputValue());
  await page.keyboard.press('ArrowRight');
  expect(Number(await slider.inputValue())).toBe(before + 1);
  const toggle = page.locator('[data-pc-param="echo"]');
  await toggle.focus();
  const wasChecked = await toggle.isChecked();
  await page.keyboard.press('Space');
  expect(await toggle.isChecked()).toBe(!wasChecked);
  await page.getByRole('button', { name: 'Save card' }).focus();
  expect(await page.getByRole('button', { name: 'Save card' }).evaluate((node) => getComputedStyle(node).outlineWidth)).toBe('3px');
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
});

test('@claim:json-import opens valid cards and keeps the current card after an invalid file', async ({ page }) => {
  await openDemo(page);
  const valid = {
    format: 'patchcard', version: 1, id: 'imported-card', name: 'Imported bell',
    createdAt: '2026-09-05T00:00:00.000Z', toy: { name: 'Workshop toy' },
    parameters: [{ id: 'pitch', label: 'Pitch', value: 640, min: 80, max: 880 }]
  };
  await page.locator('#patch-import').setInputFiles({ name: 'card.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(valid)) });
  await expect(page.locator('#patch-name')).toHaveValue('Imported bell');
  await expect(page.locator('[data-pc-param="pitch"]')).toHaveValue('640');
  await page.locator('#patch-import').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await expect(page.locator('[data-import-error]')).toBeVisible();
  await expect(page.locator('#patch-name')).toHaveValue('Imported bell');
  await expect(page.locator('[data-pc-param="pitch"]')).toHaveValue('640');
});

test('empty names and damaged links recover without replacing or saving the current card', async ({ page }) => {
  await page.goto('/demo/?patch=damaged');
  await expect(page.locator('[data-import-error]')).toBeVisible();
  await expect(page.locator('#patch-name')).toHaveValue('Saffron echo');
  await page.locator('#patch-name').fill('');
  await page.getByRole('button', { name: 'Save card' }).click();
  await expect(page.locator('#patch-name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#patch-name-error')).toHaveText('Enter a card name before saving.');
  await expect(page.getByRole('button', { name: /^Saffron echo Pocket oscillator/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('demo:patchcard:saved:v1'))).toBeNull();
});
