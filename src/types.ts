export type PatchValue = string | number | boolean;

export interface PatchParameter {
  id: string;
  label: string;
  value: PatchValue;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface PatchToy {
  name: string;
  url?: string;
  version?: string;
}

export interface PatchWaveform {
  kind: 'samples';
  /** Normalized amplitudes from -1 to 1, limited to 256 points. */
  samples: number[];
}

export interface PatchAudio {
  mime: 'audio/wav';
  /** Base64 payload or data URL. Never included in shares unless opted in. */
  data: string;
  license: string;
  creator: string;
  source: string;
}

export interface PatchCard {
  format: 'patchcard';
  version: 1;
  id: string;
  name: string;
  createdAt: string;
  toy: PatchToy;
  description?: string;
  parameters: PatchParameter[];
  waveform?: PatchWaveform;
  audio?: PatchAudio;
}

export type PatchInput = Omit<PatchCard, 'format' | 'version' | 'id' | 'createdAt'> &
  Partial<Pick<PatchCard, 'id' | 'createdAt'>>;

export type ValidationResult =
  | { valid: true; value: PatchCard }
  | { valid: false; errors: string[] };

export interface EncodeOptions {
  /** Audio is private by default. Set true only with the creator's consent. */
  includeAudio?: boolean;
}

export interface WidgetOptions {
  patch: PatchCard;
  onChange?: (patch: PatchCard) => void;
  renderAudio?: (patch: PatchCard) => Promise<Blob> | Blob;
  shareBaseUrl?: string;
  onSave?: (patch: PatchCard) => void;
}

export interface PatchcardWidget {
  getPatch(): PatchCard;
  setPatch(patch: PatchCard): void;
  setParameter(id: string, value: PatchValue): void;
  destroy(): void;
}
