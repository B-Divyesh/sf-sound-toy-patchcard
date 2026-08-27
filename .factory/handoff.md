# Patchcard QA repair handoff

## What changed

- Repaired every finding from QA report `476b6f7fd54487f6e3625889d9a6a8fcfb63f88b` for candidate `54d5a2d1d46faae023ec78c2226d79119b5c8028`.
- Added Standard Static Web Apps response rules in `site/public/staticwebapp.config.json` (and portable `_headers`): a restrictive CSP, a Permissions-Policy, `nosniff`, and the correct `application/manifest+json` manifest MIME. Build-hashed `/assets/*` now receive `Cache-Control: public, max-age=31536000, immutable`.
- Moved the original generated herbarium image into the Vite asset graph. Production now emits it with a content hash alongside JS and CSS; the service-worker cache was versioned while preserving offline shell behavior.
- Made the demo’s specimen name an accessible required field. Clearing it produces an announced, visible error and causes the host save adapter to reject the save, so the visible blank value can never silently save an older name. The widget now supports an optional `onSave` return value of `false` for host validation failures.
- Raised the mobile **Copy code** control to a minimum 44 × 44 CSS-pixel target.
- Included `docs/format.md` in the npm package, repairing the README’s format link.
- Added focused regressions for header/package/touch-target release requirements, rejected widget saves, and browser coverage for blank-name saving and the 390px Copy code target.

## Build, package, and verify

From a clean checkout with Node 20+:

```sh
npm ci
npm run check
npm exec vite preview -- --config site/vite.config.ts --host 127.0.0.1 --port 4173
npm run test:a11y
npm pack
```

Verified on 2026-08-27:

- `npm ci`: passed, 0 audit vulnerabilities.
- `npm run typecheck`: passed.
- `npm test`: passed, 3 files / 11 tests. This includes the QA regressions.
- `npm run build`: passed. `dist/site` contains hashed JS (39.54 KB), CSS (14.76 KB), and original WebP (120.52 KB), all within product budgets; `_headers` is copied into the deploy root.
- `npm run test:a11y`: passed against a production Vite preview. It covers save/reject/save behavior, JSON/share/QR/WAV flows, 390px no-overflow and 44px Copy code target, console errors, and axe WCAG 2 A/AA/2.1 AA scans for home, privacy, and terms.
- `npm pack` produced a 12.4 KB tarball containing `docs/format.md`. A fresh temporary consumer installed it and passed ESM, CommonJS, stylesheet, schema, and format-document checks.
- Standard static deployment of `dist/site`: passed. Live `npm run test:a11y` against `https://sound-toy-patchcard.sociobot.in` also passed.
- Live response verification: hashed JS, CSS, and WebP return `Cache-Control: public, max-age=31536000, immutable`; the manifest returns `Content-Type: application/manifest+json`; all checked responses include the configured CSP and Permissions-Policy.

## Deploy

Deploy `dist/site` as Standard static docs, including its `staticwebapp.config.json` (and portable `_headers`) file. The package is ready for the factory to publish with `npm pack` / `npm publish`; no registry publish was performed here.

After the deployment completes, verify the response contract:

```sh
curl -fsSI https://sound-toy-patchcard.sociobot.in/assets/<hashed-file>.js
curl -fsSI https://sound-toy-patchcard.sociobot.in/manifest.webmanifest
```

The first response must include the one-year immutable cache policy; the second must include `Content-Type: application/manifest+json`, CSP, and Permissions-Policy. This was verified on the live deployment.

## Known gaps

- Sound recreation remains dependent on host toys retaining stable parameter IDs and synthesis semantics, as documented by the v1 format.
- No hosted audio, analytics, or third-party runtime services are used. Saved cards remain browser-local and shared URLs exclude audio by default.
