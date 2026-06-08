/**
 * ID Prefix Check
 * @description Validates that an identifier string begins with the expected prefix
 */

import { assertString } from './assertions';

export function assertHasPrefix(value: string, expectedPrefix: string): void {
  assertString(value, 'ID');
  assertString(expectedPrefix, 'Prefix');
  if (!value.startsWith(expectedPrefix)) {
    throw new Error(`ID must start with "${expectedPrefix}"`);
  }
}
