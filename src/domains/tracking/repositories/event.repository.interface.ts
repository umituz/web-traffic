/**
 * Event Repository Interface
 * @description Persistence contracts for tracking aggregates (Domain Layer)
 */

import type { Event } from '../entities/event.entity';
import type { Pageview } from '../entities/pageview.entity';
import type { EventId } from '../value-objects/event-id.vo';
import type { SessionId } from '../value-objects/session-id.vo';
import type { DeviceId } from '../value-objects/device-id.vo';
import type { Session } from '../aggregates/session.aggregate';

export type TrackableEvent = Event | Pageview;

export interface IEventRepository {
  save(event: TrackableEvent): Promise<void>;
  findById(id: EventId): Promise<Event | null>;
  findBySessionId(sessionId: SessionId): Promise<ReadonlyArray<Event>>;
  delete(id: EventId): Promise<void>;
}

export interface IPageviewRepository {
  save(pageview: Pageview): Promise<void>;
  findById(id: EventId): Promise<Pageview | null>;
  findBySessionId(sessionId: SessionId): Promise<ReadonlyArray<Pageview>>;
  delete(id: EventId): Promise<void>;
}

export interface ISessionRepository {
  save(session: Session): Promise<void>;
  findById(id: SessionId): Promise<Session | null>;
  findActive(deviceId: DeviceId, timeoutMs: number): Promise<Session | null>;
  delete(id: SessionId): Promise<void>;
}
