import { validatePatch } from './format';
import type { EncodeOptions, PatchCard } from './types';

// Keeps the full URL within a reliably scannable QR capacity. Larger cards can
// still travel as JSON files.
const MAX_ENCODED_LENGTH = 2_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function encodePatch(patch: PatchCard, options: EncodeOptions = {}): string {
  const result = validatePatch(patch);
  if (!result.valid) throw new TypeError(`Cannot encode patch: ${result.errors.join(' ')}`);
  const portable = structuredClone(result.value);
  if (!options.includeAudio) delete portable.audio;
  const encoded = bytesToBase64(new TextEncoder().encode(JSON.stringify(portable)))
    .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
  if (encoded.length > MAX_ENCODED_LENGTH) throw new RangeError('Patch is too large for a QR share link. Export JSON instead.');
  return encoded;
}

export function decodePatch(encoded: string): PatchCard {
  if (!encoded || encoded.length > MAX_ENCODED_LENGTH) throw new TypeError('Share code is empty or too large.');
  try {
    const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    const parsed: unknown = JSON.parse(new TextDecoder().decode(base64ToBytes(base64)));
    const result = validatePatch(parsed);
    if (!result.valid) throw new TypeError(result.errors.join(' '));
    return result.value;
  } catch (error) {
    if (error instanceof TypeError && error.message.startsWith('Share code')) throw error;
    throw new TypeError(`Share code is not a valid Patchcard: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

export function buildShareUrl(patch: PatchCard, baseUrl?: string): string {
  const fallback = typeof location === 'undefined' ? 'https://sound-toy-patchcard.sociobot.in/' : location.href;
  const url = new URL(baseUrl ?? fallback);
  url.search = '';
  url.hash = '';
  url.searchParams.set('patch', encodePatch(patch));
  return url.toString();
}
