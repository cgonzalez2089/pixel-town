import Phaser from 'phaser';
import { bus } from '../../events';
import { axis, type Vec2 } from './direction';

const { KeyCodes } = Phaser.Input.Keyboard;

/**
 * Reads WASD/arrow keys as a movement direction and E as "interact".
 * Input is ignored while an HTML overlay is open, and Phaser stops
 * swallowing key presses so the overlay can use them (e.g. arrow-key scrolling).
 */
export class InputController {
  private readonly up: Phaser.Input.Keyboard.Key[];
  private readonly down: Phaser.Input.Keyboard.Key[];
  private readonly left: Phaser.Input.Keyboard.Key[];
  private readonly right: Phaser.Input.Keyboard.Key[];
  private readonly interact: Phaser.Input.Keyboard.Key[];
  private enabled = true;

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    const bind = (...codes: number[]) =>
      keyboard ? codes.map((code) => keyboard.addKey(code)) : [];

    this.up = bind(KeyCodes.W, KeyCodes.UP);
    this.down = bind(KeyCodes.S, KeyCodes.DOWN);
    this.left = bind(KeyCodes.A, KeyCodes.LEFT);
    this.right = bind(KeyCodes.D, KeyCodes.RIGHT);
    this.interact = bind(KeyCodes.E);

    const unsubscribe = bus.on('overlay:change', ({ open }) => {
      this.setEnabled(!open);
    });
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
  }

  /** Raw direction: each axis is -1, 0 or 1. */
  getDirection(): Vec2 {
    if (!this.enabled) return { x: 0, y: 0 };
    const held = (keys: Phaser.Input.Keyboard.Key[]) => keys.some((key) => key.isDown);
    return {
      x: axis(held(this.left), held(this.right)),
      y: axis(held(this.up), held(this.down)),
    };
  }

  /** True once per press of the interact key. */
  interactPressed(): boolean {
    return this.enabled && this.interact.some((key) => Phaser.Input.Keyboard.JustDown(key));
  }

  private setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return;

    keyboard.enabled = enabled;
    if (enabled) {
      keyboard.enableGlobalCapture();
    } else {
      keyboard.disableGlobalCapture();
      // Forget keys held when the overlay opened, so the player doesn't keep walking.
      keyboard.resetKeys();
    }
  }
}
