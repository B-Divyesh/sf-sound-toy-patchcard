import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  ['/', 'Patchcard — save browser sound settings'],
  ['/demo/', 'Demo — Patchcard'],
  ['/privacy/', 'Privacy — Patchcard'],
  ['/terms/', 'Terms — Patchcard'],
  ['/404.html', 'Page not found — Patchcard']
] as const;

for (const [path, title] of routes) {
  test(`@a11y ${path} has the required structure, focus path, and axe result`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    expect(await page.locator('img:not([alt])').count()).toBe(0);
    expect(await page.locator('button').evaluateAll((buttons) => buttons.filter((button) =>
      !((button as HTMLElement).innerText || '').trim() && !button.getAttribute('aria-label')
    ).length)).toBe(0);
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-skip-link]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('@a11y phone controls meet touch and layout requirements', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo/');
  await expect(page.locator('#patch-widget')).toHaveAttribute('aria-busy', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const small = await page.locator('a:visible, button:visible, input:visible:not(.visually-hidden), select:visible').evaluateAll((items) =>
    items.map((item) => ({ label: item.getAttribute('aria-label') || item.textContent?.trim() || item.tagName, box: item.getBoundingClientRect().toJSON() }))
      .filter(({ box }) => box.width < 44 || box.height < 44)
  );
  expect(small).toEqual([]);
});

test('@a11y phone first screen states the job, audience, action, and facts before scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const required = [
    page.getByRole('heading', { level: 1, name: 'Save and reopen browser sound settings' }),
    page.locator('.lede'),
    page.getByRole('link', { name: 'Try it with sample data' }),
    page.locator('.hero__facts')
  ];
  for (const item of required) {
    await expect(item).toBeVisible();
    const box = await item.boundingBox();
    expect(box && box.y + box.height).toBeLessThanOrEqual(844);
  }
});

test('@a11y reduced motion removes smooth movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo/');
  const values = await page.getByRole('button', { name: 'Save card' }).evaluate((button) => {
    const style = getComputedStyle(button);
    return { transition: style.transitionDuration, scroll: getComputedStyle(document.documentElement).scrollBehavior };
  });
  expect(parseFloat(values.transition)).toBeLessThanOrEqual(0.00001);
  expect(values.scroll).toBe('auto');
});

test('@a11y unknown routes show the designed 404 with HTTP 404', async ({ page }) => {
  const response = await page.goto('/not-a-real-route-qa');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Patchcard');
  await expect(page.getByRole('heading', { level: 1, name: 'This page was not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to Patchcard' })).toBeVisible();
});

test('@a11y every internal page link resolves', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of ['/', '/demo/', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(path);
    for (const href of await page.locator('a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!))) {
      const url = new URL(href, page.url());
      if (url.origin === new URL(page.url()).origin) seen.add(`${url.pathname}${url.search}`);
    }
  }
  for (const path of seen) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
});
