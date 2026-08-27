# Patchcard

Patchcard is a tiny, typed library for preserving a browser sound as an open,
portable card: named parameters, a waveform sketch, a private-by-default share
link, a QR code, JSON export, print layout, and an optional local WAV render.
It is for playful audio tools and workshops that need recall without exposing
people to DAW preset formats or uploading their recordings.

[Live documentation and demo](https://sound-toy-patchcard.sociobot.in)

## Install

```sh
npm install @sociobot/patchcard
```

## Use the format

```ts
import { createPatch, decodePatch, encodePatch } from '@sociobot/patchcard';

const patch = createPatch({
  name: 'Rain beetle',
  toy: { name: 'Pocket drone', url: 'https://example.test/toy' },
  parameters: [
    { id: 'pitch', label: 'Pitch', value: 220, min: 80, max: 880, unit: 'Hz' },
    { id: 'grain', label: 'Grain', value: 0.35, min: 0, max: 1 }
  ]
});

const portable = encodePatch(patch); // URL-safe; recordings are excluded
const restored = decodePatch(portable);
```

## Embed the widget

```ts
import { mountPatchcard } from '@sociobot/patchcard';
import '@sociobot/patchcard/style.css';

const widget = mountPatchcard(document.querySelector('#patch')!, {
  patch,
  onChange(next) {
    synth.apply(next.parameters);
  },
  async renderAudio(next) {
    // Render locally in your toy. Nothing is uploaded by Patchcard.
    return synth.renderWav(next.parameters);
  }
});

widget.setParameter('pitch', 330);
widget.destroy();
```

The package exports ESM, CommonJS, type declarations, and its widget CSS. The
widget uses light DOM so hosts can style the documented `--patchcard-*` custom
properties. A host may set `shareBaseUrl`; otherwise links point to the current
page. Embedded audio requires `license`, `creator`, and `source` metadata, but
is never included by `encodePatch` unless `includeAudio: true` is explicit.

## Patch format

Every document has `format: "patchcard"` and `version: 1`. Parameter IDs are
stable machine keys; labels may change. Decoders reject unknown versions rather
than guessing. See [`docs/format.md`](docs/format.md) and the JSON Schema at
[`schema/patchcard-v1.schema.json`](schema/patchcard-v1.schema.json).

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm install
npm test
npm run build       # library + site -> dist/, site root -> dist/site/
npm run build:site  # documentation/demo only -> dist/site/
npm pack --dry-run
```

`npm run dev` starts the site. The demo stores cards only in browser
`localStorage`; clear them from the Saved specimens panel at any time. The
service worker makes the installed shell available offline.

## Deploy

Deploy `dist/site` as a static site with `index.html` at its root. No server,
account, analytics, fonts, or payment integration is needed.

## License

MIT. Audio attached by library users retains the license declared in its
`audio.license` field; Patchcard does not relicense it.
