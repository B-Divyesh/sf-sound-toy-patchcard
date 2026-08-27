import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const base = process.env.PATCHCARD_TEST_URL ?? 'http://127.0.0.1:4173';
const browser = await chromium.launch();
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => consoleErrors.push(error.message));

try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('#patch-widget[aria-busy="false"]').waitFor();
  await page.locator('[data-pc-param="pitch"]').fill('330');
  await page.getByRole('button', { name: 'Save specimen' }).click();
  await page.getByRole('button', { name: /^Moss radio Field oscillator/u }).waitFor();

  const jsonDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  if (!(await jsonDownload).suggestedFilename().endsWith('.patchcard.json')) throw new Error('JSON export filename is incorrect.');

  await page.getByRole('button', { name: 'Copy share link' }).click();
  await page.getByRole('region', { name: 'Take it with you' }).waitFor();

  const wavDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Render WAV' }).click();
  if (!(await wavDownload).suggestedFilename().endsWith('.wav')) throw new Error('WAV export filename is incorrect.');

  for (const path of ['/', '/privacy/', '/terms/']) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    const serious = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    if (serious.length) throw new Error(`${path} has accessibility violations: ${serious.map((item) => item.id).join(', ')}`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`Mobile layout overflows by ${overflow}px.`);
  if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(' | ')}`);
  console.log('Site smoke test and axe WCAG AA scan passed on home, privacy, and terms.');
} finally {
  await browser.close();
}
