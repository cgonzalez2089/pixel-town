import type { TileId } from './tiles';

/**
 * Turns rows of characters into a grid of tile ids using `legend`
 * (one character per tile). Throws on ragged rows or unknown characters so
 * map typos fail loudly at startup and in tests.
 */
export function parseAsciiMap(
  rows: readonly string[],
  legend: Readonly<Record<string, TileId>>,
): TileId[][] {
  const width = rows[0]?.length ?? 0;
  if (width === 0) throw new Error('ASCII map must have at least one non-empty row');

  return rows.map((row, y) => {
    if (row.length !== width) {
      throw new Error(`ASCII map row ${y} is ${row.length} wide, expected ${width}`);
    }
    return Array.from(row, (char, x) => {
      const tile = legend[char];
      if (tile === undefined) throw new Error(`Unknown map character "${char}" at (${x}, ${y})`);
      return tile;
    });
  });
}
