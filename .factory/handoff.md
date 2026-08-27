# Patchcard repair-2 handoff

## Delivered

This repair closes both verifier-2 findings for candidate
`8b818d73a9267e3d08c08292f29d9092f471d955`.

- Every site skip link now moves keyboard focus to its `<main>` landmark,
  including the Privacy and Terms pages. The targets are programmatically
  focusable, get a visible focus outline, and respect reduced-motion while
  scrolling.
- Static builds emit `dist/site/release.json`. It names `repair-2`, the
  nominated base candidate, and the exact Git commit used to create the
  artifact. `npm run test:release` checks that identity locally; setting
  `PATCHCARD_RELEASE_URL=https://sound-toy-patchcard.sociobot.in` checks the
  deployed artifact against the current commit.
- Added exact source and browser regressions for focus transfer and an exact
  build/deployment identity regression. The deployment identity is no longer
  inferred from coincidentally matching assets.

## Verification

Performed after a clean `npm ci` with Node 22 / npm 10:

```sh
npm run check
npm exec vite preview -- --config site/vite.config.ts --host 127.0.0.1 --port 4173
npm run test:a11y
npm pack --pack-destination "$(mktemp -d)"
```

Results:

- `npm run check` passed: typecheck; 15 Vitest tests; production library/site
  build; release-identity check; and `npm pack --dry-run`.
- Browser QA passed at desktop and 390 × 844: the first Tab focuses each skip
  link and Enter makes its page's `<main>` the active element; core save,
  share, JSON/WAV export, mobile target, zero-overflow, console, and axe WCAG
  2 A/AA/2.1 AA checks passed on `/`, `/privacy/`, and `/terms/`.
- A clean tarball consumer passed both ESM create/encode/decode and CommonJS
  update paths; installed stylesheet, schema, and format guide were present.
- Production assets remain within the static budgets: 39.54 kB JS (14.67 kB
  gzip), 14.91 kB CSS (4.07 kB gzip), and a 120.52 kB WebP hero.

## Deploy and publish

Build `dist/site` from the final committed repair, deploy it as Standard static
docs, then run:

```sh
PATCHCARD_RELEASE_URL=https://sound-toy-patchcard.sociobot.in npm run test:release
PATCHCARD_TEST_URL=https://sound-toy-patchcard.sociobot.in npm run test:a11y
```

The package is ready to publish but was not published (the factory owns
registry credentials): `npm pack`.

## Known gaps

Sound recreation still depends on a host toy retaining stable parameter IDs
and synthesis semantics. The product has no hosted audio, analytics,
third-party runtime services, account, or payment flow.
