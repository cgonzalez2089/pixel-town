import type Phaser from 'phaser';
import { NARROW_MAX_WIDTH, ZOOM, ZOOM_NARROW } from '../config/game';

/** Camera zoom for a viewport width. */
export function zoomForWidth(width: number): number {
  return width < NARROW_MAX_WIDTH ? ZOOM_NARROW : ZOOM;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Camera bounds for a world seen through a view (both in world pixels).
 * Phaser pins a world smaller than the view to the top-left corner, so along
 * any axis where the world is smaller, the bounds are widened to centre it.
 */
export function cameraBounds(
  worldWidth: number,
  worldHeight: number,
  viewWidth: number,
  viewHeight: number,
): Bounds {
  const axis = (world: number, view: number) =>
    world >= view ? { start: 0, size: world } : { start: (world - view) / 2, size: view };
  const horizontal = axis(worldWidth, viewWidth);
  const vertical = axis(worldHeight, viewHeight);
  return { x: horizontal.start, y: vertical.start, width: horizontal.size, height: vertical.size };
}

/**
 * Makes the main camera follow `target` inside a world of the given size,
 * re-picking the zoom and bounds whenever the window is resized.
 */
export function followWithCamera(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  worldWidth: number,
  worldHeight: number,
): void {
  const camera = scene.cameras.main;
  camera.startFollow(target, true);

  const fit = (size: Phaser.Structs.Size) => {
    const zoom = zoomForWidth(size.width);
    const { x, y, width, height } = cameraBounds(
      worldWidth,
      worldHeight,
      size.width / zoom,
      size.height / zoom,
    );
    camera.setZoom(zoom).setBounds(x, y, width, height);
  };
  fit(scene.scale.gameSize);
  scene.scale.on('resize', fit);
  scene.events.once('shutdown', () => scene.scale.off('resize', fit));
}
