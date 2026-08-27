# Independent verification 1 — FAIL

**Date:** 2026-08-27
**Candidate:** `54d5a2d1d46faae023ec78c2226d79119b5c8028`
**Live URL:** <https://sound-toy-patchcard.sociobot.in/>

## Verdict

**FAIL.** The package and functional site checks pass, and the public site is an exact production-build match for this candidate. The live deployment fails the supplied static-product caching requirement: content-hashed JS, CSS, and WebP are cached for only 30 seconds and are not `immutable`.

## Defects

| Severity | ID | Evidence and impact |
| --- | --- | --- |
| Medium | DEPLOY-CACHE-01 | `HEAD /assets/index-dFlBYw-p.js`, `HEAD /assets/index-DbrZPvU5.css`, and `HEAD /patchcard-herbarium.webp` all returned `cache-control: public, must-revalidate, max-age=30`; none had `immutable`. The acceptance contract requires long-lived immutable caching for hashed static assets. This is a deployment/configuration defect. |
| Low | UI-NAME-01 | Clearing the required specimen-name input leaves the input empty while the patch/save/export/share state silently retains the prior name. Browser evidence: `{ input: "", card: "<previous 120-character name>", status: "Specimen opened." }`. No validation/recovery message is given, so displayed input can disagree with the artifact saved. |
| Low | A11Y-TARGET-01 | At 390 px, visible **Copy code** measured 80.94 × 38 CSS px. The supplied contract requires at least 44 × 44 px touch targets. |
| Low | PKG-DOC-01 | `npm pack` contains nine files and omits `docs/format.md`, but installed `README.md` links to that relative path. The package therefore has a broken format-documentation link (its schema export is present). |
| Low | DEPLOY-POLICY-01 | Live responses have HSTS, `nosniff`, and a strict referrer policy, but no CSP or Permissions-Policy; `manifest.webmanifest` is served as `application/octet-stream`. No exploit was demonstrated, but static-site browser hardening is incomplete. |

There were no critical or high findings.

## Clean checkout, build, and public API

The initial worktree was clean at the specified commit. `npm ci` completed with 0 audit vulnerabilities under Node `v22.23.2` / npm `10.9.8`.

```text
npm run check
  typecheck: pass
  vitest: 2 files, 7 tests: pass
  exact production build: pass
  npm pack --dry-run: pass
```

`npm run build` produced `dist/` and `dist/site/`. Initial built assets were 39,118 B JS and 14,617 B CSS; the original hero was 120,520 B. These meet the 200 KB JS, 50 KB CSS, and 300 KB hero budgets.

A candidate tarball was installed in a fresh temporary npm consumer. ESM and CommonJS imports both worked; the consumer created, encoded, decoded, version-rejected, and updated a patch. Declarations, stylesheet, and schema were present. Tarball size: 11.8 kB compressed / 41.3 kB unpacked. A separately created card with WAV metadata confirmed that default `encodePatch` omits audio. No lint script exists; `npm run check` runs every available repository quality command.

## Product/browser evidence

A Vite production preview was tested in Chromium.

- Desktop normal and boundary path: pitch 80 then 880, `square` voice, echo disabled; saved locally; JSON exported as `moss-radio.patchcard.json`; WAV exported as `moss-radio.wav`; print action invoked; deletion confirmation removed the saved specimen.
- A 921-character normal share URL contained no audio payload, revealed QR, and reopened in a fresh page with exact `pitch=880`, `voice=square`, and `echo=false` values.
- Invalid `?patch=%%%` and malformed JSON both showed a clear error and kept a usable starter patch (`pitch=220`). A 120-character valid name worked.
- Keyboard focus on Save was visible (`solid 3px` saffron outline). Semantics: `lang=en`, title, one H1, main landmark, and complete image alt text.
- At 390 × 844 there was zero horizontal overflow; visual inspection showed the intended single-column layout. The one small target is listed above.
- Under reduced motion, button transition duration was `1e-05s`.
- `npm run test:a11y` passed; independent axe WCAG 2 A/AA/2.1 AA scans had zero serious/critical issues on `/`, `/privacy/`, and `/terms/`.
- A controlling, active service worker survived `registration.update()`; after a warmed reload, offline reload displayed the H1. There were no console or page errors.

## Privacy, live match, and response policies

Code review and browser network capture found no analytics, beacons, third-party fonts/scripts, or outbound runtime requests. Persistence is the disclosed localStorage saved-card key; privacy and terms pages are present. The three live pages had no console/page errors or mobile overflow.

`git ls-remote origin refs/heads/main` returned the candidate commit. SHA-256 matched local production output and live output for home, privacy/terms, hashed JS/CSS, hero, favicon, manifest, robots, sitemap, and service worker.

Live response policy facts:

- Present: HTTPS, HSTS (`max-age=10886400; includeSubDomains; preload`), `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- Missing: CSP and Permissions-Policy.
- Failing cache policy: every checked response used `public, must-revalidate, max-age=30`, including hashed static assets.

Lighthouse could not be scored in this container: the installed launcher first could not discover Chrome, and with Playwright Chromium it crashed before opening a debugging port. No Lighthouse score is claimed; direct bundle, semantic, axe, network, and browser evidence is reported above.

## Rerun

```sh
npm ci
npm run check
npm exec vite preview -- --config site/vite.config.ts --host 127.0.0.1 --port 4173
npm run test:a11y
npm pack
```

In a fresh consumer, install the tarball and exercise both `import '@sociobot/patchcard'` and `require('@sociobot/patchcard')`. After deployment headers are corrected, use `curl -fsSI` on hashed JS/CSS/WebP and require a long `max-age` plus `immutable` before acceptance.
