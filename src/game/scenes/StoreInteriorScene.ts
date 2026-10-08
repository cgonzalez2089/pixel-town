import Phaser from 'phaser';
import { getStore, type ShelfConfig, type StoreConfig } from '../../config/stores';
import { itemsWithStatus, type Catalog } from '../../data/catalog';
import { bus } from '../../events';
import { addSign } from '../art/sign';
import { followWithCamera } from '../camera';
import { Player } from '../entities/Player';
import { InputController } from '../input/InputController';
import { SCENES } from '../keys';
import { tileToWorld } from '../maps/coords';
import { createTilemap } from '../maps/createTilemap';
import { buildInteriorMap, interiorExit, sameTile, shelfInReach } from '../maps/storeLayout';
import type { TilePoint } from '../maps/types';
import { fadeIn, fadeToScene, type SceneData } from './transitions';

/** How far below the player's centre the shelf prompt sits, in world pixels. */
const PROMPT_OFFSET_Y = 20;

/** One scene for every store; which store it shows comes from the scene data. */
export class StoreInteriorScene extends Phaser.Scene {
  private store!: StoreConfig;
  private player!: Player;
  private controls!: InputController;
  private exit!: TilePoint;
  private prompts = new Map<ShelfConfig, Phaser.GameObjects.Container>();
  private leaving = false;

  constructor(private readonly catalog: Catalog) {
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
    addSign(this, map.widthInPixels / 2, top.y, this.store.name.toUpperCase());
    this.createShelfPrompts();

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

    const feet = this.player.feetTile();
    const shelf = shelfInReach(feet, this.store.interior.shelves);
    this.prompts.forEach((prompt, candidate) => {
      prompt.setVisible(candidate === shelf);
    });
    if (shelf) {
      // Shelves sit where the player's head is, so the prompt goes below the feet instead.
      this.prompts.get(shelf)?.setPosition(this.player.x, this.player.y + PROMPT_OFFSET_Y);
      if (this.controls.interactPressed()) this.openShelf(shelf);
    }

    if (sameTile(feet, this.exit)) {
      this.leaving = true;
      this.player.move({ x: 0, y: 0 });
      fadeToScene(this, SCENES.TOWN, { fromStoreId: this.store.id });
    }
  }

  /** A hidden "Press E" sign per shelf, shown while the player is in reach of it. */
  private createShelfPrompts(): void {
    this.prompts.clear();
    for (const shelf of this.store.interior.shelves) {
      this.prompts.set(shelf, addSign(this, 0, 0, `${shelf.label}\nPress E`).setVisible(false));
    }
  }

  private openShelf(shelf: ShelfConfig): void {
    this.player.move({ x: 0, y: 0 });
    bus.emit('shelf:open', {
      storeName: this.store.name,
      shelfLabel: shelf.label,
      items: itemsWithStatus(this.catalog.get(this.store.id) ?? [], shelf.status),
    });
  }
}
