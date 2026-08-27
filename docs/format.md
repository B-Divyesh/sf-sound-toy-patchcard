# Patchcard format v1

Patchcard is a JSON document for recalling a state in a browser sound toy. It
describes settings and a small visual fingerprint; it does not prescribe a
synthesizer or make two different engines sound identical.

## Compatibility contract

- `format` is always `"patchcard"`.
- `version` is the document schema version. V1 readers reject other versions.
- `toy.name` identifies the host; `toy.version` should change when its parameter
  interpretation changes.
- `parameters[].id` is the stable machine key. It must remain stable when a
  display label changes. Values preserve JSON type: number, string, or boolean.
- `waveform.samples` is a preview only, normalized from -1 to 1. It does not
  need to be sufficient for audio reconstruction.
- Audio is optional and WAV-only in v1. It requires `license`, `creator`, and
  `source`, and the standard encoder omits it unless `includeAudio` is true.

Hosts should match parameters by ID, ignore cosmetic label differences, and
surface missing IDs rather than silently substituting a value. A future schema
version will ship with explicit migration guidance.

## Security and size

Decoders validate the document, cap parameter and waveform counts, and limit
share codes to 2,000 characters so they remain practical as QR codes. Treat imported names and labels as untrusted
text. The supplied widget escapes them before placing them in HTML.

The canonical machine-readable definition is
[`schema/patchcard-v1.schema.json`](../schema/patchcard-v1.schema.json).
