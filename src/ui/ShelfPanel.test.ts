import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Item } from '../data/types';
import { createEventBus, type AppEvents } from '../events';
import { mountShelfPanel } from './ShelfPanel';

// jsdom has <dialog> but not its modal methods, so stand in minimal versions.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

const item: Item = {
  id: 'heat',
  title: 'Heat',
  type: 'movie',
  year: 1995,
  description: 'd',
  status: 'rated',
  rating: 5,
  dateAdded: '2026-01-01',
};

function setup() {
  const root = document.createElement('div');
  const bus = createEventBus<AppEvents>();
  const overlay = vi.fn();
  bus.on('overlay:change', overlay);
  mountShelfPanel(root, bus);
  const dialog = root.querySelector('dialog');
  if (!dialog) throw new Error('dialog not mounted');
  return { root, bus, overlay, dialog };
}

describe('mountShelfPanel', () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it('starts closed', () => {
    expect(ctx.dialog.open).toBe(false);
  });

  it('opens with the shelf contents and reports the overlay as open', () => {
    ctx.bus.emit('shelf:open', { storeName: 'Movie Store', shelfLabel: 'Rated', items: [item] });

    expect(ctx.dialog.open).toBe(true);
    expect(ctx.dialog.querySelector('h2')?.textContent).toBe('Rated');
    expect(ctx.dialog.textContent).toContain('Movie Store');
    expect(ctx.dialog.querySelectorAll('.item-card')).toHaveLength(1);
    expect(ctx.overlay).toHaveBeenLastCalledWith({ open: true });
  });

  it('shows a message for an empty shelf', () => {
    ctx.bus.emit('shelf:open', { storeName: 'S', shelfLabel: 'Empty', items: [] });
    expect(ctx.dialog.textContent).toContain('Nothing on this shelf yet.');
  });

  it('replaces the previous shelf contents', () => {
    ctx.bus.emit('shelf:open', {
      storeName: 'S',
      shelfLabel: 'A',
      items: [item, { ...item, id: 'x' }],
    });
    ctx.bus.emit('shelf:open', { storeName: 'S', shelfLabel: 'B', items: [item] });
    expect(ctx.dialog.querySelectorAll('.item-card')).toHaveLength(1);
  });

  it('closes from the close button and reports the overlay as closed', () => {
    ctx.bus.emit('shelf:open', { storeName: 'S', shelfLabel: 'A', items: [] });
    ctx.dialog.querySelector<HTMLButtonElement>('.panel__close')?.click();

    expect(ctx.dialog.open).toBe(false);
    expect(ctx.overlay).toHaveBeenLastCalledWith({ open: false });
  });

  it('closes when the backdrop is clicked', () => {
    ctx.bus.emit('shelf:open', { storeName: 'S', shelfLabel: 'A', items: [] });
    ctx.dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ctx.dialog.open).toBe(false);
  });

  it('stays open when content inside it is clicked', () => {
    ctx.bus.emit('shelf:open', { storeName: 'S', shelfLabel: 'A', items: [] });
    ctx.dialog.querySelector('h2')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ctx.dialog.open).toBe(true);
  });
});
