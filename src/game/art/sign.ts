import type Phaser from 'phaser';
import { ZOOM } from '../../config/game';

/** A small dark sign with pixel-style text, centred on (x, y) in world pixels. */
export function addSign(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
): Phaser.GameObjects.Container {
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#f2efe6',
      align: 'center',
      // Render the text texture at zoom resolution so it stays sharp when scaled up.
      resolution: ZOOM,
    })
    .setOrigin(0.5);

  const background = scene.add
    .rectangle(0, 0, text.width + 6, text.height + 2, 0x1b1b24)
    .setStrokeStyle(1, 0x6b4528);

  return scene.add.container(x, y, [background, text]).setDepth(5);
}
