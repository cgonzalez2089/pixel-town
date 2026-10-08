/** Size of one map tile in source pixels. */
export const TILE_SIZE = 16;

/** Camera zoom: every source pixel is drawn as a ZOOM×ZOOM block on screen. */
export const ZOOM = 3;

/** Smaller zoom for phones, so more of the map fits on screen. */
export const ZOOM_NARROW = 2;

/** Viewports narrower than this (in CSS pixels) use ZOOM_NARROW. */
export const NARROW_MAX_WIDTH = 600;

/** Player walking speed in source pixels per second (before zoom). */
export const PLAYER_SPEED = 80;
