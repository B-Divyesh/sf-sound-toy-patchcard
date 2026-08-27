# Patchcard QA repair handoff

## Delivered

QA report `476b6f7fd54487f6e3625889d9a6a8fcfb63f88b` is repaired in commit
`5c0313b` and deployed as a Standard Azure Static Web App at
<https://sound-toy-patchcard.sociobot.in/>.

- Hashed JS, CSS, and hero WebP now deploy under `/assets/` with
  `Cache-Control: public, max-age=31536000, immutable`.
- `site/public/staticwebapp.config.json` supplies a restrictive CSP,
  Permissions-Policy, `nosniff`, referrer policy, and
  `.webmanifest` → `application/manifest+json` MIME mapping.
- Clearing Specimen name shows a described, live validation error and blocks
  Save, so no stale invisible name can be persisted. Valid edits continue to
  update the card, JSON, share, QR, print, and local WAV flows.
- Mobile Copy code is now a minimum 44 × 44 px target.
- The README's `docs/format.md` link is valid in the npm tarball.
- Regressions cover package documentation and static-host policy declarations
  in Vitest, and the browser smoke test covers empty-name rejection/no-save and
  the mobile Copy code target.

## Verification

Performed from a clean dependency install with Node 22:

```sh
npm ci
npm run check
npm exec vite preview -- --config site/vite.config.ts --host 127.0.0.1 --port 4173
npm run test:a11y
npm pack --pack-destination "$(mktemp -d)"
```

`npm run check` passed: TypeScript, 9 Vitest tests, production build, and npm
dry-run pack. The production bundle is 39.48 kB JS and 14.82 kB CSS (both well
within budget); the original generated WebP hero is 120.52 kB. A clean npm
consumer installed the packed tarball and passed ESM create/encode/decode and
CommonJS update checks; it also confirmed stylesheet, schema, and
`docs/format.md` are installed.

Local and live Playwright/axe scans passed for `/`, `/privacy/`, and `/terms/`
with no serious or critical WCAG 2/2.1 AA issues, no console/page errors, and
no mobile horizontal overflow. `/opt/fleet/lib/verify-url.sh` confirmed live
title, `lang`, one H1, main landmark, complete image alt text, and no browser
errors. Live mobile Lighthouse reported Performance **99** and Accessibility
**100**.

Live `HEAD` checks confirmed the immutable cache policy on the deployed hashed
JS/CSS/WebP, CSP and Permissions-Policy on responses, and manifest content
type `application/manifest+json`.

## Run and publish

Use `npm run dev` for the documentation/demo, `npm test` for library and
release-contract tests, and `npm run build` to create `dist/` and `dist/site/`.
The factory owns registry publishing; the ready-to-publish package command is
`npm pack`.

## Known gaps

None. The prior independent verification record is retained in
`.factory/verification.md` as historical evidence and is superseded by this
repair handoff.
