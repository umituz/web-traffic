/**
 * Typed Event Emitter
 * @description Type-safe pub/sub for domain events (Observer pattern)
 */

import type { DomainEvent } from './domain-event';

export type EventMap = Record<string, DomainEvent>;

export type EventListener<TEvent extends DomainEvent> = (event: TEvent) => void;

export type Unsubscribe = () => void;

export class TypedEventEmitter<TMap extends EventMap> {
  private readonly listeners = new Map<keyof TMap, Set<EventListener<DomainEvent>>>();

  on<K extends keyof TMap>(type: K, listener: EventListener<TMap[K]>): Unsubscribe {
    const set = this.getOrCreate(type);
    set.add(listener as EventListener<DomainEvent>);
    return () => {
      const current = this.listeners.get(type);
      if (current) {
        current.delete(listener as EventListener<DomainEvent>);
        if (current.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  once<K extends keyof TMap>(type: K, listener: EventListener<TMap[K]>): Unsubscribe {
    const unsubscribe = this.on(type, ((event) => {
      unsubscribe();
      listener(event);
    }) as EventListener<TMap[K]>);
    return unsubscribe;
  }

  emit<K extends keyof TMap>(type: K, event: TMap[K]): void {
    const set = this.listeners.get(type);
    if (!set || set.size === 0) {
      return;
    }
    for (const listener of [...set]) {
      try {
        listener(event);
      } catch (error) {
        // Listener errors must not break the chain
        if (typeof console !== 'undefined') {
          console.error(`[TypedEventEmitter] Listener for "${String(type)}" threw:`, error);
        }
      }
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }

  listenerCount<K extends keyof TMap>(type: K): number {
    return this.listeners.get(type)?.size ?? 0;
  }

  private getOrCreate(type: keyof TMap): Set<EventListener<DomainEvent>> {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    return set;
  }
}
