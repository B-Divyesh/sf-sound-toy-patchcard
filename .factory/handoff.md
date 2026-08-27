# Patchcard v0.1.0 handoff

## What shipped

- A ready-to-publish `@sociobot/patchcard` TypeScript package with ESM,
  CommonJS, declarations, widget CSS, MIT license, changelog, and v1 JSON
  Schema.
- Tiny public API: create/validate/update a patch, encode/decode a URL-safe
  card, build a private-by-default share URL, make a waveform, and mount the
  accessible widget.
- The widget renders number/string/boolean/option controls, a waveform sketch,
  JSON download, QR/share link, printable card, saved-state callbacks, and an
  optional host-provided local WAV renderer. Audio is stripped from shares
  unless callers explicitly pass `includeAudio: true`; attached audio requires
  creator, source, and license metadata.
- A finished documentation/demo site in `dist/site`: users can shape and hear a
  small local oscillator, name and save up to 30 cards in `localStorage`, reopen
  or delete them, import/export JSON, render a WAV, print, share by link/QR, and
  open valid cards from `?patch=` URLs. Invalid links/files preserve the current
  card and provide recovery text.
- Purpose-built botanical field-guide design, responsive 390 px layout,
  keyboard/focus treatment, reduced-motion treatment, offline status and
  service-worker shell, empty/loading/error states, and `/privacy/` and
  `/terms/` pages.
- Original generated hero at `site/public/patchcard-herbarium.webp` (120 KB).
  It was made with `/opt/fleet/lib/gen-image.sh` using the final prompt and
  provenance recorded in `.factory/design.md`, then converted locally to WebP.

## Run and publish

```sh
npm ci
npm test
npm run build
npm run dev
```

The exact production build command is `npm run build`. It creates package files
in `dist/` and the static deploy root at `dist/site/` with
`dist/site/index.html`. Deploy `dist/site`. The factory can publish the package
with `npm pack` / `npm publish`; no registry action was taken by this worker.

To rerun the browser checks, serve the build on port 4173 with
`npm exec vite preview -- --config site/vite.config.ts --host 127.0.0.1 --port 4173`,
then run `npm run test:a11y`.

## Verification (2026-08-27)

- `npm run typecheck`: pass.
- `npm test`: 2 files, 7 tests passed. Coverage includes the README round trip,
  exact typed values, audio privacy, version/error handling, immutable updates,
  duplicate IDs, widget input, save, and teardown.
- `npm run build`: pass. Site output is 39.12 KB JS / 14.62 KB CSS uncompressed;
  generated hero is 120.5 KB. All are within the supplied budgets.
- `npm pack --dry-run`: pass; package is 11.8 KB compressed / 41.3 KB unpacked.
- `npm audit --audit-level=low`: 0 vulnerabilities.
- Factory `verify-url.sh`: pass on `/`, `/privacy/`, and `/terms/`; no console or
  page errors, one H1, title/lang/main present, all images have alt text, and no
  unlabeled buttons.
- Playwright functional smoke: save/reopen listing, JSON download, QR reveal,
  WAV download, and 390 px horizontal overflow all pass.
- Axe WCAG 2 A/AA/2.1 AA: 0 serious or critical issues on all three pages.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.1 s, LCP 1.8 s, Total Blocking Time 0 ms, CLS 0.

## Known gaps and next steps

- Patchcard preserves parameter state exactly; identical sound still depends on
  the host toy keeping stable parameter IDs and compatible synthesis semantics.
  Hosts should record `toy.version` and add a migration when those semantics
  change.
- The service worker is intentionally a small cache-first shell. A future
  release could add an in-product update notice when a new shell is waiting.
- Publishing, deployment, DNS, and registry credentials remain factory work.
  After deployment, repeat Lighthouse against the public HTTPS URL.
