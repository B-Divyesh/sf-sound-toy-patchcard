import '../src/style.css';
import './site.css';
import { createPatch, decodePatch, mountPatchcard, validatePatch, type PatchCard, type PatchcardWidget } from '../src';

const STORAGE_KEY = 'patchcard:saved:v1';

function starterPatch(seed = 0): PatchCard {
  const names = ['Moss radio', 'Rain beetle', 'Saffron echo', 'Fern signal'];
  return createPatch({
    name: names[seed % names.length]!,
    toy: { name: 'Field oscillator', version: '1.0' },
    description: 'A tiny locally generated tone for trying the Patchcard format.',
    parameters: [
      { id: 'pitch', label: 'Pitch', value: 220 + seed * 37, min: 80, max: 880, step: 1, unit: 'Hz' },
      { id: 'flutter', label: 'Flutter', value: 0.22, min: 0, max: 1, step: 0.01 },
      { id: 'voice', label: 'Voice', value: 'sine', options: [
        { label: 'Soft reed', value: 'sine' }, { label: 'Dry stem', value: 'triangle' }, { label: 'Bright insect', value: 'square' }
      ]},
      { id: 'echo', label: 'Short echo', value: true }
    ]
  });
}

function loadSaved(): PatchCard[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const result = validatePatch(item);
      return result.valid ? [result.value] : [];
    });
  } catch { return []; }
}

let saved = loadSaved();
let sequence = saved.length;
let initialPatch = starterPatch();
const shareCode = new URL(location.href).searchParams.get('patch');
const errorBox = document.querySelector<HTMLElement>('[data-import-error]')!;
if (shareCode) {
  try { initialPatch = decodePatch(shareCode); }
  catch (error) {
    errorBox.hidden = false;
    errorBox.textContent = `${error instanceof Error ? error.message : 'This link is damaged.'} Start with the specimen below or ask for a fresh link.`;
  }
}

const nameInput = document.querySelector<HTMLInputElement>('#patch-name')!;
nameInput.value = initialPatch.name;
const widgetRoot = document.querySelector<HTMLElement>('#patch-widget')!;
let widget: PatchcardWidget;

function parameter<T extends string | number | boolean>(patch: PatchCard, id: string): T {
  return patch.parameters.find((item) => item.id === id)?.value as T;
}

function wavBlob(patch: PatchCard, seconds = 2.2): Blob {
  const rate = 22_050;
  const count = Math.floor(rate * seconds);
  const bytes = new ArrayBuffer(44 + count * 2);
  const view = new DataView(bytes);
  const write = (offset: number, value: string) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  write(0, 'RIFF'); view.setUint32(4, 36 + count * 2, true); write(8, 'WAVEfmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  write(36, 'data'); view.setUint32(40, count * 2, true);
  const pitch = parameter<number>(patch, 'pitch');
  const flutter = parameter<number>(patch, 'flutter');
  const voice = parameter<string>(patch, 'voice');
  const echo = parameter<boolean>(patch, 'echo');
  const delay = Math.floor(rate * .14);
  const signal = new Float32Array(count);
  for (let index = 0; index < count; index++) {
    const time = index / rate;
    const phase = time * pitch * (1 + Math.sin(time * 19) * flutter * .025);
    const cycle = phase % 1;
    const raw = voice === 'square' ? (cycle < .5 ? 1 : -1) : voice === 'triangle' ? 1 - 4 * Math.abs(cycle - .5) : Math.sin(phase * Math.PI * 2);
    const envelope = Math.min(1, time * 8) * Math.min(1, (seconds - time) * 2.5);
    signal[index] = raw * envelope * .38 + (echo && index >= delay ? signal[index - delay]! * .3 : 0);
    view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, signal[index]!)) * 32767, true);
  }
  return new Blob([bytes], { type: 'audio/wav' });
}

function renderSaved(): void {
  const list = document.querySelector<HTMLElement>('[data-saved-list]')!;
  const clear = document.querySelector<HTMLButtonElement>('[data-clear]')!;
  clear.hidden = saved.length === 0;
  if (!saved.length) {
    list.innerHTML = '<div class="empty-cabinet"><span aria-hidden="true">⌁</span><p><strong>No specimens pressed yet.</strong><br>Shape the sound, then choose “Save specimen.”</p></div>';
    return;
  }
  list.innerHTML = `<ul class="specimen-list">${saved.map((patch, index) => `<li><button type="button" data-open="${index}"><span><strong>${escapeHtml(patch.name)}</strong><small>${escapeHtml(patch.toy.name)} · ${patch.parameters.length} settings</small></span><span aria-hidden="true">↗</span></button><button class="specimen-delete" type="button" data-delete="${index}" aria-label="Delete ${escapeHtml(patch.name)}">×</button></li>`).join('')}</ul>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/gu, (match) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[match]!);
}

function persist(patch: PatchCard): void {
  saved = [structuredClone(patch), ...saved.filter((item) => item.id !== patch.id)].slice(0, 30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  renderSaved();
}

function mount(patch: PatchCard): void {
  nameInput.value = patch.name;
  if (widget) widget.destroy();
  widget = mountPatchcard(widgetRoot, {
    patch,
    shareBaseUrl: `${location.origin}${location.pathname}`,
    onSave: persist,
    renderAudio: wavBlob
  });
  widgetRoot.setAttribute('aria-busy', 'false');
}

mount(initialPatch);
renderSaved();

nameInput.addEventListener('input', () => {
  const value = nameInput.value.trim();
  if (value) widget.setPatch({ ...widget.getPatch(), name: value });
});

document.querySelector('[data-play]')!.addEventListener('click', async (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  button.disabled = true;
  button.innerHTML = '<span aria-hidden="true">■</span> Playing…';
  const url = URL.createObjectURL(wavBlob(widget.getPatch(), 1.7));
  const audio = new Audio(url);
  try { await audio.play(); await new Promise((resolve) => audio.addEventListener('ended', resolve, { once: true })); }
  catch { errorBox.hidden = false; errorBox.textContent = 'Sound playback was blocked. Press “Hear this sound” once more.'; }
  finally { URL.revokeObjectURL(url); button.disabled = false; button.innerHTML = '<span aria-hidden="true">▶</span> Hear this sound'; }
});

document.querySelector('[data-new]')!.addEventListener('click', () => mount(starterPatch(++sequence)));
document.querySelector('[data-example]')!.addEventListener('click', () => { mount(starterPatch(2)); document.querySelector('#workbench')!.scrollIntoView({ behavior: 'smooth' }); });

document.querySelector<HTMLInputElement>('#patch-import')!.addEventListener('change', async (event) => {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const value: unknown = JSON.parse(await file.text());
    const result = validatePatch(value);
    if (!result.valid) throw new TypeError(result.errors.join(' '));
    mount(result.value);
    errorBox.hidden = true;
  } catch (error) {
    errorBox.hidden = false;
    errorBox.textContent = `That file was not opened. ${error instanceof Error ? error.message : 'Choose a Patchcard JSON file.'}`;
  } finally { input.value = ''; }
});

document.querySelector('[data-saved-list]')!.addEventListener('click', (event) => {
  const target = event.target as Element;
  const open = target.closest<HTMLButtonElement>('[data-open]');
  const remove = target.closest<HTMLButtonElement>('[data-delete]');
  if (open) mount(saved[Number(open.dataset.open)]!);
  if (remove) {
    const index = Number(remove.dataset.delete);
    const specimen = saved[index]!;
    if (confirm(`Delete “${specimen.name}” from this browser? This cannot be undone.`)) {
      saved.splice(index, 1); localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); renderSaved();
    }
  }
});

document.querySelector('[data-clear]')!.addEventListener('click', () => {
  if (confirm(`Delete all ${saved.length} saved specimens from this browser? This cannot be undone.`)) {
    saved = []; localStorage.removeItem(STORAGE_KEY); renderSaved();
  }
});

document.querySelector('[data-copy-code]')!.addEventListener('click', async (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  try { await navigator.clipboard.writeText(document.querySelector('[data-code]')!.textContent ?? ''); button.textContent = 'Copied'; }
  catch { button.textContent = 'Select code to copy'; }
  setTimeout(() => { button.textContent = 'Copy code'; }, 1800);
});

const offline = document.querySelector<HTMLElement>('[data-offline]')!;
const updateOnline = () => { offline.hidden = navigator.onLine; };
addEventListener('online', updateOnline); addEventListener('offline', updateOnline); updateOnline();
if ('serviceWorker' in navigator && location.hostname !== 'localhost') addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
