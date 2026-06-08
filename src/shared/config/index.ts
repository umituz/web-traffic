/**
 * Config Index
 * @description Barrel export for all configuration modules
 */

export {
  SESSION_INACTIVITY_TIMEOUT_MS,
  EVENT_QUEUE_FLUSH_INTERVAL_MS,
  EVENT_QUEUE_MAX_SIZE,
  EVENT_QUEUE_FLUSH_THRESHOLD,
} from './tracking-defaults';

export {
  HTTP_REQUEST_TIMEOUT_MS,
  HTTP_RETRY_ATTEMPTS,
  HTTP_RETRY_BASE_DELAY_MS,
  SESSION_STORAGE_KEY,
  DEVICE_ID_STORAGE_KEY,
  DEFAULT_ANALYTICS_API_URL,
} from './infrastructure-defaults';

export {
  EVENT_NAME_MAX_LENGTH,
  PAGEVIEW_PATH_MAX_LENGTH,
  UTM_VALUE_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_MAX_LENGTH,
  SITE_ID_MIN_LENGTH,
  SITE_ID_MAX_LENGTH,
} from './validation-limits';
