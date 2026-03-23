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
export { DeviceInfo } from './value-objects/device-info.vo';
export type { DeviceType, BrowserInfo, OSInfo } from './value-objects/device-info.vo';

// Repository Interfaces
export type {
  IEventRepository,
  IPageviewRepository,
  ISessionRepository,
} from './repositories/event.repository.interface';

// Application Services
export { TrackingCommandService } from './application/tracking-command.service';
export type { TrackingCommandResult } from './application/tracking-command.service';
