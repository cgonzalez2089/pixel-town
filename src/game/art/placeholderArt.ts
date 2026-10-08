import type Phaser from 'phaser';
import { TILE_SIZE } from '../../config/game';
import type { Facing } from '../input/direction';
import { TEXTURES } from '../keys';
import { Tile, TILE_COUNT, type TileId } from '../maps/tiles';

/**
 * Placeholder art drawn with canvas rectangles, so the project has no image
 * assets yet. Swapping in real art means loading a tileset image and a
 * player spritesheet under the same texture keys and frame names.
 */

type Paint = (color: string, x: number, y: number, w?: number, h?: number) => void;

function painter(ctx: CanvasRenderingContext2D, originX: number, originY: number): Paint {
  return (color, x, y, w = 1, h = 1) => {
    ctx.fillStyle = color;
    ctx.fillRect(originX + x, originY + y, w, h);
  };
}

const GRASS = '#5b9a4b';
const GRASS_DARK = '#4b8540';

function drawGrass(paint: Paint): void {
  paint(GRASS, 0, 0, TILE_SIZE, TILE_SIZE);
  for (const [x, y] of [
    [2, 3],
    [9, 1],
    [13, 6],
    [5, 10],
    [11, 12],
    [1, 14],
    [7, 6],
  ] as const) {
    paint(GRASS_DARK, x, y, 1, 2);
  }
}

const TILE_PAINTERS: Record<TileId, (paint: Paint) => void> = {
  [Tile.Grass]: drawGrass,
  [Tile.Path]: (paint) => {
    paint('#c9a96b', 0, 0, TILE_SIZE, TILE_SIZE);
    for (const [x, y] of [
      [3, 2],
      [10, 5],
      [6, 11],
      [13, 13],
      [1, 8],
    ] as const) {
      paint('#ad8c55', x, y, 2, 1);
    }
  },
  [Tile.Flowers]: (paint) => {
    drawGrass(paint);
    for (const [x, y, color] of [
      [3, 3, '#f2d13c'],
      [10, 4, '#e8566b'],
      [6, 10, '#f4f1ea'],
      [12, 11, '#f2d13c'],
    ] as const) {
      paint(color, x, y, 2, 2);
    }
  },
  [Tile.Tree]: (paint) => {
    drawGrass(paint);
    paint('#6b4a2b', 6, 10, 4, 5);
    paint('#2f6b35', 2, 1, 12, 10);
    paint('#2f6b35', 1, 3, 14, 6);
    paint('#3f8a43', 4, 2, 5, 3);
  },
  [Tile.Water]: (paint) => {
    paint('#3a79c9', 0, 0, TILE_SIZE, TILE_SIZE);
    paint('#6aa3e8', 2, 4, 4, 1);
    paint('#6aa3e8', 9, 9, 5, 1);
    paint('#6aa3e8', 4, 13, 3, 1);
  },
  [Tile.Fence]: (paint) => {
    drawGrass(paint);
    paint('#8a5a32', 0, 5, TILE_SIZE, 2);
    paint('#8a5a32', 0, 10, TILE_SIZE, 2);
    paint('#6b4224', 2, 3, 3, 11);
    paint('#6b4224', 11, 3, 3, 11);
  },
  [Tile.Roof]: (paint) => {
    paint('#9c4436', 0, 0, TILE_SIZE, TILE_SIZE);
    for (let y = 3; y < TILE_SIZE; y += 4) paint('#7d3328', 0, y, TILE_SIZE, 1);
  },
  [Tile.Wall]: (paint) => {
    paint('#e3d3b1', 0, 0, TILE_SIZE, TILE_SIZE);
    paint('#c9b896', 0, 7, TILE_SIZE, 1);
    paint('#a8977a', 0, 15, TILE_SIZE, 1);
  },
  [Tile.Door]: (paint) => {
    paint('#e3d3b1', 0, 0, TILE_SIZE, TILE_SIZE);
    paint('#3d2716', 2, 1, 12, 15);
    paint('#6b4528', 3, 2, 10, 14);
    paint('#f2d13c', 10, 9, 2, 2);
  },
  [Tile.Floor]: (paint) => {
    paint('#b98d5e', 0, 0, TILE_SIZE, TILE_SIZE);
    paint('#a27a4f', 0, 7, TILE_SIZE, 1);
    paint('#a27a4f', 0, 15, TILE_SIZE, 1);
    paint('#a27a4f', 5, 0, 1, 7);
    paint('#a27a4f', 11, 8, 1, 7);
  },
  [Tile.InnerWall]: (paint) => {
    paint('#4b405e', 0, 0, TILE_SIZE, TILE_SIZE);
    paint('#5d5174', 0, 0, TILE_SIZE, 3);
  },
  [Tile.Shelf]: (paint) => {
    paint('#5a3a22', 0, 0, TILE_SIZE, TILE_SIZE);
    for (const shelfY of [1, 8]) {
      paint('#2a1b10', 1, shelfY, 14, 6);
      ['#d9573b', '#3a79c9', '#f2d13c', '#5b9a4b', '#e8e2d0', '#9c4436'].forEach((color, i) => {
        paint(color, 2 + i * 2, shelfY + 1 + (i % 2), 2, 5 - (i % 2));
      });
    }
  },
  [Tile.Exit]: (paint) => {
    paint('#b98d5e', 0, 0, TILE_SIZE, TILE_SIZE);
    paint('#7a2f2f', 1, 3, 14, 10);
    paint('#a84a4a', 3, 5, 10, 6);
  },
};

function createTileset(scene: Phaser.Scene): void {
  const texture = scene.textures.createCanvas(TEXTURES.TILES, TILE_COUNT * TILE_SIZE, TILE_SIZE);
  if (!texture) throw new Error('Could not create tileset texture');
  const ctx = texture.getContext();

  for (const [id, draw] of Object.entries(TILE_PAINTERS)) {
    draw(painter(ctx, Number(id) * TILE_SIZE, 0));
  }
  texture.refresh();
}

export const FACINGS: readonly Facing[] = ['down', 'up', 'left', 'right'];
export const WALK_FRAMES = 2;

/** Frame name for a facing and step, e.g. `left-1`. */
export function playerFrame(facing: Facing, step: number): string {
  return `${facing}-${step}`;
}

function drawPlayer(paint: Paint, facing: Facing, step: number): void {
  const skin = '#f0c39b';
  const hair = '#3b2a20';
  const shirt = '#d9573b';
  const pants = '#2e3f6e';

  // Legs alternate on step 1 to suggest walking.
  const leftLeg = step === 1 ? 1 : 0;
  const rightLeg = step === 1 ? 0 : 1;
  paint(pants, 5, 12, 2, 3 + leftLeg);
  paint(pants, 9, 12, 2, 3 + rightLeg);

  paint(shirt, 4, 7, 8, 6);
  paint(skin, 4, 2, 8, 6);
  paint(hair, 4, 1, 8, 2);

  switch (facing) {
    case 'down':
      paint('#1b1b24', 6, 4, 1, 2);
      paint('#1b1b24', 9, 4, 1, 2);
      break;
    case 'up':
      paint(hair, 4, 3, 8, 4);
      break;
    case 'left':
      paint(hair, 9, 3, 3, 3);
      paint('#1b1b24', 5, 4, 1, 2);
      break;
    case 'right':
      paint(hair, 4, 3, 3, 3);
      paint('#1b1b24', 10, 4, 1, 2);
      break;
  }
}

function createPlayerSheet(scene: Phaser.Scene): void {
  const frameCount = FACINGS.length * WALK_FRAMES;
  const texture = scene.textures.createCanvas(TEXTURES.PLAYER, frameCount * TILE_SIZE, TILE_SIZE);
  if (!texture) throw new Error('Could not create player texture');
  const ctx = texture.getContext();

  FACINGS.forEach((facing, row) => {
    for (let step = 0; step < WALK_FRAMES; step++) {
      const x = (row * WALK_FRAMES + step) * TILE_SIZE;
      drawPlayer(painter(ctx, x, 0), facing, step);
      texture.add(playerFrame(facing, step), 0, x, 0, TILE_SIZE, TILE_SIZE);
    }
  });
  texture.refresh();
}

export function createPlaceholderTextures(scene: Phaser.Scene): void {
  createTileset(scene);
  createPlayerSheet(scene);
}
