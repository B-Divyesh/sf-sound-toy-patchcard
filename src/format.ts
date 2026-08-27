import type {
  PatchAudio,
  PatchCard,
  PatchInput,
  PatchParameter,
  PatchValue,
  ValidationResult
} from './types';

const ID = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/;
const MAX_PARAMETERS = 64;
const MAX_AUDIO_CHARS = 20_000_000;

function uid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `pc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validValue(value: unknown): value is PatchValue {
  return typeof value === 'string' || typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value));
}

function validateParameter(value: unknown, index: number, errors: string[]): value is PatchParameter {
  const path = `parameters[${index}]`;
  if (!isObject(value)) {
    errors.push(`${path} must be an object.`);
    return false;
  }
  if (typeof value.id !== 'string' || !ID.test(value.id)) errors.push(`${path}.id is invalid.`);
  if (typeof value.label !== 'string' || !value.label.trim()) errors.push(`${path}.label is required.`);
  if (!validValue(value.value)) errors.push(`${path}.value must be a finite number, string, or boolean.`);
  for (const key of ['min', 'max', 'step'] as const) {
    if (value[key] !== undefined && (typeof value[key] !== 'number' || !Number.isFinite(value[key]))) {
      errors.push(`${path}.${key} must be a finite number.`);
    }
  }
  if (typeof value.value === 'number') {
    if (typeof value.min === 'number' && value.value < value.min) errors.push(`${path}.value is below min.`);
    if (typeof value.max === 'number' && value.value > value.max) errors.push(`${path}.value is above max.`);
    if (typeof value.min === 'number' && typeof value.max === 'number' && value.max <= value.min) {
      errors.push(`${path}.max must be greater than min.`);
    }
  }
  if (value.options !== undefined) {
    if (!Array.isArray(value.options) || value.options.some((option) =>
      !isObject(option) || typeof option.label !== 'string' || typeof option.value !== 'string')) {
      errors.push(`${path}.options must contain string labels and values.`);
    }
  }
  return true;
}

function validateAudio(value: unknown, errors: string[]): value is PatchAudio {
  if (!isObject(value)) {
    errors.push('audio must be an object.');
    return false;
  }
  if (value.mime !== 'audio/wav') errors.push('audio.mime must be audio/wav.');
  if (typeof value.data !== 'string' || !value.data || value.data.length > MAX_AUDIO_CHARS) {
    errors.push('audio.data must be a non-empty payload under 20 MB.');
  }
  for (const key of ['license', 'creator', 'source'] as const) {
    if (typeof value[key] !== 'string' || !value[key].trim()) errors.push(`audio.${key} is required.`);
  }
  return true;
}

export function validatePatch(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(value)) return { valid: false, errors: ['Patch must be an object.'] };
  if (value.format !== 'patchcard') errors.push('format must be "patchcard".');
  if (value.version !== 1) errors.push('version must be 1. This decoder will not guess future formats.');
  if (typeof value.id !== 'string' || !value.id.trim() || value.id.length > 128) errors.push('id is required.');
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 120) errors.push('name is required and must be at most 120 characters.');
  if (typeof value.createdAt !== 'string' || Number.isNaN(Date.parse(value.createdAt))) errors.push('createdAt must be an ISO date.');
  if (!isObject(value.toy) || typeof value.toy.name !== 'string' || !value.toy.name.trim()) errors.push('toy.name is required.');
  if (!Array.isArray(value.parameters) || value.parameters.length === 0 || value.parameters.length > MAX_PARAMETERS) {
    errors.push(`parameters must contain 1–${MAX_PARAMETERS} items.`);
  } else {
    value.parameters.forEach((parameter, index) => validateParameter(parameter, index, errors));
    const ids = value.parameters.map((parameter) => isObject(parameter) ? parameter.id : undefined);
    if (new Set(ids).size !== ids.length) errors.push('Parameter IDs must be unique.');
  }
  if (value.waveform !== undefined) {
    if (!isObject(value.waveform) || value.waveform.kind !== 'samples' || !Array.isArray(value.waveform.samples) ||
      value.waveform.samples.length < 2 || value.waveform.samples.length > 256 ||
      value.waveform.samples.some((sample) => typeof sample !== 'number' || !Number.isFinite(sample) || sample < -1 || sample > 1)) {
      errors.push('waveform must contain 2–256 normalized samples.');
    }
  }
  if (value.audio !== undefined) validateAudio(value.audio, errors);
  return errors.length ? { valid: false, errors } : { valid: true, value: structuredClone(value) as unknown as PatchCard };
}

export function createPatch(input: PatchInput): PatchCard {
  const candidate: PatchCard = {
    ...structuredClone(input),
    format: 'patchcard',
    version: 1,
    id: input.id ?? uid(),
    createdAt: input.createdAt ?? new Date().toISOString()
  };
  const result = validatePatch(candidate);
  if (!result.valid) throw new TypeError(`Invalid patch: ${result.errors.join(' ')}`);
  return result.value;
}

export function updateParameter(patch: PatchCard, id: string, value: PatchValue): PatchCard {
  const index = patch.parameters.findIndex((parameter) => parameter.id === id);
  if (index < 0) throw new RangeError(`Unknown parameter: ${id}`);
  const next = structuredClone(patch);
  next.parameters[index]!.value = value;
  const result = validatePatch(next);
  if (!result.valid) throw new TypeError(`Invalid parameter value: ${result.errors.join(' ')}`);
  return result.value;
}
