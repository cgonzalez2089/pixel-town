import type { AppEvents, EventBus } from '../events';
import { h } from './dom';
import { renderItemCard } from './itemCard';

/**
 * Modal panel listing a shelf's items. Built on <dialog>, which traps focus,
 * closes on ESC and restores focus on close. Opens on `shelf:open` and
 * reports `overlay:change` so the game can pause input.
 */
export function mountShelfPanel(root: HTMLElement, events: EventBus<AppEvents>): void {
  const title = h('h2', { class: 'panel__title', id: 'shelf-panel-title' });
  const eyebrow = h('p', { class: 'panel__eyebrow' });
  const list = h('ul', { class: 'panel__list', role: 'list' });
  const closeButton = h(
    'button',
    { class: 'panel__close', type: 'button', 'aria-label': 'Close' },
    '✕',
  );

  const dialog = h(
    'dialog',
    { class: 'panel', 'aria-labelledby': 'shelf-panel-title' },
    h('header', { class: 'panel__header' }, h('div', {}, eyebrow, title), closeButton),
    list,
  );
  root.append(dialog);

  closeButton.addEventListener('click', () => {
    dialog.close();
  });
  // Clicks on the backdrop land on the <dialog> itself rather than its content.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    events.emit('overlay:change', { open: false });
  });

  events.on('shelf:open', ({ storeName, shelfLabel, items }) => {
    eyebrow.textContent = storeName;
    title.textContent = shelfLabel;
    list.replaceChildren(
      ...(items.length > 0
        ? items.map((item) => h('li', {}, renderItemCard(item)))
        : [h('li', { class: 'panel__empty' }, 'Nothing on this shelf yet.')]),
    );
    list.scrollTop = 0;
    dialog.showModal();
    events.emit('overlay:change', { open: true });
  });
}
