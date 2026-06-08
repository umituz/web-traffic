/**
 * UTM Value Check
 * @description Validates UTM campaign parameter values (length + character whitelist)
 */

import { assertString } from './assertions';

const UTM_MAX_LENGTH = 200;
const UTM_ALLOWED_CHARS_PATTERN = /^[\w\s\-./%?=&#:@(),+]+$/;

export function isValidUtmValue(value: string): boolean {
  if (typeof value !== 'string') return false;
  if (value.length > UTM_MAX_LENGTH) return false;
  return UTM_ALLOWED_CHARS_PATTERN.test(value);
}

export function assertValidUtmValue(value: string | undefined, fieldName: string): void {
  if (value === undefined || value === '') return;
  assertString(value, `UTM ${fieldName}`);
  if (value.length > UTM_MAX_LENGTH) {
    throw new Error(`UTM ${fieldName} exceeds max length of ${UTM_MAX_LENGTH} characters`);
  }
  if (!UTM_ALLOWED_CHARS_PATTERN.test(value)) {
    throw new Error(`UTM ${fieldName} contains invalid characters`);
  }
}
