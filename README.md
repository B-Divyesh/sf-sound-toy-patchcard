# Patchcard

Patchcard saves browser sound settings as an open card. It is for sound-toy
users and workshop leaders who need to reopen, print, or share exact values
without learning music production software.

[Try the isolated sample](https://sound-toy-patchcard.sociobot.in/demo/)

## Install

Install the tested 0.1.0 tarball served by the product site:

```sh
npm install https://sound-toy-patchcard.sociobot.in/downloads/sociobot-patchcard-0.1.0.tgz
```

The tarball includes ESM, CommonJS, type declarations, widget CSS, the JSON
Schema, the format guide, and the MIT license. Factory maintainers can publish
that tarball later with `npm publish`; this repository does not hold registry
credentials.

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

const portable = encodePatch(patch);
const restored = decodePatch(portable);
```

The standard encoder leaves out audio. Passing `{ includeAudio: true }`
requires complete creator, source, and license fields.

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
    return synth.renderWav(next.parameters);
  }
});

widget.setParameter('pitch', 330);
widget.destroy();
```

The widget uses light DOM. Its `--patchcard-*` custom properties are listed at
the top of the shipped CSS. A host can set `shareBaseUrl`; otherwise links
point to the current page.

## Format and privacy

Every card has `format: "patchcard"` and `version: 1`. Decoders reject
unknown versions. See [the format guide](docs/format.md) and
[the JSON Schema](schema/patchcard-v1.schema.json).

The site has no account, analytics, or hosted card database. Real cards and
sample cards use separate browser storage keys. Share links contain settings
and omit audio unless a library caller explicitly includes licensed audio.
See the [privacy page](https://sound-toy-patchcard.sociobot.in/privacy/).

After the first visit, the card maker reloads and works offline.

## Develop and verify

Use Node.js 20 or newer. Playwright 1.58.2 is pinned.

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:a11y
npm run check
```

`npm run build` creates the library in `dist/`, the complete site in
`dist/site/`, and an installable tarball in `dist/site/downloads/`.
The browser suites start a local production server. To test the deployed site:

```sh
PATCHCARD_TEST_URL=https://sound-toy-patchcard.sociobot.in npm run test:claims
PATCHCARD_TEST_URL=https://sound-toy-patchcard.sociobot.in npm run test:a11y
PATCHCARD_RELEASE_URL=https://sound-toy-patchcard.sociobot.in npm run test:release
```

Every public product claim and its command are listed in
[.factory/claims.json](.factory/claims.json). Demo storage and reset behavior
are documented in [.factory/demo.md](.factory/demo.md).

## Deploy

Deploy `dist/site` as the static-site root. It includes route files, the
designed 404 response configuration, security headers, cache rules, and
`release.json`. No server, database, payment service, or secret is needed.

## License

Patchcard is available under the [MIT license](LICENSE). Audio remains under
the license declared by its creator.
