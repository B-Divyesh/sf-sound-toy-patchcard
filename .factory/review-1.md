# Independent review 1 — FAIL

**Date:** 2026-09-05  
**Live URL:** <https://sound-toy-patchcard.sociobot.in/>  
**Implementation candidate:** `f426aba2af3efbc16175b522e70c711545a34058`  
**Documentation SHA:** `27875b7b11d69856fdf77e4bbf008161a8a2a65b`  
**Live release identity:** `aa29c467db1a16e76f92d6a9c405541af6633698`

## Verdict

**FAIL — 7 findings and 14 untested public claims.**

The core card flow and packed library work, but the public sample is not a
demo sandbox, the package cannot be installed from npm as documented, and
the required claim registry is absent. A successful build does not make this
product a PASS.

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 2 |
| Medium | 4 |
| Low | 1 |
| **Total** | **7** |

## Findings

### High — DEMO-SANDBOX-01: the sample changes the real storage namespace

The first screen has **Open an example**, not **Try it with sample data**. It
does load a realistic populated card in one click (`Saffron echo`, four useful
controls), but it never enters an identified demo:

- there is no persistent “Demo — sample data, nothing is saved” label;
- there is no **Reset demo** or **Start for real** action;
- `/demo` returns the ordinary home page with title
  `Patchcard — preserve a browser sound`;
- `.factory/demo.md` is absent; and
- demo and real saves use the same `patchcard:saved:v1` localStorage key.

In a fresh context I saved `Real keeper`, opened the example, and saved it.
The same key changed from `["Real keeper"]` to
`["Saffron echo", "Real keeper"]`. The sample therefore writes to real data
while giving no warning. Add a real `/demo` or `?demo=1` mode, a separate
`demo:` namespace, the persistent label, reset/exit actions, and demo
documentation.

### High — PACKAGE-DIST-01: the documented install command is false

The live page links to `https://www.npmjs.com/package/@sociobot/patchcard` and
README tells users to run `npm install @sociobot/patchcard`. In a clean
consumer, `npm view @sociobot/patchcard version --json` returned npm `E404 Not
Found`. The primary onboarding path for this npm-library product does not
work. The locally packed tarball is healthy, but visitors are not given that
tarball or a working alternative. Publish through the factory release process
or remove/replace the public npm install claim and dead destination.

### Medium — PLAIN-COPY-01: the first screen does not meet the plain-words contract

Before scrolling, both desktop and phone show the job and two actions, but no
copy names the audience of curious non-musicians or workshop facilitators.
The first action, **Make a patchcard**, does not say what happens next. The
required sample wording is absent. The only fact line combines two facts and
is hidden completely at 390 px, so the phone first screen has none of the
required three privacy/offline/price facts.

The product also uses its visual metaphor as control language: “field note,”
“specimen,” “pressed,” and “re-grow” appear in headings, labels, errors,
buttons, metadata, and legal copy. Examples include **Specimen name**, **Save
specimen**, **Saved specimens**, **Why a field note?**, **Press**, and
**Re-grow**. These words obscure save, reopen, and reset actions for the stated
non-musician audience. `.factory/copy-audit.md` is absent. The browser title
does name the job and passes; the surrounding product copy does not.

### Medium — CLAIMS-01: no public claim has the required sandbox test

`.factory/claims.json` is absent and `rg '@claim:'` finds no claim-tagged test.
There are therefore zero declared claim commands to run. Fourteen distinct
public claims were inventoried below; none has the required one-to-one test
from the demo entry point. Manual observations do not replace the required
claim registry and tagged tests.

| # | Public claim group | Manual observation | Declared claim test |
| ---: | --- | --- | --- |
| 1 | `npm install @sociobot/patchcard` works | **Fail:** registry E404 | Missing |
| 2 | exact settings survive encode/decode | Pass | Missing |
| 3 | JSON export works | Pass | Missing |
| 4 | print output is available | Pass | Missing |
| 5 | QR/share links reopen the same values on another device | Pass in a fresh page | Missing |
| 6 | default share links contain settings and no WAV/audio | Pass | Missing |
| 7 | WAV renders locally | Pass | Missing |
| 8 | named cards save and can be removed locally | Save/reload pass | Missing |
| 9 | the installed shell works offline | Pass after service-worker update | Missing |
| 10 | no analytics, accounts, hosted cards, or third-party runtime requests | Same-origin requests only; no account UI | Missing |
| 11 | ESM, CommonJS, declarations, and CSS ship | Pass in packed consumer | Missing |
| 12 | versioned schema rejects unknown versions | Existing unit test passes | Missing |
| 13 | the embeddable widget is accessible | Axe smoke passes; touch finding remains | Missing |
| 14 | audio inclusion is explicit and requires license metadata | Existing unit test passes | Missing |

**Untested claim count: 14.** Create `.factory/claims.json`, give each retained
claim exactly one `@claim:<id>` test, and run those commands from the isolated
demo. Remove claims that cannot be proved.

### Medium — SITE-STRUCTURE-01: required routes, metadata, and shared skeleton are incomplete

A deliberate missing URL should return a designed 404. Instead,
`/not-a-real-route-qa`, `/404.html`, and every unknown path return HTTP 200 and
the home page. `/demo` does the same. The site has no canonical, Open Graph,
or Twitter-card metadata on any checked route; it has no apple-touch icon or
1200×630 share image. `sitemap.xml` lists only home, Privacy, and Terms.

Headers and footers are also inconsistent: home lacks Demo and Privacy in its
header; legal pages use a different header; no footer contains “Built by Param
Factory” or a version/build id. Add real Demo and 404 routes, route-specific
titles, required metadata/assets, sitemap entries, and the standard consistent
header/footer skeleton.

### Medium — PERFORMANCE-01: mobile Lighthouse performance misses the budget

A fresh Lighthouse 13.4.1 mobile run scored **83 performance**, below the
required 90. Accessibility, best practices, and SEO each scored 100. LCP was
1.50 s and CLS was 0, but Total Blocking Time was 667 ms; the main JS produced
a reported 568 ms long task. Bundle budgets pass (39.54 kB JS, 14.91 kB CSS,
120.52 kB hero). Evidence: `/work/.evidence/lighthouse-mobile.json`.

### Low — A11Y-TOUCH-01: two home links are shorter than 44 px on phone

At 390×844, the visible header wordmark link measured 120×30 CSS px and the
footer wordmark link measured 115×25 px. Their height is below the 44 px touch
target baseline. The earlier **Copy code** target is now fixed at 44 px.

## What passed

### Live job paths

- Desktop and 390×844 phone load with no console errors, failed requests,
  horizontal overflow, or third-party request origins.
- A card named `Boundary signal` saved with pitch 80, flutter 1, square voice,
  and echo off. JSON and WAV downloads were named correctly; print was called.
- Its 941-character share URL reopened all four exact values in a fresh page
  and contained no audio payload.
- A damaged share code showed a recovery message and retained the starter
  card. Invalid imported JSON left a deliberately changed pitch of 880 intact.
  An empty name was marked invalid, announced, and not saved.
- Keyboard Tab reaches the skip link first; Enter moves focus to `<main>`.
  Reduced-motion CSS changes transitions to 0.00001 s and disables smooth
  scrolling.
- The live service worker updated and served an HTTP 200 offline reload with
  the H1 and offline status visible.
- Privacy and Terms return 200 with unique titles. The privacy page explains
  that no server-side card copy exists, so the operator cannot retrieve or
  delete one. Backend tenancy, restart persistence, health, and 429 behavior
  are not applicable to this static library product.

### Clean checkout and consumer package

From a clean checkout of documentation SHA `27875b7` under Node v22.23.2 and
npm 10.9.8:

```text
npm ci                 PASS — 0 vulnerabilities
npm run check          PASS — typecheck; 15/15 tests; build; release check; pack dry-run
npm run test:a11y      PASS — local production preview
PATCHCARD_TEST_URL=… npm run test:a11y
                       PASS — live home, Privacy, and Terms
npm pack               PASS — 12.6 kB tarball, 43.4 kB unpacked, 10 files
```

`npm run build` produced `dist/` and `dist/site/`. `build:site`,
`test:release`, and `npm pack --dry-run` were exercised by the aggregate gate.
There were no declared claim commands because the required claims file is
missing.

The tarball installed in a new consumer. ESM and CommonJS both created,
updated, encoded, and decoded cards. Declarations, CSS, schema, and
`docs/format.md` were present. This proves the artifact is ready to publish;
it does not cure the registry E404.

## Candidate and live correspondence

`f426aba2af3efbc16175b522e70c711545a34058` is the last commit that changed
product code. The later commits `aa29c46` and `27875b7` changed only
`.factory/handoff.md` and `.factory/verification-3.md`. Live `release.json`
names `aa29c46`, which is therefore the deployment/document identity, while
the implementation reviewed is `f426aba`.

Fresh-build SHA-256 values match live for `index.html`, Privacy, Terms, JS,
CSS, hero WebP, manifest, and service worker. The live runtime is the reviewed
implementation; no fresh image is required for the two report-only commits.

## Earlier finding disposition

| Earlier finding | Current disposition and new evidence |
| --- | --- |
| `DEPLOY-CACHE-01` | **Resolved.** Live JS, CSS, and WebP return `max-age=31536000, immutable`. |
| `UI-NAME-01` | **Resolved.** Empty name sets `aria-invalid=true`, shows an error, and blocks save. |
| `A11Y-TARGET-01` | **Resolved for Copy code.** It is 44 px high. New wordmark targets are reported separately above. |
| `PKG-DOC-01` | **Resolved.** `docs/format.md` is in the 10-file tarball and clean consumer. |
| `DEPLOY-POLICY-01` | **Resolved.** Live CSP, Permissions-Policy, and manifest MIME type are present. |
| `RELEASE-IDENTITY-01` | **Resolved with split SHAs recorded.** Live metadata names `aa29c46`; live product bytes match the last implementation candidate. |
| `A11Y-SKIP-01` | **Resolved.** Fresh keyboard checks move focus to main on home and legal pages. |

## Evidence locations

- `/work/.evidence/live-desktop-first-screen.png`
- `/work/.evidence/live-phone-first-screen.png`
- `/work/.evidence/screenshot-desktop.png`
- `/work/.evidence/screenshot-mobile.png`
- `/work/.evidence/verify.json`
- `/work/.evidence/lighthouse-mobile.json`

