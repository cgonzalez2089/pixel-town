import { describe, expect, it } from 'vitest';
import { isIsoDate, isValidImageUrl, isValidRating, validateItems } from './validate';

const rated = {
  id: 'heat-1995',
  title: 'Heat',
  type: 'movie',
  year: 1995,
  description: 'Cops and robbers.',
  status: 'rated',
  rating: 4.5,
  review: 'Great.',
  dateAdded: '2026-09-14',
};

const wishlist = {
  id: 'seven-samurai-1954',
  title: 'Seven Samurai',
  type: 'movie',
  year: 1954,
  description: 'Samurai defend a village.',
  status: 'wishlist',
  dateAdded: '2026-10-03',
};

function errorsFor(raw: unknown): string[] {
  const result = validateItems(raw, 'movie', 'movies.json');
  return result.ok ? [] : result.errors;
}

describe('validateItems', () => {
  it('accepts valid rated and wishlist items', () => {
    const result = validateItems([rated, wishlist], 'movie', 'movies.json');
    expect(result).toEqual({ ok: true, items: [rated, wishlist] });
  });

  it('accepts a rated item without a review', () => {
    const { review: _review, ...noReview } = rated;
    expect(errorsFor([noReview])).toEqual([]);
  });

  it('accepts an empty list', () => {
    expect(errorsFor([])).toEqual([]);
  });

  it('rejects a non-array root', () => {
    expect(errorsFor({ items: [] })).toEqual(['movies.json: must be an array of items']);
  });

  it('rejects entries that are not objects', () => {
    expect(errorsFor([null, 'heat'])).toEqual([
      'movies.json[0]: must be an object',
      'movies.json[1]: must be an object',
    ]);
  });

  it('reports every missing required field with its location', () => {
    expect(errorsFor([{ status: 'wishlist' }])).toEqual([
      'movies.json[0].id: must be a non-empty string',
      'movies.json[0].title: must be a non-empty string',
      'movies.json[0].description: must be a non-empty string',
      'movies.json[0].type: must be one of movie, book, beer',
      'movies.json[0].year: must be a whole number',
      'movies.json[0].dateAdded: must be a real date in YYYY-MM-DD form',
    ]);
  });

  it('rejects an item of the wrong type for the file', () => {
    expect(errorsFor([{ ...rated, type: 'book' }])).toEqual([
      'movies.json[0].type: must be "movie" in this file',
    ]);
  });

  it('rejects an unknown status', () => {
    expect(errorsFor([{ ...wishlist, status: 'watching' }])).toEqual([
      'movies.json[0].status: must be one of rated, wishlist',
    ]);
  });

  it('requires a rating on rated items', () => {
    const { rating: _rating, ...noRating } = rated;
    expect(errorsFor([noRating])).toEqual(['movies.json[0].rating: must be 0.5–5 in steps of 0.5']);
  });

  it('rejects an empty review', () => {
    expect(errorsFor([{ ...rated, review: '  ' }])).toEqual([
      'movies.json[0].review: must be a non-empty string when present',
    ]);
  });

  it('rejects a rating or review on wishlist items', () => {
    expect(errorsFor([{ ...wishlist, rating: 4, review: 'Hmm' }])).toEqual([
      'movies.json[0].rating: unknown field (only rated items have this)',
      'movies.json[0].review: unknown field (only rated items have this)',
    ]);
  });

  it('rejects unknown fields so typos are caught', () => {
    expect(errorsFor([{ ...rated, raiting: 5 }])).toEqual([
      'movies.json[0].raiting: unknown field',
    ]);
  });

  it('rejects a bad imageUrl', () => {
    expect(errorsFor([{ ...rated, imageUrl: 'javascript:alert(1)' }])).toEqual([
      'movies.json[0].imageUrl: must be an http(s) URL or a relative path into public/',
    ]);
  });

  it('rejects duplicate ids', () => {
    expect(errorsFor([rated, { ...rated }])).toEqual([
      'movies.json[1].id: duplicate id "heat-1995"',
    ]);
  });

  it('rejects a non-integer year', () => {
    expect(errorsFor([{ ...rated, year: '1995' }])).toEqual([
      'movies.json[0].year: must be a whole number',
    ]);
  });
});

describe('isValidRating', () => {
  it.each([0.5, 1, 2.5, 4.5, 5])('accepts %s', (rating) => {
    expect(isValidRating(rating)).toBe(true);
  });

  it.each([0, 5.5, 3.3, -1, Number.NaN, '4'])('rejects %s', (rating) => {
    expect(isValidRating(rating)).toBe(false);
  });
});

describe('isIsoDate', () => {
  it.each(['2026-10-07', '2024-02-29'])('accepts %s', (date) => {
    expect(isIsoDate(date)).toBe(true);
  });

  it.each(['2026-02-30', '2025-02-29', '2026-13-01', '10/07/2026', '2026-10-7', 20261007])(
    'rejects %s',
    (date) => {
      expect(isIsoDate(date)).toBe(false);
    },
  );
});

describe('isValidImageUrl', () => {
  it.each([
    'https://image.tmdb.org/t/p/w342/abc.jpg',
    'http://example.com/a.png',
    'posters/heat.jpg',
  ])('accepts %s', (url) => {
    expect(isValidImageUrl(url)).toBe(true);
  });

  it.each([
    '',
    '/posters/heat.jpg',
    '../secret.png',
    'javascript:alert(1)',
    'data:image/png;base64,xyz',
    'https://',
    42,
  ])('rejects %s', (url) => {
    expect(isValidImageUrl(url)).toBe(false);
  });
});
