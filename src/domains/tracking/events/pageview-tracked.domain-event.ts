/**
 * Pageview Tracked Domain Event
 * @description Published when a pageview is tracked
 */

import type { EventId } from '../../tracking/value-objects/event-id.vo';
import type { SessionId } from '../../tracking/value-objects/session-id.vo';

export class PageviewTracked {
  readonly eventType = 'PageviewTracked';
  readonly pageviewId: EventId;
  readonly sessionId: SessionId;
  readonly path: string;
  readonly hasUTM: boolean;
  readonly occurredAt: number;

  constructor(params: {
    pageviewId: EventId;
    sessionId: SessionId;
    path: string;
    hasUTM: boolean;
    occurredAt?: number;
  }) {
    this.pageviewId = params.pageviewId;
    this.sessionId = params.sessionId;
    this.path = params.path;
    this.hasUTM = params.hasUTM;
    this.occurredAt = params.occurredAt ?? Date.now();
    Object.freeze(this);
  }
}
