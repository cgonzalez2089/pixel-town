import type { InteriorConfig, ShelfConfig, StoreConfig } from '../../config/stores';
import { isSolid, Tile, type TileId } from './tiles';
import type { MapDefinition, TilePoint, TileRect } from './types';

/** Rows at the bottom of a building drawn as wall; everything above is roof. */
export const BUILDING_WALL_ROWS = 2;

export function sameTile(a: TilePoint, b: TilePoint): boolean {
  return a.x === b.x && a.y === b.y;
}

function contains(rect: TileRect, { x, y }: TilePoint): boolean {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}

function overlaps(a: TileRect, b: TileRect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function setTile(tiles: TileId[][], { x, y }: TilePoint, tile: TileId): void {
  const row = tiles[y];
  if (!row || x < 0 || x >= row.length) throw new Error(`Tile (${x}, ${y}) is outside the map`);
  row[x] = tile;
}

function fillRect(tiles: TileId[][], rect: TileRect, tileAt: (y: number) => TileId): void {
  for (let y = rect.y; y < rect.y + rect.height; y++) {
    for (let x = rect.x; x < rect.x + rect.width; x++) setTile(tiles, { x, y }, tileAt(y));
  }
}

/** The town tile just below a store's door, where the player appears when leaving. */
export function outsideDoor(store: StoreConfig): TilePoint {
  return { x: store.door.x, y: store.door.y + 1 };
}

/** The interior exit tile, centred in the bottom wall. */
export function interiorExit({ width, height }: InteriorConfig): TilePoint {
  return { x: Math.floor(width / 2), y: height - 1 };
}

/**
 * Rows in front of a shelf from which it can be used. Two, because the
 * sprite's head is a tile above its feet: standing "at" the shelf visually
 * can still leave the feet a row away.
 */
export const SHELF_REACH_ROWS = 2;

/** The shelf the player can use from `feet`, if they stand in front of (below) one. */
export function shelfInReach<S extends ShelfConfig>(
  feet: TilePoint,
  shelves: readonly S[],
): S | undefined {
  return shelves.find(
    (shelf) =>
      feet.y > shelf.y &&
      feet.y <= shelf.y + SHELF_REACH_ROWS &&
      feet.x >= shelf.x &&
      feet.x < shelf.x + shelf.width,
  );
}

/** Stamps each store's building and door onto a copy of the town terrain. */
export function buildTownMap(
  terrain: MapDefinition,
  stores: readonly StoreConfig[],
): MapDefinition {
  const tiles = terrain.tiles.map((row) => [...row]);
  for (const { building, door } of stores) {
    const firstWallRow = building.y + building.height - BUILDING_WALL_ROWS;
    fillRect(tiles, building, (y) => (y >= firstWallRow ? Tile.Wall : Tile.Roof));
    setTile(tiles, door, Tile.Door);
  }
  return { ...terrain, tiles };
}

/** Generates a store interior: walls, floor, shelves and an exit mat. */
export function buildInteriorMap(interior: InteriorConfig): MapDefinition {
  const { width, height } = interior;
  const tiles = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x): TileId => {
      const isEdge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      return isEdge ? Tile.InnerWall : Tile.Floor;
    }),
  );
  for (const shelf of interior.shelves) fillRect(tiles, { ...shelf, height: 1 }, () => Tile.Shelf);

  const exit = interiorExit(interior);
  setTile(tiles, exit, Tile.Exit);
  return { tiles, spawn: { x: exit.x, y: exit.y - 1 } };
}

function validateInterior(interior: InteriorConfig, at: string): string[] {
  const errors: string[] = [];
  const { width, height, shelves } = interior;
  if (width < 3 || height < 3) return [`${at}.interior: must be at least 3×3 tiles`];

  const floor: TileRect = { x: 1, y: 1, width: width - 2, height: height - 2 };
  const spawn = { x: interiorExit(interior).x, y: height - 2 };
  const seen = new Set<string>();

  shelves.forEach((shelf, index) => {
    const where = `${at}.interior.shelves[${shelf.id}]`;
    const rect: TileRect = { ...shelf, height: 1 };
    if (seen.has(shelf.id)) errors.push(`${where}: duplicate shelf id`);
    seen.add(shelf.id);

    const last = { x: shelf.x + shelf.width - 1, y: shelf.y };
    if (shelf.width < 1 || !contains(floor, shelf) || !contains(floor, last)) {
      errors.push(`${where}: must sit on the floor, inside the walls`);
    }
    if (contains(rect, spawn)) errors.push(`${where}: blocks the entrance`);
    shelves.slice(0, index).forEach((other) => {
      if (overlaps(rect, { ...other, height: 1 })) {
        errors.push(`${where}: overlaps shelf "${other.id}"`);
      }
    });
  });
  return errors;
}

/**
 * Checks store layouts against the town terrain. Returns readable problems,
 * e.g. `stores[movies].door: must be on the building's bottom row`.
 */
export function validateStores(stores: readonly StoreConfig[], terrain: MapDefinition): string[] {
  const errors: string[] = [];
  const townHeight = terrain.tiles.length;
  const townWidth = terrain.tiles[0]?.length ?? 0;
  const town: TileRect = { x: 0, y: 0, width: townWidth, height: townHeight };
  const ids = new Set<string>();

  stores.forEach((store, index) => {
    const at = `stores[${store.id}]`;
    const { building, door } = store;
    if (ids.has(store.id)) errors.push(`${at}: duplicate store id`);
    ids.add(store.id);

    const corner = { x: building.x + building.width - 1, y: building.y + building.height - 1 };
    if (!contains(town, building) || !contains(town, corner)) {
      errors.push(`${at}.building: must fit inside the town`);
    }
    if (building.height <= BUILDING_WALL_ROWS) {
      errors.push(`${at}.building: must be taller than ${BUILDING_WALL_ROWS} tiles`);
    }
    if (door.y !== corner.y || door.x < building.x || door.x > corner.x) {
      errors.push(`${at}.door: must be on the building's bottom row`);
    }
    const outside = outsideDoor(store);
    if (isSolid(terrain.tiles[outside.y]?.[outside.x])) {
      errors.push(`${at}.door: the tile below the door must be walkable`);
    }
    stores.slice(0, index).forEach((other) => {
      if (overlaps(building, other.building)) {
        errors.push(`${at}.building: overlaps store "${other.id}"`);
      }
    });

    errors.push(...validateInterior(store.interior, at));
  });
  return errors;
}
