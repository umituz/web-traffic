/**
 * Tracking Domain Export
 * Subpath: @umituz/web-traffic/tracking
 */

export { Session, DEFAULT_SESSION_TIMEOUT_MS } from './aggregates/session.aggregate';
export type { SessionCreateInput, SessionState } from './aggregates/session.aggregate';

export { Event } from './entities/event.entity';
export type { EventCreateInput } from './entities/event.entity';

export { Pageview } from './entities/pageview.entity';
export type { PageviewCreateInput } from './entities/pageview.entity';

export { SessionId } from './value-objects/session-id.vo';
export { EventId } from './value-objects/event-id.vo';
export { DeviceId } from './value-objects/device-id.vo';
export { UTMParameters } from './value-objects/utm-parameters.vo';
export type { UTMParameterSet } from './value-objects/utm-parameters.vo';
export { DeviceInfo } from './value-objects/device-info.vo';
export type { DeviceType, BrowserInfo, OSInfo, ScreenSize } from './value-objects/device-info.vo';

export type {
  IEventRepository,
  IPageviewRepository,
  ISessionRepository,
  TrackableEvent,
} from './repositories/event.repository.interface';

export { TrackingCommandService, SessionNotFoundError } from './application/tracking-command.service';
export type { TrackingCommandResult } from './application/tracking-command.service';

export {
  EventTrackedEvent,
  PageviewTrackedEvent,
  SessionStartedEvent,
  SessionClosedEvent,
  TrackingErrorEvent,
} from './events/tracking.events';
export type {
  EventTrackedPayload,
  PageviewTrackedPayload,
  SessionStartedPayload,
  SessionClosedPayload,
  TrackingErrorPayload,
} from './events/tracking.events';
