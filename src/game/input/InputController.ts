import Phaser from 'phaser';
import { axis, type Vec2 } from './direction';

const { KeyCodes } = Phaser.Input.Keyboard;

/** Reads WASD and the arrow keys as a single movement direction. */
export class InputController {
  private readonly up: Phaser.Input.Keyboard.Key[];
  private readonly down: Phaser.Input.Keyboard.Key[];
  private readonly left: Phaser.Input.Keyboard.Key[];
  private readonly right: Phaser.Input.Keyboard.Key[];

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    const bind = (...codes: number[]) =>
      keyboard ? codes.map((code) => keyboard.addKey(code)) : [];

    this.up = bind(KeyCodes.W, KeyCodes.UP);
    this.down = bind(KeyCodes.S, KeyCodes.DOWN);
    this.left = bind(KeyCodes.A, KeyCodes.LEFT);
    this.right = bind(KeyCodes.D, KeyCodes.RIGHT);
  }

  /** Raw direction: each axis is -1, 0 or 1. */
  getDirection(): Vec2 {
    const held = (keys: Phaser.Input.Keyboard.Key[]) => keys.some((key) => key.isDown);
    return {
      x: axis(held(this.left), held(this.right)),
      y: axis(held(this.up), held(this.down)),
    };
  }
}
