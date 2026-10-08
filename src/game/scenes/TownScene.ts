import Phaser from 'phaser';
import { followWithCamera } from '../camera';
import { Player } from '../entities/Player';
import { InputController } from '../input/InputController';
import { SCENES } from '../keys';
import { tileToWorld } from '../maps/coords';
import { createTilemap } from '../maps/createTilemap';
import { TOWN_MAP } from '../maps/townMap';

export class TownScene extends Phaser.Scene {
  private player!: Player;
  private controls!: InputController;

  constructor() {
    super(SCENES.TOWN);
  }

  create(): void {
    const { map, layer } = createTilemap(this, TOWN_MAP);
    const width = map.widthInPixels;
    const height = map.heightInPixels;

    const spawn = tileToWorld(TOWN_MAP.spawn);
    this.player = new Player(this, spawn.x, spawn.y);
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.add.collider(this.player, layer);

    followWithCamera(this, this.player, width, height);
    this.controls = new InputController(this);
  }

  override update(): void {
    this.player.move(this.controls.getDirection());
  }
}
