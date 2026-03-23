/**
 * Event Repository Interface
 * @description Repository interface for Event persistence (Domain Layer)
 */

import type { Event } from '../entities/event.entity';
import type { Pageview } from '../entities/pageview.entity';
import type { EventId } from '../value-objects/event-id.vo';
import type { SessionId } from '../value-objects/session-id.vo';
import type { Session } from '../aggregates/session.aggregate';

export interface IEventRepository {
  save(event: Event | Pageview): Promise<void>;
  findById(id: EventId): Promise<Event | null>;
  findBySessionId(sessionId: SessionId): Promise<Event[]>;
  delete(id: EventId): Promise<void>;
}

export interface IPageviewRepository {
  save(pageview: Pageview): Promise<void>;
  findById(id: EventId): Promise<Pageview | null>;
  findBySessionId(sessionId: SessionId): Promise<Pageview[]>;
  delete(id: EventId): Promise<void>;
}

export interface ISessionRepository {
  save(session: Session): Promise<void>;
  findById(id: SessionId): Promise<Session | null>;
  findActive(deviceId: string, timeoutMs: number): Promise<Session | null>;
  delete(id: SessionId): Promise<void>;
}
