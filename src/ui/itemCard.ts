import { isRated, type Item } from '../data/types';
import { h } from './dom';
import { ratingLabel, resolveImageUrl, starParts } from './format';

function stars(rating: number): HTMLElement {
  const { full, half, empty } = starParts(rating);
  const icons = [
    ...Array.from({ length: full }, () => h('span', { class: 'star star--full' }, '★')),
    half && h('span', { class: 'star star--half' }, '★'),
    ...Array.from({ length: empty }, () => h('span', { class: 'star star--empty' }, '★')),
  ];
  return h(
    'p',
    { class: 'item-card__rating' },
    h('span', { class: 'stars', role: 'img', 'aria-label': ratingLabel(rating) }, ...icons),
    h('span', { class: 'item-card__score', 'aria-hidden': 'true' }, `${rating}/5`),
  );
}

function posterPlaceholder(title: string): HTMLElement {
  return h(
    'div',
    { class: 'item-card__poster item-card__poster--empty', 'aria-hidden': 'true' },
    title,
  );
}

function poster(item: Item, base: string): HTMLElement {
  if (!item.imageUrl) return posterPlaceholder(item.title);

  const image = h('img', {
    class: 'item-card__poster',
    src: resolveImageUrl(item.imageUrl, base),
    alt: `Poster for ${item.title}`,
    loading: 'lazy',
    width: '120',
    height: '180',
  });
  // A dead link falls back to the placeholder instead of a broken-image icon.
  image.addEventListener(
    'error',
    () => {
      image.replaceWith(posterPlaceholder(item.title));
    },
    { once: true },
  );
  return image;
}

/** One item as an accessible card: poster, title, year, rating, description and review. */
export function renderItemCard(item: Item, base = import.meta.env.BASE_URL): HTMLElement {
  const headingId = `item-${item.id}`;
  return h(
    'article',
    { class: 'item-card', 'aria-labelledby': headingId },
    poster(item, base),
    h(
      'div',
      { class: 'item-card__body' },
      h(
        'h3',
        { class: 'item-card__title', id: headingId },
        item.title,
        ' ',
        h('span', { class: 'item-card__year' }, `(${item.year})`),
      ),
      isRated(item) && stars(item.rating),
      h('p', { class: 'item-card__description' }, item.description),
      isRated(item) &&
        item.review !== undefined &&
        h('blockquote', { class: 'item-card__review' }, h('p', {}, item.review)),
    ),
  );
}
