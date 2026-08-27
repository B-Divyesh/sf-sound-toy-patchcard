import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const text = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('QA 476b6f7 release contract', () => {
  it('ships the linked format guide in the package file list', async () => {
    const packageJson = JSON.parse(await text('../package.json')) as { files: string[] };
    expect(packageJson.files).toContain('docs/format.md');
  });

  it('declares immutable hashed-asset caching and browser security policies', async () => {
    const headers = await text('../site/public/_headers');
    expect(headers).toContain("Content-Security-Policy: default-src 'self'");
    expect(headers).toContain('Permissions-Policy:');
    expect(headers).toMatch(/\/assets\/\*\n  Cache-Control: public, max-age=31536000, immutable/u);
    expect(headers).toContain('Content-Type: application/manifest+json; charset=utf-8');
  });

  it('keeps the mobile Copy code control at the required touch-target size', async () => {
    const css = await text('../site/site.css');
    expect(css).toMatch(/\.code-sample__bar button \{ min-width: 44px; min-height: 44px;/u);
  });
});
