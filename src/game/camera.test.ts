import { describe, expect, it } from 'vitest';
import { NARROW_MAX_WIDTH, ZOOM, ZOOM_NARROW } from '../config/game';
import { cameraBounds, zoomForWidth } from './camera';

describe('cameraBounds', () => {
  it('uses the world size when the world is larger than the view', () => {
    expect(cameraBounds(480, 320, 400, 250)).toEqual({ x: 0, y: 0, width: 480, height: 320 });
  });

  it('centres a world that is smaller than the view', () => {
    expect(cameraBounds(192, 144, 400, 250)).toEqual({ x: -104, y: -53, width: 400, height: 250 });
  });

  it('handles each axis independently', () => {
    expect(cameraBounds(480, 320, 195, 380)).toEqual({ x: 0, y: -30, width: 480, height: 380 });
  });
});

describe('zoomForWidth', () => {
  it('uses the narrow zoom on phone-sized screens', () => {
    expect(zoomForWidth(390)).toBe(ZOOM_NARROW);
    expect(zoomForWidth(NARROW_MAX_WIDTH - 1)).toBe(ZOOM_NARROW);
  });

  it('uses the normal zoom from the breakpoint up', () => {
    expect(zoomForWidth(NARROW_MAX_WIDTH)).toBe(ZOOM);
    expect(zoomForWidth(1440)).toBe(ZOOM);
  });
});
