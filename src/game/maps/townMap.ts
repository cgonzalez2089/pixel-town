import { STORES } from '../../config/stores';
import { parseAsciiMap } from './asciiMap';
import { buildTownMap, validateStores } from './storeLayout';
import { Tile, type TileId } from './tiles';
import type { MapDefinition } from './types';

const LEGEND: Record<string, TileId> = {
  '.': Tile.Grass,
  '=': Tile.Path,
  '*': Tile.Flowers,
  T: Tile.Tree,
  '~': Tile.Water,
  F: Tile.Fence,
};

// 30×20 tiles of terrain. Store buildings are stamped on top from config/stores.ts.
const ROWS = [
  'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
  'FTT......................TTTTF',
  'FT..........................TF',
  'F..........................T.F',
  'F..*......................*..F',
  'F............................F',
  'F.T......................T...F',
  'F............................F',
  'F.............=..............F',
  'F.............=..............F',
  'F.............=..............F',
  'F.............=..............F',
  'F.==========================.F',
  'F...T....................T...F',
  'F............................F',
  'F..~~~~~.....................F',
  'F..~~~~~~....*........*......F',
  'F...~~~~.....................F',
  'FTT......................*.TTF',
  'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
];

export const TOWN_TERRAIN: MapDefinition = {
  tiles: parseAsciiMap(ROWS, LEGEND),
  spawn: { x: 14, y: 10 },
};

const storeProblems = validateStores(STORES, TOWN_TERRAIN);
if (storeProblems.length > 0) {
  throw new Error(`Invalid store config:\n  - ${storeProblems.join('\n  - ')}`);
}

export const TOWN_MAP: MapDefinition = buildTownMap(TOWN_TERRAIN, STORES);
