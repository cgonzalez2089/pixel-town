import Phaser from 'phaser';
import { SCENES } from '../keys';

const FADE_MS = 200;

/** Data each scene accepts when started. */
export interface SceneData {
  /** `fromStoreId` places the player outside that store's door. */
  [SCENES.TOWN]: { fromStoreId?: string };
  [SCENES.STORE_INTERIOR]: { storeId: string };
}

/** Fades the camera to black, then starts `key` with `data`. */
export function fadeToScene<K extends keyof SceneData>(
  scene: Phaser.Scene,
  key: K,
  data: SceneData[K],
): void {
  const camera = scene.cameras.main;
  camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(key, data);
  });
  camera.fadeOut(FADE_MS, 0, 0, 0);
}

export function fadeIn(scene: Phaser.Scene): void {
  scene.cameras.main.fadeIn(FADE_MS, 0, 0, 0);
}
