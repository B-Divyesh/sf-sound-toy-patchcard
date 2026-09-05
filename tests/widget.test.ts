import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPatch, mountPatchcard } from '../src';

const patch = () => createPatch({
  name: 'Test fern', toy: { name: 'Tiny toy' }, parameters: [
    { id: 'pitch', label: 'Pitch', value: 220, min: 100, max: 500 },
    { id: 'echo', label: 'Echo', value: false }
  ]
});

afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });

describe('mountPatchcard', () => {
  it('renders accessible native controls and applies keyboard-compatible changes', () => {
    document.body.innerHTML = '<div id="root"></div>';
    const onChange = vi.fn();
    const widget = mountPatchcard(document.querySelector('#root')!, { patch: patch(), onChange });
    const slider = document.querySelector<HTMLInputElement>('[data-pc-param="pitch"]')!;
    expect(slider.getAttribute('type')).toBe('range');
    slider.value = '330';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(widget.getPatch().parameters[0]!.value).toBe(330);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('calls the save adapter and can be destroyed', () => {
    document.body.innerHTML = '<div id="root"></div>';
    const onSave = vi.fn();
    const root = document.querySelector('#root')!;
    const widget = mountPatchcard(root, { patch: patch(), onSave });
    root.querySelector<HTMLButtonElement>('[data-pc-action="save"]')!.click();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test fern' }));
    widget.destroy();
    expect(root.innerHTML).toBe('');
  });

  it('does not report success when the host rejects a save', () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.querySelector('#root')!;
    const widget = mountPatchcard(root, { patch: patch(), onSave: () => false });
    root.querySelector<HTMLButtonElement>('[data-pc-action="save"]')!.click();
    const status = root.querySelector<HTMLElement>('[data-pc-status]')!;
    expect(status.dataset.state).toBe('error');
    expect(status.textContent).toMatch(/missing information/u);
    widget.destroy();
  });
});
