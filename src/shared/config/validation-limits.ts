/**
 * Validation Limits
 * @description Centralized limits for value validation
 * @note These are intentionally not overridable per-call — they are domain rules
 */

/** Maximum length of a tracking event name. */
export const EVENT_NAME_MAX_LENGTH = 100;

/** Maximum length of a pageview path. */
export const PAGEVIEW_PATH_MAX_LENGTH = 2048;

/** Maximum length of any single UTM parameter value. */
export const UTM_VALUE_MAX_LENGTH = 200;

/** Minimum length of a slug identifier. */
export const SLUG_MIN_LENGTH = 3;

/** Maximum length of a slug identifier. */
export const SLUG_MAX_LENGTH = 64;

/** Minimum length of a SiteId. */
export const SITE_ID_MIN_LENGTH = 5;

/** Maximum length of a SiteId. */
export const SITE_ID_MAX_LENGTH = 64;
