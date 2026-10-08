import Phaser from 'phaser';
import { getStore, STORES } from '../../config/stores';
import { addSign } from '../art/sign';
import { followWithCamera } from '../camera';
import { Player } from '../entities/Player';
import { InputController } from '../input/InputController';
import { SCENES } from '../keys';
import { tileToWorld } from '../maps/coords';
import { createTilemap } from '../maps/createTilemap';
import { BUILDING_WALL_ROWS, outsideDoor, sameTile } from '../maps/storeLayout';
import { TOWN_MAP } from '../maps/townMap';
import { fadeIn, fadeToScene, type SceneData } from './transitions';

export class TownScene extends Phaser.Scene {
  private player!: Player;
  private controls!: InputController;
  private fromStoreId: string | undefined;
  private leaving = false;

  constructor() {
    super(SCENES.TOWN);
  }

  init(data: SceneData[typeof SCENES.TOWN]): void {
    this.fromStoreId = data.fromStoreId;
    this.leaving = false;
  }

  create(): void {
    const { map, layer } = createTilemap(this, TOWN_MAP);
    this.addStoreSigns();

    const returning = this.fromStoreId ? getStore(this.fromStoreId) : undefined;
    const spawn = tileToWorld(returning ? outsideDoor(returning) : TOWN_MAP.spawn);
    this.player = new Player(this, spawn.x, spawn.y);
    if (returning) this.player.face('down');

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.add.collider(this.player, layer);
    followWithCamera(this, this.player, map.widthInPixels, map.heightInPixels);
    this.controls = new InputController(this);
    fadeIn(this);
  }

  override update(): void {
    if (this.leaving) return;
    this.player.move(this.controls.getDirection());

    const feet = this.player.feetTile();
    const store = STORES.find(({ door }) => sameTile(door, feet));
    if (store) {
      this.leaving = true;
      this.player.move({ x: 0, y: 0 });
      fadeToScene(this, SCENES.STORE_INTERIOR, { storeId: store.id });
    }
  }

  private addStoreSigns(): void {
    for (const { name, building, door } of STORES) {
      const signRow = building.y + building.height - BUILDING_WALL_ROWS;
      const { x, y } = tileToWorld({ x: door.x, y: signRow });
      addSign(this, x, y, name.toUpperCase());
    }
  }
}
