# Patchcard demo sandbox

## Entry point

Open <https://sound-toy-patchcard.sociobot.in/demo/> or use the first-screen
**Try it with sample data** link. No account or setup is needed.

## Sample

The demo opens **Saffron echo**, a card for the sample Pocket oscillator. It
has pitch, flutter, voice, and short-echo controls. A saved sample appears
beside the editable card, so the result is populated on entry.

## Isolation

- Real cards use `patchcard:saved:v1`.
- Demo changes use `demo:patchcard:saved:v1`.
- Demo code never reads or writes the real key.
- **Start for real** deletes the demo key before returning home.

## Reset

Choose **Reset demo** in the persistent demo banner. The action deletes the
demo key, restores Saffron echo, refreshes the demo list, and focuses the card
name. It does not read or change real cards.

## Verification

From a clean checkout:

```sh
npm ci
npm run build
npm run test:claims
```

The save-and-reset claim seeds a sentinel in the real key and proves it remains
unchanged through the complete demo flow.
