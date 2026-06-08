/**
 * Infrastructure Export
 * Subpath: @umituz/web-traffic/infrastructure
 */

export {
  HTTPEventRepository,
  HTTPPageviewRepository,
  LocalSessionRepository,
} from './repositories/http-event.repository.impl';
export type { HTTPRepositoryConfig } from './repositories/http-event.repository.impl';

export { HTTPAnalyticsRepository } from './analytics/http-analytics.repository.impl';
export type { HTTPAnalyticsConfig } from './analytics/http-analytics.repository.impl';

export {
  createHttpClient,
  HttpError,
  HttpTimeoutError,
} from './http-client';
export type { HttpClient, HttpRequestOptions, HttpClientConfig } from './http-client';

export { DeviceIdProvider } from './tracking/device-id.provider';
export { UtmExtractor } from './tracking/utm-extractor';
export { AutoTracker } from './tracking/auto-tracker';
export type { PageviewListener } from './tracking/auto-tracker';
export { SessionManager } from './tracking/session-manager';
export type { SessionListener, Unsubscribe } from './tracking/session-manager';

export { WebTrafficService, webTrafficService } from './tracking/web-traffic.service';
export type { WebTrafficConfig } from './tracking/web-traffic.service';

export { sleep, withTimeout } from '../shared/async';
