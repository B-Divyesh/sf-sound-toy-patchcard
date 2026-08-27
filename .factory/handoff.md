# Patchcard QA repair handoff

## Delivered

QA report `476b6f7fd54487f6e3625889d9a6a8fcfb63f88b` for candidate
`54d5a2d1d46faae023ec78c2226d79119b5c8028` is repaired, committed, and
deployed as Standard static docs at <https://sound-toy-patchcard.sociobot.in/>.

- Vite now emits the JS, CSS, and original herbarium WebP under hashed
  `/assets/` paths. Live assets use
  `Cache-Control: public, max-age=31536000, immutable`.
- `staticwebapp.config.json` and portable `_headers` declare CSP,
  Permissions-Policy, `nosniff`, referrer policy, and correct manifest MIME.
- An empty specimen name gets an announced, visible error; the host rejects its
  save through the widget's typed optional `onSave: () => false` contract. No
  stale hidden name is persisted, and the other card/audio actions continue to
  operate normally.
- Copy code is at least 44 × 44 CSS px on mobile.
- `docs/format.md` is included in the npm tarball, repairing the README link.
- Added exact regression coverage for save rejection, browser name/touch-target
  behavior, package documentation, immutable caching, headers, and manifest
  MIME.

## Verification

Performed from a clean dependency install with Node 22:

```sh
npm ci
npm run check
npm exec vite preview -- --config site/vite.config.ts --host 127.0.0.1 --port 4173
npm run test:a11y
npm pack --pack-destination "$(mktemp -d)"
```

The clean checks pass: TypeScript, 13 Vitest tests, production build, package
dry-run, and the browser/axe suite for `/`, `/privacy/`, and `/terms/`. A clean
consumer installed the tarball and passed ESM create/encode/decode and CommonJS
update checks, and confirmed the stylesheet, schema, and format guide exist.

The production bundle is about 39.5 kB JS and 14.8 kB CSS; the generated hero
is 120.52 kB. `/opt/fleet/lib/verify-url.sh` passed on live with no console or
page errors, a title, language, one H1, main landmark, and complete image alt
text. The live browser suite passed, including mobile overflow and QA
regressions. Live Lighthouse mobile reported Performance **100** and
Accessibility **100**.

Live `HEAD` checks confirmed the immutable policy on hashed JS/CSS/WebP, CSP
and Permissions-Policy, and manifest `Content-Type: application/manifest+json`.

## Run and publish

Use `npm run dev` for the documentation/demo, `npm test` for library and
release-contract tests, and `npm run build` to create `dist/` and `dist/site/`.
The factory owns registry publishing; the ready-to-publish command is
`npm pack`.

## Known gaps

Sound recreation continues to depend on host toys retaining stable parameter
IDs and synthesis semantics, as documented by the v1 format. No hosted audio,
analytics, or third-party runtime services are used. The earlier independent
verification remains in `.factory/verification.md` as historical evidence.
