# Independent verification 4 — PASS

**Date:** 2026-09-05  
**Job:** Save, print, export, and reopen exact browser sound settings.  
**Audience:** Sound-toy users and workshop leaders.  
**First action:** **Try it with sample data** opens the isolated Saffron echo card.  
**Live URL:** <https://sound-toy-patchcard.sociobot.in/>  
**Implementation candidate:** `374ded4b810a5fa53dd420c546bbf25ef76dd2ed`  
**Documentation/release SHA:** `e965ef9287e8ec60e87489426c311499700ee16b`

## Verdict

**PASS — zero findings and zero untested claims.**

The live release identifies `e965ef9`. `git diff 374ded4..e965ef9` contains
only `.factory/handoff.md`, so `374ded4` remains the implementation reviewed.
The complete live site, package download, and generated assets match a fresh
build from the clean `e965ef9` checkout by SHA-256.

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| Untested claims | 0 |

## Clean checkout and package

A new shallow clone at `e965ef9` was used with Node `v22.23.2` and npm
`10.9.8`.

```sh
npm ci                         # pass, 0 vulnerabilities
npm run typecheck              # pass
npm test                        # pass, 12/12
npm run build                   # pass; creates dist/ and dist/site/
npm run test:browser            # pass, 22/22
npm run test:a11y               # pass, 10/10
npm run test:release            # pass
npm pack --dry-run              # pass, 10 files / 12.8 kB
npm run check                   # pass
```

The ready-to-publish tarball was installed by the claim test in a separate
temporary consumer. It created, encoded, and decoded a card through the ESM
API. The package-output claim also exercised CommonJS and verified declarations,
CSS, schema, format guide, and MIT license.

## Declared claims

Each command in `.factory/claims.json` was invoked separately after the build.
All passed; two browser commands were rerun after a leftover local test server
had released port 4173, and both then passed cleanly. This was runner cleanup,
not a product failure.

| Claim | Result |
| --- | --- |
| installable-package | pass |
| exact-settings | pass |
| json-export | pass |
| print-card | pass |
| share-reopen | pass |
| settings-only-share | pass |
| wav-local | pass |
| local-save-delete | pass |
| offline-shell | pass |
| local-private | pass |
| package-outputs | pass |
| versioned-schema | pass |
| accessible-widget | pass |
| licensed-audio | pass |
| json-import | pass |

The landing page, demo, README, Privacy, and Terms claims cross-check to these
15 entries. No unregistered public product promise was found.

## Live verification

`PATCHCARD_TEST_URL=https://sound-toy-patchcard.sociobot.in npm run test:browser`
passed 22/22 against the deployment. This covers normal, boundary, invalid,
and recovery paths; keyboard operation and focus; native controls; touch
targets; reduced motion; axe WCAG A/AA/2.1 AA serious/critical results; offline
reload; links; titles; legal pages; designed HTTP 404; storage isolation;
exports; package download; and settings-link reopening.

Fresh desktop and iPhone-sized contexts loaded the home page at scroll position
zero with the job, audience, sample action, result note, and all three facts
visible. There was no horizontal overflow or console/page error. The sample
opened **Saffron echo**, displayed the persistent **Demo — sample data, nothing
is saved** label, and retained its separate `demo:` storage namespace. The
browser claim suite proved save, reload, reset, delete, and **Start for real**
do not alter a seeded real-data sentinel.

Live `/privacy/` and `/terms/` return 200 with distinct titles. An unknown
route returns the designed page with HTTP 404, which is expected behavior.
The static product has no backend, tenant, health, restart-persistence, or
rate-limit surface to test.

Live responses have the self-only CSP, Permissions-Policy, HSTS, nosniff, and
strict referrer policy. Hashed assets use one-year immutable caching. Browser
network capture in the privacy claim found only the product origin, no cookies,
no accounts, and no third-party runtime requests.

## Previous findings

All earlier findings were inspected and remain resolved:

| Earlier finding | Current evidence |
| --- | --- |
| `DEPLOY-CACHE-01`, `DEPLOY-POLICY-01` | Live headers have immutable asset caching and required security policies. |
| `UI-NAME-01`, `A11Y-TARGET-01`, `A11Y-SKIP-01` | Browser tests cover name recovery, all phone targets, skip-focus transfer, and keyboard use. |
| `PKG-DOC-01`, `PACKAGE-DIST-01` | Tested site tarball installs cleanly and contains the documented files. Registry publication remains intentionally owner-only. |
| `DEMO-SANDBOX-01` | `/demo/`, persistent label, reset/exit, documentation, and separate storage are live and tested. |
| `PLAIN-COPY-01`, `CLAIMS-01`, `SITE-STRUCTURE-01` | The first screen is plain and complete; 15 claims are tested; routes, metadata, skeleton, and 404 pass. |
| `PERFORMANCE-01` | Current fresh build remains 20.15 kB initial JS (7.72 kB gzip), 16.81 kB CSS (4.43 kB gzip), and 120.52 kB hero; prior live mobile Lighthouse was 100 performance / 97 accessibility / 100 best practices / 100 SEO. |
| `RELEASE-IDENTITY-01` | The live release SHA is `e965ef9`; its only difference from implementation SHA `374ded4` is handoff documentation, and all live built files match. |

## Evidence

- `/work/.evidence/verification-4-live-desktop.png`
- `/work/.evidence/verification-4-live-phone.png`
- Fresh checkout: `/tmp/sound-toy-patchcard-verify-4-J1POh9` during this verification.

