import { describe, expect, it } from 'vitest';
import { itemsWithStatus, loadCatalog } from './catalog';
import { ItemDataError } from './loader';
import type { Item } from './types';

const base = { type: 'movie', year: 2000, description: 'd' } as const;

const items: Item[] = [
  { ...base, id: 'b', title: 'B', status: 'rated', rating: 4, dateAdded: '2026-01-01' },
  { ...base, id: 'a', title: 'A', status: 'rated', rating: 4, dateAdded: '2026-01-02' },
  { ...base, id: 'c', title: 'C', status: 'rated', rating: 5, dateAdded: '2026-01-03' },
  { ...base, id: 'old', title: 'Old', status: 'wishlist', dateAdded: '2026-01-01' },
  { ...base, id: 'new', title: 'New', status: 'wishlist', dateAdded: '2026-03-01' },
];

const ids = (list: readonly Item[]) => list.map((item) => item.id);

describe('itemsWithStatus', () => {
  it('sorts rated items best first, then by title', () => {
    expect(ids(itemsWithStatus(items, 'rated'))).toEqual(['c', 'a', 'b']);
  });

  it('sorts wishlist items newest first', () => {
    expect(ids(itemsWithStatus(items, 'wishlist'))).toEqual(['new', 'old']);
  });

  it('does not reorder the input', () => {
    itemsWithStatus(items, 'rated');
    expect(ids(items)).toEqual(['b', 'a', 'c', 'old', 'new']);
  });
});

describe('loadCatalog', () => {
  it('maps each store id to its validated items', async () => {
    const catalog = await loadCatalog([
      {
        id: 'movies',
        source: { name: 'm.json', type: 'movie', load: () => Promise.resolve(items) },
      },
      { id: 'empty', source: { name: 'e.json', type: 'movie', load: () => Promise.resolve([]) } },
    ]);
    expect(catalog.get('movies')).toHaveLength(items.length);
    expect(catalog.get('empty')).toEqual([]);
  });

  it('rejects when any store has invalid data', async () => {
    const promise = loadCatalog([
      { id: 'bad', source: { name: 'bad.json', type: 'movie', load: () => Promise.resolve([{}]) } },
    ]);
    await expect(promise).rejects.toBeInstanceOf(ItemDataError);
  });
});
