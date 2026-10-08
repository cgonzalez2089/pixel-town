import type { TileId } from './tiles';

/** A position measured in tiles, not pixels. */
export interface TilePoint {
  x: number;
  y: number;
}

/**
 * Everything a scene needs to build a map. Today it comes from ASCII art in
 * code; a Tiled JSON importer can produce the same shape later.
 */
export interface MapDefinition {
  /** Tile ids by row, then column: `tiles[y][x]`. */
  tiles: TileId[][];
  /** Where the player appears when entering the map fresh. */
  spawn: TilePoint;
}
