import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const readJson = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8')) as Record<string, unknown>;

describe('static product contract', () => {
  it('defines a designed 404 response and durable asset policies', () => {
    const config = readJson('site/public/staticwebapp.config.json');
    expect(config.responseOverrides).toEqual({ '404': { rewrite: '/404.html' } });
    expect(config.navigationFallback).toBeUndefined();
    const headers = config.globalHeaders as Record<string, string>;
    expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(headers['Permissions-Policy']).toContain('camera=()');
    const routes = config.routes as Array<{ route: string; headers: Record<string, string> }>;
    expect(routes.find((route) => route.route === '/assets/*')?.headers['Cache-Control']).toContain('immutable');
    expect(routes.find((route) => route.route === '/downloads/*')?.headers['Cache-Control']).toContain('immutable');
  });

  it('gives every public route its own title, canonical URL, metadata, and page skeleton', () => {
    const routes = [
      ['site/index.html', 'Patchcard — save browser sound settings'],
      ['site/demo/index.html', 'Demo — Patchcard'],
      ['site/privacy/index.html', 'Privacy — Patchcard'],
      ['site/terms/index.html', 'Terms — Patchcard'],
      ['site/404.html', 'Page not found — Patchcard']
    ] as const;
    for (const [path, title] of routes) {
      const document = new JSDOM(readFileSync(resolve(root, path), 'utf8')).window.document;
      expect(document.title).toBe(title);
      expect(document.documentElement.lang).toBe('en');
      expect(document.querySelectorAll('h1')).toHaveLength(1);
      expect(document.querySelector('main')).not.toBeNull();
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(/^https:\/\/sound-toy-patchcard\.sociobot\.in\//u);
      expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toContain('/patchcard-share.webp');
      expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
      expect(document.body.textContent).toContain('Built by Param Factory');
      expect(document.querySelector('a[data-skip-link]')).not.toBeNull();
      expect(document.querySelector('main[tabindex="-1"]')).not.toBeNull();
    }
  });

  it('lists each indexable route and provides the linked package guide', () => {
    const sitemap = readFileSync(resolve(root, 'site/public/sitemap.xml'), 'utf8');
    for (const path of ['/', '/demo/', '/privacy/', '/terms/']) {
      expect(sitemap).toContain(`https://sound-toy-patchcard.sociobot.in${path}`);
    }
    const manifest = readJson('package.json');
    expect(manifest.files).toContain('docs/format.md');
  });
});
