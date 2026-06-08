/**
 * Currency Amount Rounding
 * @description Rounds a monetary amount to the currency's standard decimal places
 */

export function roundCurrencyAmount(amount: number, decimals: number): number {
  if (!Number.isFinite(amount)) {
    throw new Error('Cannot round a non-finite amount');
  }
  if (decimals < 0 || !Number.isInteger(decimals)) {
    throw new Error('Decimals must be a non-negative integer');
  }
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
}

export function currencyPrecisionFactor(decimals: number): number {
  return Math.pow(10, decimals);
}
