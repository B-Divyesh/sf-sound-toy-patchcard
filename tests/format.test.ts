import { describe, expect, it } from 'vitest';
import { createPatch, decodePatch, encodePatch, updateParameter, validatePatch } from '../src';

const documented = () => createPatch({
  name: 'Rain beetle',
  toy: { name: 'Pocket drone', url: 'https://example.test/toy' },
  parameters: [
    { id: 'pitch', label: 'Pitch', value: 220, min: 80, max: 880, unit: 'Hz' },
    { id: 'grain', label: 'Grain', value: 0.35, min: 0, max: 1 },
    { id: 'hold', label: 'Hold', value: true },
    { id: 'voice', label: 'Voice', value: 'reed', options: [{ label: 'Reed', value: 'reed' }] }
  ]
});

describe('Patchcard v1', () => {
  it('@claim:exact-settings runs the documented create/encode/decode example with exact types', () => {
    const patch = documented();
    const restored = decodePatch(encodePatch(patch));
    expect(restored).toEqual(patch);
    expect(restored.parameters.map((item) => typeof item.value)).toEqual(['number', 'number', 'boolean', 'string']);
  });

  it('@claim:settings-only-share does not share audio unless explicitly requested', () => {
    const patch = { ...documented(), audio: { mime: 'audio/wav' as const, data: 'UklGRg==', license: 'CC0-1.0', creator: 'Ada', source: 'local render' } };
    expect(decodePatch(encodePatch(patch)).audio).toBeUndefined();
    expect(decodePatch(encodePatch(patch, { includeAudio: true })).audio).toEqual(patch.audio);
  });

  it('@claim:versioned-schema rejects future versions and invalid parameters clearly', () => {
    const future = { ...documented(), version: 2 };
    const result = validatePatch(future);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.join(' ')).toContain('version must be 1');
    expect(() => decodePatch('broken')).toThrow(/valid Patchcard/u);
  });

  it('@claim:licensed-audio rejects audio without complete rights metadata', () => {
    const patch = { ...documented(), audio: { mime: 'audio/wav', data: 'UklGRg==' } };
    const result = validatePatch(patch);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual(expect.arrayContaining([
        'audio.license is required.',
        'audio.creator is required.',
        'audio.source is required.'
      ]));
    }
  });

  it('updates without mutating the source', () => {
    const patch = documented();
    const next = updateParameter(patch, 'pitch', 330);
    expect(next.parameters[0]!.value).toBe(330);
    expect(patch.parameters[0]!.value).toBe(220);
    expect(() => updateParameter(patch, 'missing', 1)).toThrow(/Unknown parameter/u);
  });

  it('rejects duplicate parameter IDs', () => {
    const patch = documented();
    patch.parameters.push({ ...patch.parameters[0]! });
    const result = validatePatch(patch);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors).toContain('Parameter IDs must be unique.');
  });
});
