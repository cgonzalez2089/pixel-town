/**
 * Tile ids are indexes into the tileset texture: tile N is the Nth 16×16
 * square from the left. A real tileset image can replace the generated one
 * as long as it keeps the same order.
 */
export const Tile = {
  Grass: 0,
  Path: 1,
  Flowers: 2,
  Tree: 3,
  Water: 4,
  Fence: 5,
} as const;

export type TileId = (typeof Tile)[keyof typeof Tile];

export const TILE_COUNT = Object.keys(Tile).length;

/** Tiles the player cannot walk through. */
export const SOLID_TILES: readonly TileId[] = [Tile.Tree, Tile.Water, Tile.Fence];
