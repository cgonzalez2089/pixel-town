import Phaser from 'phaser';
import type { Catalog } from '../data/catalog';
import { BootScene } from './scenes/BootScene';
import { StoreInteriorScene } from './scenes/StoreInteriorScene';
import { TownScene } from './scenes/TownScene';

/** Starts the Phaser game inside `parent`, with every store's items already loaded. */
export function createGame(parent: HTMLElement, catalog: Catalog): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#1b1b24',
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    physics: { default: 'arcade' },
    scene: [new BootScene(), new TownScene(), new StoreInteriorScene(catalog)],
  });
}
