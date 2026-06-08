/**
 * Event Name Check
 * @description Validates tracking event names
 */

import { assertString } from './assertions';

const EVENT_NAME_MAX_LENGTH = 100;

export function assertValidEventName(name: string): void {
  assertString(name, 'Event name');
  if (name.trim().length === 0) {
    throw new Error('Event name cannot be empty');
  }
  if (name.length > EVENT_NAME_MAX_LENGTH) {
    throw new Error(`Event name exceeds max length of ${EVENT_NAME_MAX_LENGTH} characters`);
  }
}
