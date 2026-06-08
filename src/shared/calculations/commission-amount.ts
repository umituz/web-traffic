/**
 * Commission Amount
 * @description Calculates the monetary commission from a revenue amount and percentage rate
 */

export function calculateCommissionAmount(revenue: number, ratePercent: number): number {
  if (revenue < 0) {
    throw new Error('Revenue cannot be negative');
  }
  if (ratePercent < 0 || ratePercent > 100) {
    throw new Error('Rate must be between 0 and 100');
  }
  return revenue * (ratePercent / PERCENT_DIVISOR);
}

const PERCENT_DIVISOR = 100;
