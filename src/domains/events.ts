/**
 * Domain Event Map
 * @description Centralized type map for all domain events (for TypedEventEmitter)
 */

import type { DomainEvent } from './shared/domain-event';
import { EventTrackedEvent } from './tracking/events/tracking.events';
import { PageviewTrackedEvent } from './tracking/events/tracking.events';
import { SessionStartedEvent } from './tracking/events/tracking.events';
import { SessionClosedEvent } from './tracking/events/tracking.events';
import { TrackingErrorEvent } from './tracking/events/tracking.events';
import { ConversionRecordedEvent } from './conversion/events/conversion.events';
import { AffiliateVisitRecordedEvent } from './affiliate/events/affiliate.events';
import { AffiliateConversionRecordedEvent } from './affiliate/events/affiliate.events';

export type AllDomainEvents =
  | EventTrackedEvent
  | PageviewTrackedEvent
  | SessionStartedEvent
  | SessionClosedEvent
  | TrackingErrorEvent
  | ConversionRecordedEvent
  | AffiliateVisitRecordedEvent
  | AffiliateConversionRecordedEvent;

export type WebTrafficEventMap = {
  'event.tracked': EventTrackedEvent;
  'pageview.tracked': PageviewTrackedEvent;
  'session.started': SessionStartedEvent;
  'session.closed': SessionClosedEvent;
  'tracking.error': TrackingErrorEvent;
  'conversion.recorded': ConversionRecordedEvent;
  'affiliate.visit': AffiliateVisitRecordedEvent;
  'affiliate.conversion': AffiliateConversionRecordedEvent;
};

export type { DomainEvent };
