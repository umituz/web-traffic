/**
 * Tracking Domain Events
 * @description Events emitted by the tracking bounded context
 */

import { BaseDomainEvent } from '../../shared/domain-event';

export interface EventTrackedPayload {
  readonly eventId: string;
  readonly sessionId: string;
  readonly name: string;
}

export class EventTrackedEvent extends BaseDomainEvent<'event.tracked', EventTrackedPayload> {
  constructor(payload: EventTrackedPayload) {
    super('event.tracked', payload);
  }
}

export interface PageviewTrackedPayload {
  readonly pageviewId: string;
  readonly sessionId: string;
  readonly path: string;
  readonly referrer: string | null;
  readonly utmSource: string | undefined;
}

export class PageviewTrackedEvent extends BaseDomainEvent<'pageview.tracked', PageviewTrackedPayload> {
  constructor(payload: PageviewTrackedPayload) {
    super('pageview.tracked', payload);
  }
}

export interface SessionStartedPayload {
  readonly sessionId: string;
  readonly deviceId: string;
  readonly isResumed: boolean;
}

export class SessionStartedEvent extends BaseDomainEvent<'session.started', SessionStartedPayload> {
  constructor(payload: SessionStartedPayload) {
    super('session.started', payload);
  }
}

export interface SessionClosedPayload {
  readonly sessionId: string;
  readonly durationMs: number;
}

export class SessionClosedEvent extends BaseDomainEvent<'session.closed', SessionClosedPayload> {
  constructor(payload: SessionClosedPayload) {
    super('session.closed', payload);
  }
}

export interface TrackingErrorPayload {
  readonly operation: 'trackEvent' | 'trackPageview';
  readonly message: string;
}

export class TrackingErrorEvent extends BaseDomainEvent<'tracking.error', TrackingErrorPayload> {
  constructor(payload: TrackingErrorPayload) {
    super('tracking.error', payload);
  }
}
