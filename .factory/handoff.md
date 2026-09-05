# Patchcard review-1 handoff — FAIL

## Result

**FAIL** for implementation candidate
`f426aba2af3efbc16175b522e70c711545a34058` at
<https://sound-toy-patchcard.sociobot.in/>.

Independent review found **7 findings** and **14 untested public claims**. No
product code was modified. Full evidence and required corrections are in
`.factory/review-1.md`.

## Main blockers

- The one-click example is not an isolated demo. It has no persistent sample
  label, reset, or start-real action and saves into `patchcard:saved:v1` beside
  real cards.
- The documented `npm install @sociobot/patchcard` path returns npm E404.
- `.factory/claims.json`, all `@claim:` tests, `.factory/demo.md`, and
  `.factory/copy-audit.md` are missing.
- First-screen copy omits the audience and uses field-guide metaphors for
  controls. Required fact lines are hidden on phone.
- Demo/404 routes, social/canonical metadata, and the shared site skeleton are
  incomplete.
- Mobile Lighthouse performance is 83, and two wordmark links are shorter
  than the 44 px touch baseline.

## Verified working

- Clean `npm ci` and `npm run check` pass: typecheck, 15 tests, library/site
  build, release check, and package dry run.
- Local and live `npm run test:a11y` pass with zero serious/critical axe
  findings and no console errors.
- Normal save, JSON, print, local WAV, QR/share reopen, boundary, invalid
  import/link, empty-name recovery, keyboard, reduced-motion, same-origin
  privacy, service-worker update, and offline reload paths pass.
- The packed 12.6 kB artifact works through ESM and CommonJS in a clean
  consumer and contains declarations, CSS, schema, and format documentation.
- Live product artifacts match the clean build byte-for-byte. Product code was
  last changed by `f426aba`; documentation HEAD is `27875b7`; live release
  metadata names report-only commit `aa29c46`.
- All earlier review findings were rechecked. They are resolved; the new touch
  target issue concerns the header/footer wordmarks, not the repaired Copy
  code control.

## Re-run

```sh
npm ci
npm run check
npm exec vite preview -- --config site/vite.config.ts --host 127.0.0.1 --port 4173
npm run test:a11y
PATCHCARD_TEST_URL=https://sound-toy-patchcard.sociobot.in npm run test:a11y
npm pack
npm view @sociobot/patchcard version --json
```

The final command currently returns E404. After repairs, run every command in
the new `.factory/claims.json` from `/demo` before requesting another review.
