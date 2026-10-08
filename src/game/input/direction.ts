export type Facing = 'up' | 'down' | 'left' | 'right';

export interface Vec2 {
  x: number;
  y: number;
}

/** -1, 0 or 1 for a pair of opposing keys. Both held cancel out. */
export function axis(negative: boolean, positive: boolean): number {
  return Number(positive) - Number(negative);
}

/** Scales a direction to length 1 so diagonal movement isn't faster. */
export function normalizeDirection({ x, y }: Vec2): Vec2 {
  const length = Math.hypot(x, y);
  return length === 0 ? { x: 0, y: 0 } : { x: x / length, y: y / length };
}

/**
 * Which way the avatar should face while moving in `direction`. When moving
 * diagonally it keeps its current facing if that still fits, so the sprite
 * doesn't flicker between frames.
 */
export function facingFor({ x, y }: Vec2, current: Facing): Facing {
  const horizontal: Facing | null = x > 0 ? 'right' : x < 0 ? 'left' : null;
  const vertical: Facing | null = y > 0 ? 'down' : y < 0 ? 'up' : null;

  if (horizontal && vertical) {
    if (current === horizontal || current === vertical) return current;
    return Math.abs(y) > Math.abs(x) ? vertical : horizontal;
  }
  return horizontal ?? vertical ?? current;
}
