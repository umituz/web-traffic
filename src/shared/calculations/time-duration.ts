/**
 * Time Duration
 * @description Conversions between different time units (ms, seconds, minutes)
 */

export function minutesToMilliseconds(minutes: number): number {
  if (minutes < 0) {
    throw new Error('Minutes must be non-negative');
  }
  return minutes * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
}

export function secondsToMilliseconds(seconds: number): number {
  if (seconds < 0) {
    throw new Error('Seconds must be non-negative');
  }
  return seconds * MILLISECONDS_PER_SECOND;
}

export function elapsedMilliseconds(start: number, end: number = Date.now()): number {
  return Math.max(0, end - start);
}

const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
