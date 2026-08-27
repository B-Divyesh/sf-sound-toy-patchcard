# Independent verification 3 — PASS

**Date:** 2026-08-27  
**Candidate tested from a clean checkout:** `aa29c467db1a16e76f92d6a9c405541af6633698`  
**Live URL:** <https://sound-toy-patchcard.sociobot.in/>  
**Environment:** Node v22.23.2, npm 10.9.8, Chromium via Playwright 1.58.2

## Verdict

**PASS.** Patchcard meets the researched brief's smallest useful product: a versioned open JSON patch card and embeddable widget preserving named values, waveform, private settings-only sharing/QR, print, JSON export, and optional local WAV export. The candidate is fully buildable, packageable, and deployed at the nominated URL. This fresh verification supersedes the earlier deployment-identity failure: live `release.json` identifies this exact commit, and all deployed generated artifacts match the fresh candidate build by SHA-256.

## Defects

None found.

| Severity | Count | Detail |
| --- | ---: | --- |
| Critical | 0 | — |
| High | 0 | — |
| Medium | 0 | — |
| Low | 0 | — |

## Clean checkout quality gates

The worktree was clean before `npm ci`. There is no lint command configured in `package.json`; all available checks were run, including the aggregate check.

```text
npm ci                 PASS — 0 audit vulnerabilities
npm run typecheck      PASS
npm test               PASS — 4 files, 15 tests
npm run build          PASS — library + exact production site build
npm run test:release   PASS — local release identity is aa29c467…
npm pack --dry-run     PASS
npm run check          PASS — repeats the complete configured release gate
npm pack               PASS — 12.6 kB tarball, 43.4 kB unpacked
```

The fresh site build is 39.54 kB JS (14.67 kB gzip), 14.91 kB CSS (4.07 kB gzip), and a 120.52 kB WebP hero. Each is under the supplied 200 kB JS, 50 kB CSS, and 300 kB mobile-image budgets.

## Package-consumer verification

Installed the generated tarball in a new temporary consumer. Its documented public ESM API successfully created a card, changed a numerical value from 80 to 880, encoded it, decoded it, and validated the exact result. The CommonJS entry also created/encoded/decoded a card. The consumer package contained `dist/style.css`, `schema/patchcard-v1.schema.json`, and `docs/format.md`. No package was published.

## Independent product and browser evidence

Against a local production preview at desktop and 390 × 844 mobile, an independent Playwright flow verified:

- A 120-character name, pitch lower boundary (80), flutter upper boundary (1), square voice, and disabled echo save successfully.
- The copied share URL re-opened in another page with that exact name and all four values, including the false boolean. It included `patch` only and no audio/WAV data. QR transport appeared.
- JSON and locally rendered WAV downloads used `.patchcard.json` and `.wav`.
- A malformed `?patch=%%%` produced a recovery error while retaining the usable starter patch; an invalid JSON import produced an error while retaining a deliberately set pitch of 880. An empty name is visibly and semantically invalid and cannot save.
- Keyboard-only use passed: first Tab reaches the skip link, Enter moves focus to `<main>`, ArrowRight changes the range by one step, and Space toggles echo. Focus is visibly styled. The 390px layout has no horizontal overflow and the Copy code target is at least 44 × 44px.
- Reduced-motion CSS makes the save control transition effectively immediate (0.00001s). The production-preview service worker registered, accepted an update request, and served a reload with the context offline.
- No console errors, page errors, or request failures occurred.

`npm run test:a11y` independently passed locally and against the live home, Privacy, and Terms pages. It includes axe WCAG 2 A/AA/2.1 AA scans with zero serious or critical findings, landmark/title/lang/alt checks, keyboard skip link checks, console/page-error capture, and the core save/export flow.

The factory URL verifier also passed live at desktop and mobile: 200 response, title `Patchcard — preserve a browser sound`, `lang=en`, one H1, main landmark, zero images missing alt, zero unlabeled buttons, no page/console errors, and a 931 ms navigation in this environment. Visual review of both screens confirmed the botanical field-guide design is intact and responsive.

## Privacy, policy, deployment, and caching

Code review plus a live browser network capture found only the site's own origin and no failed requests: no analytics, telemetry, cookies, remote fonts, third-party scripts, or hosted audio. Persistence is the disclosed local `localStorage` saved-card key. Default shares omit audio; optional embedded audio requires provenance metadata. The repository has versioned format/schema documentation, an MIT license, Privacy and Terms pages.

Live HTTPS responses carry HSTS, `nosniff`, strict-origin referrer policy, strict self-only CSP, and a restrictive Permissions-Policy. Hashed JS, CSS, and WebP use `public, max-age=31536000, immutable`; HTML and `release.json` use short (30-second) revalidation and the manifest revalidates daily.

`PATCHCARD_RELEASE_URL=https://sound-toy-patchcard.sociobot.in npm run test:release` passed. Fresh-build and live SHA-256 values matched for `index.html`, CSS, JS, WebP, Privacy/Terms HTML, manifest, service worker, and `release.json`. The latter identifies product `sound-toy-patchcard`, `repair-2`, base candidate `8b818d7…`, and exact deployed commit `aa29c467db1a16e76f92d6a9c405541af6633698`.

## Re-run

```sh
npm ci
npm run check
npm exec vite preview -- --config site/vite.config.ts --host 127.0.0.1 --port 4173
npm run test:a11y
PATCHCARD_TEST_URL=https://sound-toy-patchcard.sociobot.in npm run test:a11y
PATCHCARD_RELEASE_URL=https://sound-toy-patchcard.sociobot.in npm run test:release
npm pack
```
