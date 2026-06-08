/**
 * Conversion Rate
 * @description Calculates the conversion rate (percentage of visits that converted)
 * @note When conversions > visits (e.g., conversions added retroactively), the rate is capped at 100%
 */

export function calculateConversionRate(visits: number, conversions: number): number {
  if (visits < 0 || conversions < 0) {
    throw new Error('Visits and conversions must be non-negative');
  }
  if (visits === 0) {
    return 0;
  }
  if (conversions >= visits) {
    return PERCENT_MULTIPLIER;
  }
  return (conversions / visits) * PERCENT_MULTIPLIER;
}

const PERCENT_MULTIPLIER = 100;
