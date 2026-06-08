/**
 * Infrastructure Defaults
 * @description Centralized configuration for HTTP and storage layer
 */

import { secondsToMilliseconds } from '../calculations';

/**
 * Default HTTP request timeout.
 * @default 15 seconds
 */
export const HTTP_REQUEST_TIMEOUT_MS = secondsToMilliseconds(15);

/**
 * Default number of retry attempts on transient failures.
 * @default 2 retries (3 total attempts)
 */
export const HTTP_RETRY_ATTEMPTS = 2;

/**
 * Base delay (ms) for exponential backoff between retries.
 * @default 500ms
 */
export const HTTP_RETRY_BASE_DELAY_MS = 500;

/**
 * LocalStorage key for the persistent session.
 */
export const SESSION_STORAGE_KEY = 'wt_session';

/**
 * LocalStorage key for the persistent device id.
 */
export const DEVICE_ID_STORAGE_KEY = 'wt_device_id';

/**
 * Default analytics API endpoint.
 */
export const DEFAULT_ANALYTICS_API_URL = 'https://analytics.umituz.com';
