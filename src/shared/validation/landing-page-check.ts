/**
 * Landing Page Check
 * @description Validates affiliate landing page string
 */

import { assertString } from './assertions';

export function assertValidLandingPage(page: string): void {
  assertString(page, 'Landing page');
  if (page.trim().length === 0) {
    throw new Error('Landing page is required');
  }
}
