# Review 2 — save and reopen browser sound settings

**Date:** 2026-09-05  
**Job:** Save, print, export, share, and reopen exact browser sound settings.  
**Audience:** Sound-toy users and workshop leaders.  
**First action:** **Try it with sample data** opens the ready-made Saffron echo card.  
**Live URL:** <https://sound-toy-patchcard.sociobot.in/>  
**Implementation candidate:** `374ded4b810a5fa53dd420c546bbf25ef76dd2ed`  
**Live documentation/release SHA:** `e965ef9287e8ec60e87489426c311499700ee16b`  
**Review baseline SHA:** `d9e23ca73bb1c46625979f666bc56f66465f689f`

## Verdict

**PASS — zero findings and zero untested claims.**

The live release is `e965ef9`. Its difference from the implementation commit
is `.factory/handoff.md` only. The review baseline adds only reports and
handoff text. A fresh build from the review baseline matched all 21 public
live files byte-for-byte; `release.json` is the sole expected difference
because it identifies the documentation/release SHA.

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| Untested claims | 0 |

## First screen and demo

Fresh Chromium desktop (1440 × 900) and phone (390 × 844) contexts loaded at
scroll position zero with no console/page errors and no horizontal overflow.
Both showed the job headline, the audience sentence, **Try it with sample
data**, the result note **Opens a ready-made card**, and all three facts before
scrolling. Screenshots are in `/work/.evidence/review-2/`.

The one-click sample opened **Saffron echo** with pitch 294 Hz, flutter 0.38,
triangle voice, and short echo enabled. It showed the persistent **Demo —
sample data, nothing is saved** label, **Reset demo**, and **Start for real**.
In a fresh live context, a seeded real-storage sentinel remained byte-for-byte
unchanged after saving `Demo keeper`; reset restored Saffron echo and removed
the demo key. This verifies isolated `demo:patchcard:saved:v1` storage and no
change to the real `patchcard:saved:v1` data.

## Clean checkout, package, and claims

A fresh clone at `d9e23ca` used Node `v22.23.2` and npm `10.9.8`.

```sh
npm ci                         # pass; 0 vulnerabilities
npm run typecheck              # pass
npm test                       # pass; 12/12
npm run build                  # pass; creates dist/ and dist/site/
npm run test:browser           # pass; 22/22
npm run test:a11y              # pass; 10/10
npm run test:release           # pass
npm pack --dry-run             # pass; 10 files / 12.8 kB
npm run check                  # pass
```

The built site tarball installed into a separate clean npm consumer. Its ESM
and CommonJS exports created, encoded, and decoded a card. The installed
artifact contained declarations, CSS, schema, format guide, and MIT license.

All 15 exact commands declared in `.factory/claims.json` were run separately
after the clean build. Each passed:

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

The test registry covers every product promise in the landing page, demo,
README, Privacy, and Terms content. No false, incomplete, missing, or
unregistered public claim was found.

## Live, accessibility, routes, privacy, and performance

`PATCHCARD_TEST_URL=https://sound-toy-patchcard.sociobot.in npm run
test:browser` passed 22/22, and the live accessibility suite passed 10/10.
They cover normal, invalid, boundary, and recovery flows; keyboard operation,
focus, phone targets, reduced motion, axe WCAG A/AA/2.1 AA serious/critical
results, offline reload after first visit, exports, JSON import recovery,
share reopening in a fresh context, and local/demo isolation.

Home, demo, Privacy, Terms, and the designed 404 each have their expected
title, one h1, main landmark, skip-focus transfer, and route behavior. The
unknown route returned HTTP 404 and the designed recovery page; that deliberate
404 is expected and is not a defect. All internal links and the external
source link resolved. Privacy requests are answered by local-only storage:
there are no accounts or hosted card records to retrieve or delete.

Live network capture during the demo save/share/export flow found only the
product origin, no cookies, and no third-party runtime services. Live headers
include self-only CSP, Permissions-Policy, HSTS, `nosniff`, and strict referrer
policy; hashed JS has `max-age=31536000, immutable`. The static library site
has no backend, tenant, health, persistence-restart, or rate-limit surface.

Fresh build output is 20.15 kB initial JS (7.72 kB gzip), 16.81 kB CSS
(4.43 kB gzip), and a 120.52 kB hero image. These are within the static
budgets. The prior measured mobile Lighthouse result remains 100 performance,
97 accessibility, 100 best practices, and 100 SEO.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| `DEPLOY-CACHE-01`, `DEPLOY-POLICY-01` | Resolved: live immutable hashed assets and required security headers confirmed. |
| `UI-NAME-01`, `A11Y-TARGET-01`, `A11Y-SKIP-01` | Resolved: invalid name recovery, phone target scan, keyboard operation, and skip-focus transfer pass. |
| `PKG-DOC-01`, `PACKAGE-DIST-01` | Resolved: the site tarball installs in a clean consumer and includes the documented files. |
| `DEMO-SANDBOX-01` | Resolved: persistent label, reset/exit, separate namespace, and real-data sentinel check pass live. |
| `PLAIN-COPY-01`, `CLAIMS-01`, `SITE-STRUCTURE-01` | Resolved: first screen is plain and complete, all 15 claims are tested, and routes/metadata/404 pass. |
| `PERFORMANCE-01` | Resolved: current build remains well under budgets; prior live mobile Lighthouse meets the required score. |
| `RELEASE-IDENTITY-01` | Resolved: implementation and documentation SHAs are accurately split, and product files match the live build byte-for-byte. |

## Evidence

- `/work/.evidence/review-2/live-desktop-first-screen.png`
- `/work/.evidence/review-2/live-phone-first-screen.png`
- `/work/.evidence/review-2/live-desktop-demo.png`
- `/work/.evidence/review-2/live-phone-demo.png`
- Fresh checkout: `/tmp/sound-toy-patchcard-review-2-ypoaDS`
