/**
 * Tracking Defaults
 * @description Centralized configuration for tracking behavior
 * @note All values can be overridden at runtime via WebTrafficConfig
 */

import { minutesToMilliseconds, secondsToMilliseconds } from '../calculations';

/**
 * Session inactivity timeout before a new session is created.
 * @default 30 minutes
 */
export const SESSION_INACTIVITY_TIMEOUT_MS = minutesToMilliseconds(30);

/**
 * Time between automatic flushes of the event queue.
 * @default 30 seconds
 */
export const EVENT_QUEUE_FLUSH_INTERVAL_MS = secondsToMilliseconds(30);

/**
 * Maximum number of events held in the in-memory queue.
 * @default 100
 */
export const EVENT_QUEUE_MAX_SIZE = 100;

/**
 * Flush threshold — when the queue reaches this size, it auto-flushes.
 * @default 10
 */
export const EVENT_QUEUE_FLUSH_THRESHOLD = 10;
