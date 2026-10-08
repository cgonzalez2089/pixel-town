import Phaser from 'phaser';
import { PLAYER_SPEED } from '../../config/game';
import { FACINGS, playerFrame, WALK_FRAMES } from '../art/placeholderArt';
import { facingFor, normalizeDirection, type Facing, type Vec2 } from '../input/direction';
import { TEXTURES } from '../keys';
import { worldToTile } from '../maps/coords';
import type { TilePoint } from '../maps/types';

const walkAnimation = (facing: Facing) => `player-walk-${facing}`;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private facing: Facing = 'down';

  /** Registers the walk animations once per game; call before creating a Player. */
  static createAnimations(scene: Phaser.Scene): void {
    for (const facing of FACINGS) {
      if (scene.anims.exists(walkAnimation(facing))) continue;
      scene.anims.create({
        key: walkAnimation(facing),
        frames: Array.from({ length: WALK_FRAMES }, (_, step) => ({
          key: TEXTURES.PLAYER,
          frame: playerFrame(facing, step),
        })),
        frameRate: 6,
        repeat: -1,
      });
    }
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURES.PLAYER, playerFrame('down', 0));
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Collide with the feet only, so the head can overlap things "behind" it.
    this.setBodySize(10, 6, false);
    this.setOffset(3, 10);
    this.setCollideWorldBounds(true);
  }

  /** The tile under the player's feet (the centre of the collision body). */
  feetTile(): TilePoint {
    const { x, y } = this.body?.center ?? this;
    return worldToTile(x, y);
  }

  /** Turns to face `facing` and stands still. */
  face(facing: Facing): void {
    this.facing = facing;
    this.stand();
  }

  /** Moves in `direction` (each axis -1..1), or stands still for a zero vector. */
  move(direction: Vec2): void {
    const { x, y } = normalizeDirection(direction);
    this.setVelocity(x * PLAYER_SPEED, y * PLAYER_SPEED);

    if (x === 0 && y === 0) {
      this.stand();
      return;
    }
    this.facing = facingFor({ x, y }, this.facing);
    this.anims.play(walkAnimation(this.facing), true);
  }

  private stand(): void {
    this.setVelocity(0, 0);
    this.anims.stop();
    this.setFrame(playerFrame(this.facing, 0));
  }
}
