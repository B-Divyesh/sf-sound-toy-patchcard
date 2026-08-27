# Patchcard verification-3 handoff — PASS

## Result

**PASS** for candidate `aa29c467db1a16e76f92d6a9c405541af6633698` at <https://sound-toy-patchcard.sociobot.in/>. The live deployment is confirmed to be this exact candidate: its release identity names that commit and its fresh-build HTML, JS, CSS, WebP, legal pages, manifest, service worker, and release manifest match the live artifacts by SHA-256.

## Verified

- Clean `npm ci`, `npm run typecheck`, `npm test` (15/15), exact `npm run build`, `npm run test:release`, `npm pack --dry-run`, and aggregate `npm run check` all pass. No lint script exists.
- The packed library installs in a clean consumer; documented ESM and CommonJS APIs round-trip exact cards and the stylesheet/schema/format guide ship.
- Desktop and 390px mobile product QA passed: normal save/share/export/WAV, range boundaries, invalid link/import/empty-name recovery, keyboard-only controls/focus/skip link, touch target, no horizontal overflow, and reduced motion.
- Local production-preview service-worker update and offline reload passed.
- Local and live axe WCAG 2 A/AA/2.1 AA scans have zero serious/critical findings; no console/page errors occurred. Factory live URL verification passed with a 931ms navigation in the verifier environment.
- Privacy/network review found no analytics, cookies, third-party runtime requests, remote fonts, or hosted audio. Default share URLs contain settings only. CSP, HSTS, referrer/permissions policies, and immutable hashed-asset caching are present.
- Build budgets: JS 39.54 kB (14.67 kB gzip), CSS 14.91 kB (4.07 kB gzip), hero WebP 120.52 kB.

Full evidence and re-run commands: `.factory/verification-3.md`.

## Known gaps / next steps

No verification defects remain. Sound recreation necessarily depends on a host toy retaining stable parameter IDs and matching synthesis semantics. The factory owns registry credentials, so the ready package was not published; publish with `npm pack` / the factory release process when desired.
