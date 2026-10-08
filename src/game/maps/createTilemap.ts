import type Phaser from 'phaser';
import { TILE_SIZE } from '../../config/game';
import { TEXTURES } from '../keys';
import { SOLID_TILES } from './tiles';
import type { MapDefinition } from './types';

/** Builds a Phaser tilemap with collisions from a map definition. */
export function createTilemap(
  scene: Phaser.Scene,
  definition: MapDefinition,
): { map: Phaser.Tilemaps.Tilemap; layer: Phaser.Tilemaps.TilemapLayer } {
  const map = scene.make.tilemap({
    data: definition.tiles,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
  });
  const tileset = map.addTilesetImage(TEXTURES.TILES);
  const layer = tileset ? map.createLayer(0, tileset) : null;
  if (!layer) throw new Error('Could not create tilemap layer');

  layer.setCollision([...SOLID_TILES]);
  return { map, layer };
}
