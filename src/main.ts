import Phaser from 'phaser';
import './style.css';
import { BootScene } from './game/scenes/BootScene';
import { TownScene } from './game/scenes/TownScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#1b1b24',
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
  physics: { default: 'arcade' },
  scene: [BootScene, TownScene],
});
