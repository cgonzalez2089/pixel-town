import Phaser from 'phaser';
import { getStore, type StoreConfig } from '../../config/stores';
import { addSign } from '../art/sign';
import { followWithCamera } from '../camera';
import { Player } from '../entities/Player';
import { InputController } from '../input/InputController';
import { SCENES } from '../keys';
import { tileToWorld } from '../maps/coords';
import { createTilemap } from '../maps/createTilemap';
import { buildInteriorMap, interiorExit, sameTile } from '../maps/storeLayout';
import type { TilePoint } from '../maps/types';
import { fadeIn, fadeToScene, type SceneData } from './transitions';

/** One scene for every store; which store it shows comes from the scene data. */
export class StoreInteriorScene extends Phaser.Scene {
  private store!: StoreConfig;
  private player!: Player;
  private controls!: InputController;
  private exit!: TilePoint;
  private leaving = false;

  constructor() {
    super(SCENES.STORE_INTERIOR);
  }

  init(data: SceneData[typeof SCENES.STORE_INTERIOR]): void {
    this.store = getStore(data.storeId);
    this.leaving = false;
  }

  create(): void {
    const definition = buildInteriorMap(this.store.interior);
    const { map, layer } = createTilemap(this, definition);
    this.exit = interiorExit(this.store.interior);

    const top = tileToWorld({ x: 0, y: 0 });
    addSign(this, map.widthInPixels / 2, top.y, this.store.name);

    const spawn = tileToWorld(definition.spawn);
    this.player = new Player(this, spawn.x, spawn.y);
    this.player.face('up');

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.add.collider(this.player, layer);
    followWithCamera(this, this.player, map.widthInPixels, map.heightInPixels);
    this.controls = new InputController(this);
    fadeIn(this);
  }

  override update(): void {
    if (this.leaving) return;
    this.player.move(this.controls.getDirection());

    if (sameTile(this.player.feetTile(), this.exit)) {
      this.leaving = true;
      this.player.move({ x: 0, y: 0 });
      fadeToScene(this, SCENES.TOWN, { fromStoreId: this.store.id });
    }
  }
}
