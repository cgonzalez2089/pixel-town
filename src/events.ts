import type { Item } from './data/types';

/**
 * Messages between the game (Phaser) and the HTML UI. Each side only knows
 * about these events, never about the other side's modules.
 */
export interface AppEvents {
  /** The player opened a shelf. */
  'shelf:open': { storeName: string; shelfLabel: string; items: readonly Item[] };
  /** An HTML overlay opened or closed; the game ignores input while one is open. */
  'overlay:change': { open: boolean };
}

type Handler<T> = (payload: T) => void;

export interface EventBus<E> {
  /** Subscribes to an event; returns a function that unsubscribes. */
  on<K extends keyof E>(type: K, handler: Handler<E[K]>): () => void;
  emit<K extends keyof E>(type: K, payload: E[K]): void;
}

export function createEventBus<E>(): EventBus<E> {
  const handlers = new Map<keyof E, Set<Handler<never>>>();

  return {
    on(type, handler) {
      const set = handlers.get(type) ?? new Set();
      set.add(handler);
      handlers.set(type, set);
      return () => set.delete(handler);
    },
    emit(type, payload) {
      handlers.get(type)?.forEach((handler) => {
        (handler as Handler<typeof payload>)(payload);
      });
    },
  };
}

/** The app-wide bus. */
export const bus = createEventBus<AppEvents>();
