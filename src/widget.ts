import { updateParameter, validatePatch } from './format';
import { buildShareUrl } from './share';
import type { PatchCard, PatchParameter, PatchValue, PatchcardWidget, WidgetOptions } from './types';
import { makeWaveform, waveformPath } from './waveform';

let widgetCount = 0;

function escape(value: string): string {
  return value.replace(/[&<>'"]/gu, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]!);
}

function parameterControl(parameter: PatchParameter): string {
  const id = `pc-${escape(parameter.id)}`;
  if (typeof parameter.value === 'boolean') {
    return `<label class="patchcard__toggle" for="${id}"><span>${escape(parameter.label)}</span><input id="${id}" data-pc-param="${escape(parameter.id)}" type="checkbox" ${parameter.value ? 'checked' : ''}><span class="patchcard__switch" aria-hidden="true"></span></label>`;
  }
  if (parameter.options?.length) {
    return `<label class="patchcard__field" for="${id}"><span>${escape(parameter.label)}</span><select id="${id}" data-pc-param="${escape(parameter.id)}">${parameter.options.map((option) => `<option value="${escape(option.value)}" ${option.value === parameter.value ? 'selected' : ''}>${escape(option.label)}</option>`).join('')}</select></label>`;
  }
  if (typeof parameter.value === 'number') {
    const min = parameter.min ?? 0;
    const max = parameter.max ?? 1;
    const step = parameter.step ?? (max - min) / 100;
    return `<label class="patchcard__field" for="${id}"><span>${escape(parameter.label)}</span><span class="patchcard__range"><input id="${id}" data-pc-param="${escape(parameter.id)}" type="range" min="${min}" max="${max}" step="${step}" value="${parameter.value}"><output for="${id}" data-pc-output="${escape(parameter.id)}">${parameter.value}${parameter.unit ? ` ${escape(parameter.unit)}` : ''}</output></span></label>`;
  }
  return `<label class="patchcard__field" for="${id}"><span>${escape(parameter.label)}</span><input id="${id}" data-pc-param="${escape(parameter.id)}" type="text" value="${escape(parameter.value)}"></label>`;
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileName(name: string, extension: string): string {
  const safe = name.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '') || 'patch';
  return `${safe}.${extension}`;
}

export function mountPatchcard(target: Element, options: WidgetOptions): PatchcardWidget {
  const initial = validatePatch(options.patch);
  if (!initial.valid) throw new TypeError(`Invalid widget patch: ${initial.errors.join(' ')}`);
  let patch = initial.value;
  let disposed = false;
  const waveTitleId = `pc-wave-title-${++widgetCount}`;

  target.classList.add('patchcard');
  target.innerHTML = `
    <div class="patchcard__sheet">
      <header class="patchcard__header">
        <span class="patchcard__eyebrow">Sound card · format v1</span>
        <h2 data-pc-name>${escape(patch.name)}</h2>
        <p>Made in <strong data-pc-toy>${escape(patch.toy.name)}</strong></p>
      </header>
      <figure class="patchcard__waveform">
        <svg viewBox="0 0 600 160" role="img" aria-labelledby="${waveTitleId}"><title id="${waveTitleId}">Waveform sketch for ${escape(patch.name)}</title><line x1="0" y1="80" x2="600" y2="80"/><path data-pc-wave d="${waveformPath(makeWaveform(patch))}"/></svg>
        <figcaption>This waveform is a preview. The controls below store the exact values.</figcaption>
      </figure>
      <div class="patchcard__parameters" data-pc-parameters>${patch.parameters.map(parameterControl).join('')}</div>
      <div class="patchcard__status" data-pc-status role="status" aria-live="polite">Card ready.</div>
      <div class="patchcard__actions">
        <button type="button" class="patchcard__primary" data-pc-action="save">Save card</button>
        <button type="button" data-pc-action="json">Export JSON</button>
        <button type="button" data-pc-action="share">Copy share link</button>
        <button type="button" data-pc-action="print">Print card</button>
        ${options.renderAudio ? '<button type="button" data-pc-action="audio">Render WAV</button>' : ''}
      </div>
      <section class="patchcard__travel" data-pc-travel hidden aria-label="Share this card">
        <div data-pc-qr aria-hidden="true"></div>
        <div><strong>Share this card</strong><p>Scan on another device. The link contains settings and leaves out WAV audio.</p></div>
      </section>
    </div>`;

  const status = target.querySelector<HTMLElement>('[data-pc-status]')!;
  const controls = target.querySelector<HTMLElement>('[data-pc-parameters]')!;
  const setStatus = (message: string, state = '') => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const draw = () => {
    target.querySelector<SVGPathElement>('[data-pc-wave]')!.setAttribute('d', waveformPath(makeWaveform({ ...patch, waveform: undefined })));
    const title = target.querySelector('svg title');
    if (title) title.textContent = `Waveform sketch for ${patch.name}`;
  };

  const emit = () => {
    draw();
    setStatus('Changed · not saved', 'dirty');
    options.onChange?.(structuredClone(patch));
  };

  const onInput = (event: Event) => {
    const input = (event.target as Element).closest<HTMLInputElement | HTMLSelectElement>('[data-pc-param]');
    if (!input) return;
    const parameter = patch.parameters.find((item) => item.id === input.dataset.pcParam);
    if (!parameter) return;
    let value: PatchValue;
    if (input instanceof HTMLInputElement && input.type === 'checkbox') value = input.checked;
    else if (typeof parameter.value === 'number') value = Number(input.value);
    else value = input.value;
    try {
      patch = updateParameter(patch, parameter.id, value);
      const output = [...target.querySelectorAll<HTMLOutputElement>('[data-pc-output]')]
        .find((item) => item.dataset.pcOutput === parameter.id);
      if (output) output.textContent = `${value}${parameter.unit ? ` ${parameter.unit}` : ''}`;
      emit();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'That value could not be applied.', 'error');
    }
  };

  const showQr = async (url: string) => {
    const { default: qrcode } = await import('qrcode-generator');
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const travel = target.querySelector<HTMLElement>('[data-pc-travel]')!;
    target.querySelector<HTMLElement>('[data-pc-qr]')!.innerHTML = qr.createSvgTag(3, 1);
    travel.hidden = false;
  };

  const onClick = async (event: Event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-pc-action]');
    if (!button) return;
    const action = button.dataset.pcAction;
    if (action === 'save') {
      const saved = options.onSave?.(structuredClone(patch));
      if (saved === false) setStatus('Enter the missing information before saving this card.', 'error');
      else setStatus('Card saved in this browser.', 'success');
    } else if (action === 'json') {
      download(new Blob([JSON.stringify(patch, null, 2)], { type: 'application/json' }), fileName(patch.name, 'patchcard.json'));
      setStatus('JSON exported.', 'success');
    } else if (action === 'share') {
      try {
        const url = buildShareUrl(patch, options.shareBaseUrl);
        await showQr(url);
        await navigator.clipboard.writeText(url);
        setStatus('Settings link copied.', 'success');
      } catch (error) {
        const qrVisible = !target.querySelector<HTMLElement>('[data-pc-travel]')!.hidden;
        setStatus(qrVisible ? 'QR is ready. Your browser blocked clipboard access.' :
          (error instanceof Error ? error.message : 'The share link could not be made.'), qrVisible ? 'success' : 'error');
      }
    } else if (action === 'print') {
      window.print();
    } else if (action === 'audio' && options.renderAudio) {
      button.disabled = true;
      setStatus('Rendering WAV on this device…');
      try {
        const blob = await options.renderAudio(structuredClone(patch));
        download(blob, fileName(patch.name, 'wav'));
        setStatus('WAV rendered on this device.', 'success');
      } catch {
        setStatus('WAV could not be rendered. Check the sound toy and try again.', 'error');
      } finally {
        button.disabled = false;
      }
    }
  };

  controls.addEventListener('input', onInput);
  controls.addEventListener('change', onInput);
  target.addEventListener('click', onClick);

  return {
    getPatch: () => structuredClone(patch),
    setPatch(next) {
      const result = validatePatch(next);
      if (!result.valid) throw new TypeError(`Invalid patch: ${result.errors.join(' ')}`);
      patch = result.value;
      target.querySelector<HTMLElement>('[data-pc-name]')!.textContent = patch.name;
      target.querySelector<HTMLElement>('[data-pc-toy]')!.textContent = patch.toy.name;
      controls.innerHTML = patch.parameters.map(parameterControl).join('');
      draw();
      setStatus('Card opened.', 'success');
    },
    setParameter(id, value) {
      patch = updateParameter(patch, id, value);
      controls.innerHTML = patch.parameters.map(parameterControl).join('');
      emit();
    },
    destroy() {
      if (disposed) return;
      controls.removeEventListener('input', onInput);
      controls.removeEventListener('change', onInput);
      target.removeEventListener('click', onClick);
      target.classList.remove('patchcard');
      target.innerHTML = '';
      disposed = true;
    }
  };
}
