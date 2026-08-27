# Independent verification 2 — FAIL

**Date:** 2026-08-27

**Candidate tested from a clean detached checkout:** `8b818d73a9267e3d08c08292f29d9092f471d955`

**Live URL:** <https://sound-toy-patchcard.sociobot.in/>
**Node/npm:** v22.23.2 / 10.9.8

## Verdict

**FAIL.** The candidate builds, packages, and performs the core Patchcard job
end-to-end. The live site also passes its functional and accessibility smoke
suite. It cannot be accepted as this candidate, however: the deployment is a
later descendant (`origin/main` = `90431a84b395f543c02ab5f3c9f615b906f8f362`),
not the specified candidate, and its emitted CSS and response-policy source
are different. In addition, the candidate's home-page skip link does not move
keyboard focus to the main landmark.

## Defects

| Severity | ID | Evidence, impact, and required correction |
| --- | --- | --- |
| Medium | RELEASE-IDENTITY-01 | The live deployment cannot be verified as candidate `8b818d7`. `git merge-base --is-ancestor 8b818d7 origin/main` succeeds and `origin/main` resolves to later commit `90431a8`. The live CSS contains `.toy-toolbar input[aria-invalid=true]` and the 720px `.field-error` grid rule; both are absent from the candidate's `site/site.css` and present in `origin/main`. Live policies likewise include `img-src 'self' data: blob:`, `clipboard-read=()`, and a navigation fallback that are absent from candidate `site/public/staticwebapp.config.json`. Deploy the exact tested candidate and re-check its artifact and policies, or submit the later commit as the candidate. |
| Medium | A11Y-SKIP-01 | On the candidate home page, keyboard Tab focuses **Skip to the workbench**, but Enter leaves `document.activeElement` on that link rather than moving it to `<main id="main">`. The main landmark is not focusable. Keyboard users must still traverse the header controls after invoking the skip link. Make the target programmatically focusable (for example `tabindex="-1"`) and verify focus relocation; check the equivalent legal-page skip links too. |

There were no critical or high findings. The release-identity finding is not a
claim that the live descendant is broken; it is a failure of the required
candidate-to-deployment correspondence.

## Clean checkout, tests, production build, and package

The checkout was clean before `npm ci`. There is no lint script in
`package.json`; all available quality commands were run.

```text
npm ci                                      PASS (0 audit vulnerabilities)
npm run typecheck                           PASS
npm test                                    PASS — 3 files, 11 tests
npm run build                               PASS — dist/ and dist/site/
npm run check                               PASS (the above plus npm pack --dry-run)
npm pack                                    PASS — 12.4 kB package, 43.1 kB unpacked
```

The exact production build emitted 39.54 kB JS (14.67 kB gzip), 14.76 kB CSS
(4.04 kB gzip), and a 120.52 kB original WebP. These are within the supplied
200 kB JS, 50 kB CSS, and 300 kB hero budgets.

A separate temporary npm consumer installed the actual tarball. ESM and
CommonJS both created, encoded, decoded, and validated cards. The installed
stylesheet, schema, and `docs/format.md` were present. No package was
published.

## Browser/product evidence

Chromium exercised the Vite production preview at desktop and 390 x 844.

- Created a 120-character card name; set pitch to the lower boundary (80),
  flutter to 1, square voice, and echo off; saved it and exported JSON.
- Generated a settings-only share URL, opened it in a fresh page, and obtained
  the exact same name and values: `pitch=80`, `flutter=1`, `voice=square`,
  `echo=false`. The URL did not contain audio.
- Invalid `?patch=%%%` displayed a recovery error and retained the usable
  starter card (`pitch=220`). A malformed JSON import showed an error and
  preserved the current `pitch=880` card. An empty name displayed its announced
  validation error and did not save.
- JSON and WAV downloads had the expected extensions; the print action was
  invoked; confirmed deletion removed a saved card.
- At 390px there was 0px horizontal overflow; **Copy code** measured
  80.94 x 44px. With reduced motion it had an effective `1e-05s` transition.
- Keyboard ArrowRight adjusted the pitch range by one, Space toggled echo, and
  Enter saved a focused Save button with a visible 3px focus outline. The skip
  link failure above was the exception.
- `npm run test:a11y` passed locally. Independent axe scans using WCAG 2 A,
  AA, and 2.1 AA tags reported zero serious or critical violations on `/`,
  `/privacy/`, and `/terms/`. No console or page errors occurred in normal
  desktop/mobile flows.
- The local service worker activated as `patchcard-shell-v2`, survived
  `registration.update()`, and rendered the H1 after an offline reload.

## Privacy, policies, live checks

Code review and a normal browser network capture found no analytics, telemetry,
beacons, third-party runtime requests, remote fonts, or cookies. The only
application persistence is the disclosed localStorage saved-card key. Audio is
rendered locally and is excluded from default shares. Privacy and terms pages,
MIT licensing, schema versioning, and audio-license documentation are present.

`PATCHCARD_TEST_URL=https://sound-toy-patchcard.sociobot.in npm run test:a11y`
passed against the live home, privacy, and terms pages with no serious/critical
axe findings or browser console/page errors. Live HEAD checks found HTTPS,
HSTS, `nosniff`, strict referrer policy, CSP, Permissions-Policy, correct
`application/manifest+json`, and `Cache-Control: public, max-age=31536000,
immutable` on its JS, CSS, and WebP assets.

Those good live results do not resolve RELEASE-IDENTITY-01: the live JS and
WebP matched the candidate rebuild by bytes, but the live CSS/policies are
from the later merged deployment described above.

## Re-run

```sh
npm ci
npm run check
npm exec vite preview -- --config site/vite.config.ts --host 127.0.0.1 --port 4173
npm run test:a11y
PATCHCARD_TEST_URL=https://sound-toy-patchcard.sociobot.in npm run test:a11y
npm pack
```

Before passing, deploy a build identifiable as the submitted candidate (or
change the release candidate to the deployed commit) and fix/retest keyboard
focus transfer from every skip link.
