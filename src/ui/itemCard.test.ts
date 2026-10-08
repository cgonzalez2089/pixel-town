import { describe, expect, it } from 'vitest';
import type { Item } from '../data/types';
import { renderItemCard } from './itemCard';

const rated: Item = {
  id: 'heat-1995',
  title: 'Heat',
  type: 'movie',
  year: 1995,
  imageUrl: 'https://example.com/heat.jpg',
  description: 'Cops and robbers.',
  status: 'rated',
  rating: 4.5,
  review: 'Great <b>shootout</b>.',
  dateAdded: '2026-09-14',
};

const wishlist: Item = {
  id: 'seven-samurai',
  title: 'Seven Samurai',
  type: 'movie',
  year: 1954,
  description: 'Samurai defend a village.',
  status: 'wishlist',
  dateAdded: '2026-10-03',
};

describe('renderItemCard', () => {
  it('shows title, year, description, rating and review', () => {
    const card = renderItemCard(rated, '/');
    expect(card.querySelector('h3')?.textContent).toBe('Heat (1995)');
    expect(card.textContent).toContain('Cops and robbers.');
    expect(card.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      '4.5 out of 5 stars',
    );
    expect(card.querySelectorAll('.star--full')).toHaveLength(4);
    expect(card.querySelectorAll('.star--half')).toHaveLength(1);
    expect(card.querySelector('blockquote')?.textContent).toBe('Great <b>shootout</b>.');
  });

  it('treats review text as text, not HTML', () => {
    const card = renderItemCard(rated, '/');
    expect(card.querySelector('b')).toBeNull();
  });

  it('is labelled by its heading', () => {
    const card = renderItemCard(rated, '/');
    const heading = card.querySelector('h3');
    expect(heading?.id).toBe('item-heat-1995');
    expect(card.getAttribute('aria-labelledby')).toBe('item-heat-1995');
  });

  it('renders a poster with alt text', () => {
    const image = renderItemCard(rated, '/').querySelector('img');
    expect(image?.getAttribute('src')).toBe('https://example.com/heat.jpg');
    expect(image?.alt).toBe('Poster for Heat');
  });

  it('swaps a broken poster for a placeholder', () => {
    const card = renderItemCard(rated, '/');
    card.querySelector('img')?.dispatchEvent(new Event('error'));
    expect(card.querySelector('img')).toBeNull();
    expect(card.querySelector('.item-card__poster--empty')?.textContent).toBe('Heat');
  });

  it('shows a placeholder and no rating or review for wishlist items', () => {
    const card = renderItemCard(wishlist, '/');
    expect(card.querySelector('img')).toBeNull();
    expect(card.querySelector('.item-card__poster--empty')).not.toBeNull();
    expect(card.querySelector('.stars')).toBeNull();
    expect(card.querySelector('blockquote')).toBeNull();
  });
});
