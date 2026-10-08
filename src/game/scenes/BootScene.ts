import Phaser from 'phaser';
import { createPlaceholderTextures } from '../art/placeholderArt';
import { Player } from '../entities/Player';
import { SCENES } from '../keys';

/** Prepares shared assets, then hands over to the town. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create(): void {
    createPlaceholderTextures(this);
    Player.createAnimations(this);
    this.scene.start(SCENES.TOWN);
  }
}
