import { describe, expect, it } from 'vitest';
import { axis, facingFor, normalizeDirection } from './direction';

describe('axis', () => {
  it('combines two opposing keys', () => {
    expect(axis(false, false)).toBe(0);
    expect(axis(true, false)).toBe(-1);
    expect(axis(false, true)).toBe(1);
    expect(axis(true, true)).toBe(0);
  });
});

describe('normalizeDirection', () => {
  it('leaves zero and straight directions alone', () => {
    expect(normalizeDirection({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(normalizeDirection({ x: -1, y: 0 })).toEqual({ x: -1, y: 0 });
  });

  it('keeps diagonal movement at the same speed', () => {
    const { x, y } = normalizeDirection({ x: 1, y: 1 });
    expect(Math.hypot(x, y)).toBeCloseTo(1);
    expect(x).toBeCloseTo(Math.SQRT1_2);
  });
});

describe('facingFor', () => {
  it('faces the direction of straight movement', () => {
    expect(facingFor({ x: 0, y: -1 }, 'down')).toBe('up');
    expect(facingFor({ x: 0, y: 1 }, 'up')).toBe('down');
    expect(facingFor({ x: -1, y: 0 }, 'up')).toBe('left');
    expect(facingFor({ x: 1, y: 0 }, 'up')).toBe('right');
  });

  it('keeps the current facing when standing still', () => {
    expect(facingFor({ x: 0, y: 0 }, 'left')).toBe('left');
  });

  it('keeps the current facing on a diagonal that includes it', () => {
    expect(facingFor({ x: 1, y: -1 }, 'up')).toBe('up');
    expect(facingFor({ x: 1, y: -1 }, 'right')).toBe('right');
  });

  it('picks a new facing on a diagonal that excludes the current one', () => {
    expect(facingFor({ x: 1, y: -1 }, 'down')).toBe('right');
  });
});
