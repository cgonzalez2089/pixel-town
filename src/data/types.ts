/**
 * Item schema shared by every store.
 *
 * Every store (movies, books, beers…) uses the same base shape, so the
 * shelves, overlay panel and "skip the game" view can render any of them.
 * A store that needs extra fields extends `Item` with its own type, e.g.
 * `type BookItem = Item<'book'> & { author: string }`.
 */

export const ITEM_TYPES = ['movie', 'book', 'beer'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_STATUSES = ['rated', 'wishlist'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

/** Ratings run from 0.5 to 5 in half-star steps. */
export const RATING_MIN = 0.5;
export const RATING_MAX = 5;
export const RATING_STEP = 0.5;

/** Calendar date in `YYYY-MM-DD` form. */
export type IsoDate = string;

interface ItemBase<TType extends ItemType> {
  /** Unique within its data file; used for DOM ids and keys. */
  id: string;
  title: string;
  type: TType;
  year: number;
  /** Absolute http(s) URL, or a path relative to `public/` (e.g. `posters/heat.jpg`). */
  imageUrl?: string;
  description: string;
  dateAdded: IsoDate;
}

/** Something I've finished and rated. A written review is optional. */
export interface RatedFields {
  status: 'rated';
  rating: number;
  review?: string;
}

/** Something I want to try. It can't have a rating or review yet. */
export interface WishlistFields {
  status: 'wishlist';
}

export type Item<TType extends ItemType = ItemType> = ItemBase<TType> &
  (RatedFields | WishlistFields);

export type MovieItem = Item<'movie'>;

export function isRated<T extends Item>(item: T): item is T & RatedFields {
  return item.status === 'rated';
}
