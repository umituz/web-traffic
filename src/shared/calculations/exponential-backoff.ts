/**
 * Exponential Backoff
 * @description Calculates delay between retry attempts using exponential growth
 */

export function calculateExponentialBackoff(attempt: number, baseMs: number): number {
  if (attempt < 0) {
    throw new Error('Attempt must be a non-negative integer');
  }
  if (baseMs < 0) {
    throw new Error('Base delay must be non-negative');
  }
  return baseMs * Math.pow(2, attempt);
}
