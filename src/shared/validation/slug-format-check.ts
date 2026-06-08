/**
 * Slug Format Check
 * @description Validates URL-safe slug strings (alphanumeric, hyphens, underscores)
 */

import { assertString } from './assertions';

const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;
const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 64;

export function isValidSlug(slug: string): boolean {
  if (typeof slug !== 'string') return false;
  if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) return false;
  return SLUG_PATTERN.test(slug);
}

export function assertValidSlug(slug: string, fieldName: string = 'slug'): void {
  assertString(slug, fieldName);
  if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
    throw new Error(`${fieldName} must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH} characters`);
  }
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`${fieldName} must contain only alphanumeric characters, hyphens, and underscores`);
  }
}
