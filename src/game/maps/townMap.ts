import { parseAsciiMap } from './asciiMap';
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

// 30×20 tiles. The open area around (11–17, 3–7) is reserved for the movie store.
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

export const TOWN_MAP: MapDefinition = {
  tiles: parseAsciiMap(ROWS, LEGEND),
  spawn: { x: 14, y: 10 },
};
