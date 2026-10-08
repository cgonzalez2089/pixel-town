import { describe, expect, it } from 'vitest';
import { STORES, type StoreConfig } from '../../config/stores';
import { parseAsciiMap } from './asciiMap';
import {
  buildInteriorMap,
  buildTownMap,
  interiorExit,
  outsideDoor,
  validateStores,
} from './storeLayout';
import { isSolid, Tile } from './tiles';
import { TOWN_MAP, TOWN_TERRAIN } from './townMap';
import type { MapDefinition } from './types';

// 8×6 open field with one tree in the bottom-left corner.
const terrain: MapDefinition = {
  tiles: parseAsciiMap(['........', '........', '........', '........', '........', 'T.......'], {
    '.': Tile.Grass,
    T: Tile.Tree,
  }),
  spawn: { x: 0, y: 0 },
};

function makeStore(overrides: Partial<StoreConfig> = {}): StoreConfig {
  return {
    id: 'test',
    name: 'Test Store',
    source: { name: 'test.json', type: 'movie', load: () => Promise.resolve([]) },
    building: { x: 2, y: 1, width: 3, height: 3 },
    door: { x: 3, y: 3 },
    interior: {
      width: 6,
      height: 5,
      shelves: [{ id: 'a', label: 'A', status: 'rated', x: 1, y: 1, width: 2 }],
    },
    ...overrides,
  };
}

describe('buildTownMap', () => {
  it('stamps roof, wall and door without changing the terrain', () => {
    const town = buildTownMap(terrain, [makeStore()]);
    expect(town.tiles.slice(1, 4).map((row) => row.slice(2, 5))).toEqual([
      [Tile.Roof, Tile.Roof, Tile.Roof],
      [Tile.Wall, Tile.Wall, Tile.Wall],
      [Tile.Wall, Tile.Door, Tile.Wall],
    ]);
    expect(terrain.tiles[1]?.[2]).toBe(Tile.Grass);
  });
});

describe('buildInteriorMap', () => {
  const interior = makeStore().interior;
  const map = buildInteriorMap(interior);
  const W = Tile.InnerWall;
  const F = Tile.Floor;
  const S = Tile.Shelf;

  it('builds walls, floor, shelves and an exit in the bottom wall', () => {
    expect(map.tiles).toEqual([
      [W, W, W, W, W, W],
      [W, S, S, F, F, W],
      [W, F, F, F, F, W],
      [W, F, F, F, F, W],
      [W, W, W, Tile.Exit, W, W],
    ]);
  });

  it('spawns the player just inside the exit', () => {
    expect(interiorExit(interior)).toEqual({ x: 3, y: 4 });
    expect(map.spawn).toEqual({ x: 3, y: 3 });
  });
});

describe('validateStores', () => {
  const problems = (overrides: Partial<StoreConfig>) =>
    validateStores([makeStore(overrides)], terrain);

  it('accepts a valid layout', () => {
    expect(validateStores([makeStore()], terrain)).toEqual([]);
  });

  it('rejects a building outside the town', () => {
    expect(
      problems({ building: { x: 6, y: 1, width: 3, height: 3 }, door: { x: 7, y: 3 } }),
    ).toEqual(['stores[test].building: must fit inside the town']);
  });

  it('rejects a building with no roof', () => {
    expect(problems({ building: { x: 2, y: 2, width: 3, height: 2 } })).toContain(
      'stores[test].building: must be taller than 2 tiles',
    );
  });

  it('rejects a door that is not on the bottom row', () => {
    expect(problems({ door: { x: 3, y: 2 } })).toContain(
      "stores[test].door: must be on the building's bottom row",
    );
  });

  it('rejects a door that opens onto a solid tile', () => {
    const blocked = { x: 0, y: 2, width: 3, height: 3 };
    expect(problems({ building: blocked, door: { x: 0, y: 4 } })).toEqual([
      'stores[test].door: the tile below the door must be walkable',
    ]);
  });

  it('rejects duplicate ids and overlapping buildings', () => {
    expect(validateStores([makeStore(), makeStore()], terrain)).toEqual([
      'stores[test]: duplicate store id',
      'stores[test].building: overlaps store "test"',
    ]);
  });

  it('rejects shelves outside the walls, overlapping, or blocking the entrance', () => {
    const shelf = { label: 'S', status: 'rated' as const, width: 2 };
    const interior = {
      width: 6,
      height: 5,
      shelves: [
        { ...shelf, id: 'wall', x: 0, y: 1 },
        { ...shelf, id: 'one', x: 1, y: 2 },
        { ...shelf, id: 'two', x: 2, y: 2 },
        { ...shelf, id: 'door', x: 3, y: 3 },
      ],
    };
    expect(problems({ interior })).toEqual([
      'stores[test].interior.shelves[wall]: must sit on the floor, inside the walls',
      'stores[test].interior.shelves[two]: overlaps shelf "one"',
      'stores[test].interior.shelves[door]: blocks the entrance',
    ]);
  });
});

describe('STORES config', () => {
  it('fits the real town', () => {
    expect(validateStores(STORES, TOWN_TERRAIN)).toEqual([]);
  });

  it('puts every door on the town map with walkable ground outside it', () => {
    for (const store of STORES) {
      expect(TOWN_MAP.tiles[store.door.y]?.[store.door.x]).toBe(Tile.Door);
      const outside = outsideDoor(store);
      expect(isSolid(TOWN_MAP.tiles[outside.y]?.[outside.x])).toBe(false);
    }
  });
});
