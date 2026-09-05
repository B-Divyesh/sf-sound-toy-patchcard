# Patchcard repair 3 handoff

## Result

PASS candidate deployed at <https://sound-toy-patchcard.sociobot.in/>.

- Deployed release/source SHA: `374ded4b810a5fa53dd420c546bbf25ef76dd2ed`
- Last commit that changed shipped page bytes: `03f4d55`
- Repair base: `d0e97e0da1009118789040c9b982c90f1030f47b`
- Release label: `repair-3`

The later handoff commit changes documentation only. Live `release.json` and
all deployed product files identify or match the deployed source SHA above.

## Delivered

- Replaced the unsafe example with `/demo/`, an isolated one-click sample.
  It uses `demo:patchcard:saved:v1`, never reads or changes the real
  `patchcard:saved:v1` key, and has a persistent label, **Reset demo**, and
  **Start for real**.
- Replaced the false npm-registry install path with a tested site-hosted
  `0.1.0` tarball. The build creates it at
  `dist/site/downloads/sociobot-patchcard-0.1.0.tgz`.
- Rewrote the first screen and controls in plain words. The phone first screen
  shows the job, audience, sample action, result note, real action, and three
  facts without scrolling.
- Added `.factory/claims.json` with 15 claims and exactly one outcome test for
  each claim. Added the demo and copy-audit records.
- Added distinct `/demo/`, `/privacy/`, `/terms/`, and designed 404 pages with
  route titles, canonical and social metadata, app icons, consistent
  navigation/footer structure, sitemap entries, and a real HTTP 404 response.
- Split QR generation into an on-demand chunk and applied content visibility
  below the first screen. Initial JS is 20.15 kB before gzip.
- Raised all tested phone controls and links to at least 44 × 44 CSS px.
- Added normal, boundary, invalid, recovery, storage-isolation, offline,
  keyboard, reduced-motion, internal-link, package-consumer, and accessibility
  regressions. Empty names and damaged links leave the current card usable.
- Kept the original botanical visual identity. The new 1200 × 630 social image
  and app icons are deterministic crops of the original owned artwork; their
  provenance is recorded in `.factory/design.md`.

## Finding disposition

| Finding | Disposition |
| --- | --- |
| `DEMO-SANDBOX-01` | Resolved by the separate demo route, key, label, reset, exit, docs, and isolation test. |
| `PACKAGE-DIST-01` | Resolved for users with the tested site tarball and working install command. Registry publication remains an owner-only release step. |
| `PLAIN-COPY-01` | Resolved with the new first screen, control copy, and copy audit. |
| `CLAIMS-01` | Resolved with 15 registered claims and 15 individually run commands. |
| `SITE-STRUCTURE-01` | Resolved with real routes, metadata, shared skeleton, social assets, sitemap, and 404 response. |
| `PERFORMANCE-01` | Resolved: live mobile Lighthouse performance is 100. |
| `A11Y-TOUCH-01` | Resolved: the phone target scan finds no target under 44 × 44 px. |
| Earlier cache, empty-name, Copy-code target, package-doc, response-policy, release-identity, and skip-focus findings | Rechecked and passing in source, browser, package, and live response tests. |

## Verification

From a fresh clone of `374ded4` under Node 22 and npm 10:

```sh
npm ci
npm run build
# Every command in .factory/claims.json was run separately.
npm run check
```

Results:

- `npm ci`: 0 vulnerabilities.
- All 15 declared claim commands: pass.
- `npm test`: 12/12 unit and contract tests pass.
- `npm run test:browser`: 22/22 browser tests pass.
- `npm run check`: typecheck, tests, build, browser suite, release check, and
  package dry-run pass.
- Clean package consumers pass ESM and CommonJS create/encode/decode. The
  tarball has 10 files, is 12.8 kB compressed, and includes declarations, CSS,
  schema, format docs, and MIT license.
- Site build: 20.15 kB initial JS (7.72 kB gzip), 16.81 kB CSS (4.43 kB gzip),
  21.12 kB on-demand QR JS, and 120.52 kB hero image.

Against the final HTTPS deployment:

- `PATCHCARD_TEST_URL=... npm run test:browser`: 22/22 pass, including axe,
  keyboard, phone targets, offline reload, demo isolation, exports, share
  reopen, routes, and the clean package consumer.
- `PATCHCARD_RELEASE_URL=... npm run test:release`: pass for `374ded4`.
- Factory URL smoke check: 776 ms navigation, no console errors, one H1, main
  landmark, no missing alt text, and no unlabeled buttons.
- Fresh desktop and 390 × 844 phone contexts show the complete required first
  screen. Phone facts end at 644 px, before the 844 px viewport edge.
- The live sample opens **Saffron echo** with four controls. Save, reload,
  reset, and Start for real leave a seeded real-data sentinel unchanged and
  remove the demo key.
- Unknown routes return HTTP 404 with the designed page. All internal links
  and the external source link resolve. Security headers are present, and all
  hashed assets use one-year immutable caching.
- SHA-256 comparisons match live and the clean build for every HTML route,
  release file, service worker, manifest, package tarball, social image, and
  generated JS/CSS/image asset.
- Final mobile Lighthouse: performance 100, accessibility 97, best practices
  100, SEO 100; FCP 0.9 s, LCP 1.5 s, TBT 20 ms, CLS 0.

Evidence is in `/work/.evidence/repair-3-live-final/`. The requested catalog
description was copied to `/work/.evidence/catalog-description.txt`.

## Known gaps and next step

The npm registry still has no `@sociobot/patchcard` release. Worker policy
forbids publishing with factory credentials, so the public site and README use
the tested downloadable tarball instead. A factory owner may publish that
exact tarball later.

Recreating a card still requires the receiving sound toy to preserve compatible
parameter IDs and synthesis behavior. Patchcard intentionally has no hosted
audio, accounts, cloud sync, or synthesizer.

The work order referenced `/work/.evidence/qa-result.json`, but that file was
not present in this container. All repository reviews and verification reports
were read, and fresh clean-checkout and live checks above replace that missing
artifact with current evidence.
