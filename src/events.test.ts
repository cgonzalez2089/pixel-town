import { describe, expect, it, vi } from 'vitest';
import { createEventBus } from './events';

interface TestEvents {
  ping: { n: number };
  other: { s: string };
}

describe('createEventBus', () => {
  it('delivers payloads to every handler of that event only', () => {
    const bus = createEventBus<TestEvents>();
    const first = vi.fn();
    const second = vi.fn();
    const other = vi.fn();
    bus.on('ping', first);
    bus.on('ping', second);
    bus.on('other', other);

    bus.emit('ping', { n: 1 });

    expect(first).toHaveBeenCalledWith({ n: 1 });
    expect(second).toHaveBeenCalledWith({ n: 1 });
    expect(other).not.toHaveBeenCalled();
  });

  it('stops delivering after unsubscribing', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    const off = bus.on('ping', handler);

    off();
    bus.emit('ping', { n: 2 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores events nobody listens to', () => {
    const bus = createEventBus<TestEvents>();
    expect(() => {
      bus.emit('other', { s: 'x' });
    }).not.toThrow();
  });
});
