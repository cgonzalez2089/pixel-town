import type { Item, ItemType } from './types';
import { validateItems } from './validate';

/** Where a store's items come from. `load` returns untrusted JSON. */
export interface ItemSource<TType extends ItemType = ItemType> {
  /** Human-readable name used in error messages, e.g. `movies.json`. */
  name: string;
  type: TType;
  load: () => Promise<unknown>;
}

export class ItemDataError extends Error {
  constructor(
    readonly source: string,
    readonly problems: readonly string[],
  ) {
    super(`Invalid item data in ${source}:\n  - ${problems.join('\n  - ')}`);
    this.name = 'ItemDataError';
  }
}

/** Loads and validates a store's items. Throws `ItemDataError` if the data is invalid. */
export async function loadItems<TType extends ItemType>(
  source: ItemSource<TType>,
): Promise<Item<TType>[]> {
  const raw = await source.load();
  const result = validateItems(raw, source.type, source.name);
  if (!result.ok) throw new ItemDataError(source.name, result.errors);
  return result.items;
}
