/**
 * Tracking Domain Export
 * Subpath: @umituz/web-traffic/tracking
 */

// Aggregates
export { Session } from './aggregates/session.aggregate';
export type { SessionCreateInput } from './aggregates/session.aggregate';

// Entities
export { Event } from './entities/event.entity';
export type { EventCreateInput } from './entities/event.entity';

export { Pageview } from './entities/pageview.entity';
export type { PageviewCreateInput } from './entities/pageview.entity';

// Value Objects
export { SessionId } from './value-objects/session-id.vo';
export { EventId } from './value-objects/event-id.vo';
export { UTMParameters } from './value-objects/utm-parameters.vo';

// Repository Interfaces
export type {
  IEventRepository,
  IPageviewRepository,
  ISessionRepository,
} from './repositories/event.repository.interface';

// Domain Events
export { EventTracked } from './events/event-tracked.domain-event';
export { PageviewTracked } from './events/pageview-tracked.domain-event';

// Application Services
export { TrackingCommandService } from './application/tracking-command.service';
export type { TrackingCommandResult } from './application/tracking-command.service';
