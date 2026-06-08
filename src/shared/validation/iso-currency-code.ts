/**
 * ISO 4217 Currency Code
 * @description Validates ISO 4217 currency codes (3 uppercase letters)
 */

import { assertString } from './assertions';

const ISO_4217_PATTERN = /^[A-Z]{3}$/;

export function isValidCurrencyCode(code: string): boolean {
  return typeof code === 'string' && ISO_4217_PATTERN.test(code);
}

export function assertValidCurrencyCode(code: string): void {
  assertString(code, 'Currency code');
  if (!ISO_4217_PATTERN.test(code)) {
    throw new Error('Currency must be a valid ISO 4217 code (3 uppercase letters)');
  }
}

export function normalizeCurrencyCode(code: string): string {
  return code.toUpperCase();
}
