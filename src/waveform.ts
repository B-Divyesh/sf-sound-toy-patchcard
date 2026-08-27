import type { PatchCard } from './types';

export function makeWaveform(patch: PatchCard, count = 72): number[] {
  if (patch.waveform?.samples.length) return [...patch.waveform.samples];
  let seed = 2166136261;
  for (const parameter of patch.parameters) {
    const token = `${parameter.id}:${String(parameter.value)}`;
    for (let index = 0; index < token.length; index++) seed = Math.imul(seed ^ token.charCodeAt(index), 16777619);
  }
  const values: number[] = [];
  for (let index = 0; index < count; index++) {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    const noise = ((seed >>> 0) / 4294967295) * 2 - 1;
    const envelope = Math.sin(Math.PI * index / (count - 1));
    values.push(Number((noise * envelope * 0.78).toFixed(4)));
  }
  return values;
}

export function waveformPath(samples: number[], width = 600, height = 160): string {
  const middle = height / 2;
  return samples.map((sample, index) => {
    const x = samples.length === 1 ? width / 2 : index * width / (samples.length - 1);
    const y = middle - sample * (height * 0.42);
    return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}
