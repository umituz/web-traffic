/**
 * Event Tracked Domain Event
 * @description Published when an analytics event is tracked
 */

import type { EventId } from '../../tracking/value-objects/event-id.vo';
import type { SessionId } from '../../tracking/value-objects/session-id.vo';

export class EventTracked {
  readonly eventType = 'EventTracked';
  readonly eventId: EventId;
  readonly sessionId: SessionId;
  readonly eventName: string;
  readonly occurredAt: number;

  constructor(params: {
    eventId: EventId;
    sessionId: SessionId;
    eventName: string;
    occurredAt?: number;
  }) {
    this.eventId = params.eventId;
    this.sessionId = params.sessionId;
    this.eventName = params.eventName;
    this.occurredAt = params.occurredAt ?? Date.now();
    Object.freeze(this);
  }
}
