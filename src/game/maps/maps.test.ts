import { describe, expect, it } from 'vitest';
import { parseAsciiMap } from './asciiMap';
import { tileToWorld, worldToTile } from './coords';
import { SOLID_TILES, Tile } from './tiles';
import { TOWN_MAP } from './townMap';

describe('parseAsciiMap', () => {
  const legend = { '.': Tile.Grass, T: Tile.Tree };

  it('maps each character to a tile id', () => {
    expect(parseAsciiMap(['.T', 'T.'], legend)).toEqual([
      [Tile.Grass, Tile.Tree],
      [Tile.Tree, Tile.Grass],
    ]);
  });

  it('rejects ragged rows', () => {
    expect(() => parseAsciiMap(['..', '.'], legend)).toThrow('row 1 is 1 wide, expected 2');
  });

  it('rejects unknown characters with their position', () => {
    expect(() => parseAsciiMap(['..', '.?'], legend)).toThrow(
      'Unknown map character "?" at (1, 1)',
    );
  });

  it('rejects an empty map', () => {
    expect(() => parseAsciiMap([], legend)).toThrow('at least one non-empty row');
  });
});

describe('tile coordinates', () => {
  it('converts a tile to the pixel at its centre', () => {
    expect(tileToWorld({ x: 0, y: 0 }, 16)).toEqual({ x: 8, y: 8 });
    expect(tileToWorld({ x: 3, y: 2 }, 16)).toEqual({ x: 56, y: 40 });
  });

  it('converts a pixel to the tile containing it', () => {
    expect(worldToTile(0, 0, 16)).toEqual({ x: 0, y: 0 });
    expect(worldToTile(15.9, 16, 16)).toEqual({ x: 0, y: 1 });
  });

  it('round-trips', () => {
    const { x, y } = tileToWorld({ x: 7, y: 11 });
    expect(worldToTile(x, y)).toEqual({ x: 7, y: 11 });
  });
});

describe('TOWN_MAP', () => {
  const tileAt = (x: number, y: number) => TOWN_MAP.tiles[y]?.[x];

  it('is 30×20 tiles', () => {
    expect(TOWN_MAP.tiles).toHaveLength(20);
    expect(TOWN_MAP.tiles.every((row) => row.length === 30)).toBe(true);
  });

  it('is enclosed by solid tiles', () => {
    const border = TOWN_MAP.tiles.flatMap((row, y) =>
      row.filter((_, x) => y === 0 || y === 19 || x === 0 || x === 29),
    );
    expect(border.every((tile) => SOLID_TILES.includes(tile))).toBe(true);
  });

  it('spawns the player on a walkable tile', () => {
    const tile = tileAt(TOWN_MAP.spawn.x, TOWN_MAP.spawn.y);
    expect(tile).toBeDefined();
    expect(SOLID_TILES).not.toContain(tile);
  });
});
