/**
 * Pageview Path Check
 * @description Validates pageview path strings
 */

import { assertString } from './assertions';

const PATH_MAX_LENGTH = 2048;

export function assertValidPageviewPath(path: string): void {
  assertString(path, 'Pageview path');
  if (path.trim().length === 0) {
    throw new Error('Pageview path cannot be empty');
  }
  if (path.length > PATH_MAX_LENGTH) {
    throw new Error(`Pageview path exceeds max length of ${PATH_MAX_LENGTH} characters`);
  }
}
