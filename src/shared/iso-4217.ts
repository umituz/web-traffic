/**
 * ISO 4217 Currency Registry
 * @description Currency code metadata (decimal places, symbol)
 */

export interface CurrencyMetadata {
  readonly code: string;
  readonly decimals: number;
}

const CURRENCY_REGISTRY: ReadonlyMap<string, CurrencyMetadata> = new Map([
  ['USD', { code: 'USD', decimals: 2 }],
  ['EUR', { code: 'EUR', decimals: 2 }],
  ['GBP', { code: 'GBP', decimals: 2 }],
  ['JPY', { code: 'JPY', decimals: 0 }],
  ['KRW', { code: 'KRW', decimals: 0 }],
  ['KWD', { code: 'KWD', decimals: 3 }],
  ['BHD', { code: 'BHD', decimals: 3 }],
  ['TRY', { code: 'TRY', decimals: 2 }],
]);

const DEFAULT_CURRENCY: CurrencyMetadata = { code: 'USD', decimals: 2 };

export function getCurrencyMetadata(code: string): CurrencyMetadata {
  return CURRENCY_REGISTRY.get(code.toUpperCase()) ?? DEFAULT_CURRENCY;
}

export function isValidCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}
