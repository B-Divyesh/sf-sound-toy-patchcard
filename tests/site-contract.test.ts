import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const readJson = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8')) as Record<string, unknown>;

describe('release contracts', () => {
  it('ships the linked format guide in the npm package', () => {
    const manifest = readJson('package.json');
    expect(manifest.files).toContain('docs/format.md');
    expect(readFileSync(resolve(root, 'docs/format.md'), 'utf8')).toContain('# Patchcard format');
  });

  it('declares immutable caching and hardened static-site response policies', () => {
    const config = readJson('site/public/staticwebapp.config.json');
    const headers = config.globalHeaders as Record<string, string>;
    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    expect(headers['Permissions-Policy']).toContain('camera=()');
    const routes = config.routes as Array<{ route: string; headers: Record<string, string> }>;
    expect(routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
    expect((config.mimeTypes as Record<string, string>)['.webmanifest']).toBe('application/manifest+json');
  });
});
