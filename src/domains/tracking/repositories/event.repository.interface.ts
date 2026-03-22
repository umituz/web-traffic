/**
 * Event Repository Interface
 * @description Repository interface for Event persistence (Domain Layer)
 */

import type { Event } from '../entities/event.entity';
import type { EventId } from '../value-objects/event-id.vo';
import type { SessionId } from '../value-objects/session-id.vo';

export interface IEventRepository {
  save(event: Event): Promise<void>;
  findById(id: EventId): Promise<Event | null>;
  findBySessionId(sessionId: SessionId): Promise<Event[]>;
  delete(id: EventId): Promise<void>;
}

export interface IPageviewRepository {
  save(pageview: import('../entities/pageview.entity').Pageview): Promise<void>;
  findById(id: EventId): Promise<import('../entities/pageview.entity').Pageview | null>;
  findBySessionId(sessionId: SessionId): Promise<import('../entities/pageview.entity').Pageview[]>;
  delete(id: EventId): Promise<void>;
}

export interface ISessionRepository {
  save(session: import('../aggregates/session.aggregate').Session): Promise<void>;
  findById(id: SessionId): Promise<import('../aggregates/session.aggregate').Session | null>;
  findActive(deviceId: string, timeoutMs: number): Promise<import('../aggregates/session.aggregate').Session | null>;
  delete(id: SessionId): Promise<void>;
}
