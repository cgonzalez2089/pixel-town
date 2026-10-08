import { describe, expect, it } from 'vitest';
import { ratingLabel, resolveImageUrl, starParts } from './format';

describe('starParts', () => {
  it.each([
    [5, { full: 5, half: false, empty: 0 }],
    [4.5, { full: 4, half: true, empty: 0 }],
    [3, { full: 3, half: false, empty: 2 }],
    [0.5, { full: 0, half: true, empty: 4 }],
  ])('splits %s into stars', (rating, expected) => {
    expect(starParts(rating)).toEqual(expected);
  });
});

describe('ratingLabel', () => {
  it('describes the rating for screen readers', () => {
    expect(ratingLabel(4.5)).toBe('4.5 out of 5 stars');
  });
});

describe('resolveImageUrl', () => {
  it('leaves absolute URLs alone', () => {
    const url = 'https://image.tmdb.org/t/p/w342/x.jpg';
    expect(resolveImageUrl(url, '/pixel-town/')).toBe(url);
  });

  it('prefixes relative paths with the base path', () => {
    expect(resolveImageUrl('posters/heat.jpg', '/pixel-town/')).toBe(
      '/pixel-town/posters/heat.jpg',
    );
    expect(resolveImageUrl('posters/heat.jpg', '/pixel-town')).toBe('/pixel-town/posters/heat.jpg');
    expect(resolveImageUrl('posters/heat.jpg', '/')).toBe('/posters/heat.jpg');
  });
});
