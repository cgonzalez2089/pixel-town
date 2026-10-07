import { describe, expect, it } from 'vitest';
import { ItemDataError, loadItems } from './loader';
import movies from './movies.json';

describe('loadItems', () => {
  it('returns validated items', async () => {
    const items = await loadItems({
      name: 'movies.json',
      type: 'movie',
      load: () => Promise.resolve(movies),
    });
    expect(items).toHaveLength(movies.length);
  });

  it('throws an ItemDataError listing every problem', async () => {
    const load = () => Promise.resolve([{ id: 'x' }]);
    const error: unknown = await loadItems({ name: 'bad.json', type: 'movie', load }).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ItemDataError);
    const { source, problems, message } = error as ItemDataError;
    expect(source).toBe('bad.json');
    expect(problems).toContain('bad.json[0].title: must be a non-empty string');
    expect(problems.length).toBeGreaterThan(1);
    expect(message).toContain('Invalid item data in bad.json');
  });

  it('propagates errors from the source itself', async () => {
    const load = () => Promise.reject(new Error('network down'));
    await expect(loadItems({ name: 'movies.json', type: 'movie', load })).rejects.toThrow(
      'network down',
    );
  });
});

describe('movies.json', () => {
  it('is valid sample data', async () => {
    const items = await loadItems({
      name: 'movies.json',
      type: 'movie',
      load: () => Promise.resolve(movies),
    });
    expect(items.some((item) => item.status === 'rated')).toBe(true);
    expect(items.some((item) => item.status === 'wishlist')).toBe(true);
  });
});
