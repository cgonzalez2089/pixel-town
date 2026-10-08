import { TILE_SIZE } from '../../config/game';
import type { TilePoint } from './types';

/** Pixel position of the centre of a tile. */
export function tileToWorld(tile: TilePoint, tileSize = TILE_SIZE): { x: number; y: number } {
  return { x: (tile.x + 0.5) * tileSize, y: (tile.y + 0.5) * tileSize };
}

/** The tile containing a pixel position. */
export function worldToTile(x: number, y: number, tileSize = TILE_SIZE): TilePoint {
  return { x: Math.floor(x / tileSize), y: Math.floor(y / tileSize) };
}
