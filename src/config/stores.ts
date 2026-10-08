import type { ItemSource } from '../data/loader';
import type { ItemStatus } from '../data/types';
import type { TilePoint, TileRect } from '../game/maps/types';

/** A shelf inside a store: one row of shelf tiles holding items of one status. */
export interface ShelfConfig {
  id: string;
  /** Shown in the prompt and the panel title, e.g. "Watched & Rated". */
  label: string;
  status: ItemStatus;
  /** Leftmost tile of the shelf, in interior tiles. */
  x: number;
  y: number;
  /** Length in tiles. */
  width: number;
}

/** A store's interior: a walled room with the exit centred in the bottom wall. */
export interface InteriorConfig {
  width: number;
  height: number;
  shelves: ShelfConfig[];
}

export interface StoreConfig {
  id: string;
  name: string;
  source: ItemSource;
  /** Footprint in town tiles. The bottom two rows are wall, the rest roof. */
  building: TileRect;
  /** Town tile the player walks onto to enter. Must be on the building's bottom row. */
  door: TilePoint;
  interior: InteriorConfig;
}

/**
 * Every store in town. Adding a store means adding an entry here plus its
 * data file; `validateStores` checks the layout at startup and in tests.
 */
export const STORES: readonly StoreConfig[] = [
  {
    id: 'movies',
    name: 'Movie Store',
    source: {
      name: 'movies.json',
      type: 'movie',
      load: () => import('../data/movies.json').then((module) => module.default),
    },
    building: { x: 11, y: 3, width: 7, height: 5 },
    door: { x: 14, y: 7 },
    interior: {
      width: 12,
      height: 9,
      shelves: [
        { id: 'rated', label: 'Watched & Rated', status: 'rated', x: 2, y: 1, width: 3 },
        { id: 'watchlist', label: 'Watchlist', status: 'wishlist', x: 7, y: 1, width: 3 },
      ],
    },
  },
];

export function getStore(id: string): StoreConfig {
  const store = STORES.find((candidate) => candidate.id === id);
  if (!store) throw new Error(`Unknown store "${id}"`);
  return store;
}
