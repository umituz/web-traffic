/**
 * HTTP Event Repository Implementation
 * @description HTTP-based queue with batch flush, overflow protection, and timeout
 */

import type {
  IEventRepository,
  IPageviewRepository,
  ISessionRepository,
  TrackableEvent,
} from '../../domains/tracking/repositories/event.repository.interface';
import type { Event } from '../../domains/tracking/entities/event.entity';
import type { Pageview } from '../../domains/tracking/entities/pageview.entity';
import { Session, type SessionState } from '../../domains/tracking/aggregates/session.aggregate';
import { EventId } from '../../domains/tracking/value-objects/event-id.vo';
import { SessionId } from '../../domains/tracking/value-objects/session-id.vo';
import { DeviceId } from '../../domains/tracking/value-objects/device-id.vo';
import { createSafeStorage, type Storage } from '../../shared/safe-storage';
import { trimQueueOverflow } from '../../shared/calculations';
import {
  EVENT_QUEUE_FLUSH_INTERVAL_MS,
  EVENT_QUEUE_MAX_SIZE,
  EVENT_QUEUE_FLUSH_THRESHOLD,
  SESSION_STORAGE_KEY,
  SESSION_INACTIVITY_TIMEOUT_MS,
  HTTP_REQUEST_TIMEOUT_MS,
  HTTP_RETRY_ATTEMPTS,
} from '../../shared/config';
import { createHttpClient, HttpError, HttpTimeoutError, type HttpClient } from '../http-client';

export interface HTTPRepositoryConfig {
  readonly apiUrl: string;
  readonly apiKey: string;
}

interface QueueItem {
  readonly event: TrackableEvent;
  readonly timestamp: number;
}

export class HTTPEventRepository implements IEventRepository {
  private queue: QueueItem[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private beforeUnloadHandler: (() => void) | null = null;
  private isFlushing = false;
  private destroyed = false;
  private readonly http: HttpClient;

  constructor(config: HTTPRepositoryConfig) {
    this.http = createHttpClient(
      config.apiUrl,
      { 'X-API-Key': config.apiKey },
      { defaultTimeoutMs: HTTP_REQUEST_TIMEOUT_MS, defaultRetries: HTTP_RETRY_ATTEMPTS },
    );
    this.startFlushTimer();
    if (typeof window !== 'undefined') {
      this.beforeUnloadHandler = () => {
        void this.flush();
      };
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  async save(event: TrackableEvent): Promise<void> {
    if (this.destroyed) {
      throw new Error('HTTPEventRepository has been destroyed');
    }
    this.queue.push({ event, timestamp: Date.now() });

    const { dropped } = trimQueueOverflow(this.queue, EVENT_QUEUE_MAX_SIZE);
    if (dropped.length > 0) {
      this.queue.splice(0, dropped.length);
      if (typeof console !== 'undefined') {
        console.warn(
          `[HTTPEventRepository] Queue exceeded ${EVENT_QUEUE_MAX_SIZE} items, dropped ${dropped.length} oldest events`,
        );
      }
    }

    if (this.queue.length >= EVENT_QUEUE_FLUSH_THRESHOLD) {
      await this.flush();
    }
  }

  async findById(_id: EventId): Promise<Event | null> {
    return null;
  }

  async findBySessionId(_sessionId: SessionId): Promise<ReadonlyArray<Event>> {
    return [];
  }

  async delete(_id: EventId): Promise<void> {
    // Not supported by HTTP repository
  }

  destroy(): void {
    this.destroyed = true;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.beforeUnloadHandler && typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
    void this.flush();
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, EVENT_QUEUE_FLUSH_INTERVAL_MS);
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0 || this.isFlushing) {
      return;
    }

    this.isFlushing = true;
    const items = [...this.queue];
    this.queue = [];

    try {
      await this.http.request<void>('/track', {
        method: 'POST',
        body: {
          events: items.map((item) => item.event.toJSON()),
        },
        keepalive: true,
      } as never);
    } catch (error) {
      if (error instanceof HttpError) {
        if (typeof console !== 'undefined') {
          console.warn(`[HTTPEventRepository] Flush failed with HTTP ${error.status}, re-queuing`);
        }
        this.requeue(items);
      } else if (error instanceof HttpTimeoutError) {
        if (typeof console !== 'undefined') {
          console.warn(`[HTTPEventRepository] Flush timed out, re-queuing`);
        }
        this.requeue(items);
      } else {
        if (typeof console !== 'undefined') {
          console.error('[HTTPEventRepository] Unexpected flush error:', error);
        }
        this.requeue(items);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private requeue(items: ReadonlyArray<QueueItem>): void {
    this.queue = [...items, ...this.queue].slice(0, EVENT_QUEUE_MAX_SIZE);
  }
}

export class HTTPPageviewRepository implements IPageviewRepository {
  constructor(private readonly eventRepo: IEventRepository) {}

  async save(pageview: Pageview): Promise<void> {
    await this.eventRepo.save(pageview);
  }

  async findById(_id: EventId): Promise<Pageview | null> {
    return null;
  }

  async findBySessionId(_sessionId: SessionId): Promise<ReadonlyArray<Pageview>> {
    return [];
  }

  async delete(_id: EventId): Promise<void> {
    // Not supported by HTTP repository
  }
}

export class LocalSessionRepository implements ISessionRepository {
  private readonly storage: Storage;
  private readonly cache = new Map<string, Session>();

  constructor(storage: Storage = createSafeStorage()) {
    this.storage = storage;
  }

  async save(session: Session): Promise<void> {
    this.cache.set(session.id.toString(), session);
    try {
      this.storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session.toJSON()));
    } catch (error) {
      throw new Error(
        `Failed to persist session: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  async findById(id: SessionId): Promise<Session | null> {
    return this.cache.get(id.toString()) ?? null;
  }

  async findActive(
    deviceId: DeviceId,
    timeoutMs: number = SESSION_INACTIVITY_TIMEOUT_MS,
  ): Promise<Session | null> {
    const stored = this.storage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    let raw: unknown;
    try {
      raw = JSON.parse(stored);
    } catch {
      this.storage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    if (!isSessionState(raw) || raw.deviceId !== deviceId.toString()) {
      this.storage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    const session = Session.fromState(raw);
    if (!session.isActive(timeoutMs)) {
      this.storage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    this.cache.set(session.id.toString(), session);
    return session;
  }

  async delete(id: SessionId): Promise<void> {
    this.cache.delete(id.toString());
    this.storage.removeItem(SESSION_STORAGE_KEY);
  }
}

function isSessionState(value: unknown): value is SessionState {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const hasValidEndTime = typeof candidate.endTime === 'number' || candidate.endTime === null;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.deviceId === 'string' &&
    typeof candidate.siteId === 'string' &&
    typeof candidate.startTime === 'number' &&
    hasValidEndTime &&
    typeof candidate.eventCount === 'number' &&
    typeof candidate.pageviewCount === 'number'
  );
}
