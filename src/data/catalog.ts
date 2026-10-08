import { loadItems, type ItemSource } from './loader';
import type { Item, ItemStatus } from './types';

/** Every store's validated items, keyed by store id. */
export type Catalog = ReadonlyMap<string, readonly Item[]>;

/** Loads and validates all stores' data in parallel. Rejects on the first invalid file. */
export async function loadCatalog(
  stores: readonly { id: string; source: ItemSource }[],
): Promise<Catalog> {
  const entries = await Promise.all(
    stores.map(async ({ id, source }) => [id, await loadItems(source)] as const),
  );
  return new Map(entries);
}

/**
 * Items for one shelf: rated items best-first (ties by title), wishlist
 * items newest-first.
 */
export function itemsWithStatus<T extends Item>(items: readonly T[], status: ItemStatus): T[] {
  const matching = items.filter((item) => item.status === status);
  return matching.sort((a, b) => {
    if (a.status === 'rated' && b.status === 'rated' && a.rating !== b.rating) {
      return b.rating - a.rating;
    }
    if (a.status === 'wishlist' && a.dateAdded !== b.dateAdded) {
      return b.dateAdded.localeCompare(a.dateAdded);
    }
    return a.title.localeCompare(b.title);
  });
}
