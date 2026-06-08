/**
 * Queue Overflow Trim
 * @description Calculates how many items to drop from the front of a queue to stay within capacity
 */

export function calculateQueueOverflow(currentSize: number, maxSize: number): number {
  if (maxSize <= 0) {
    throw new Error('maxSize must be positive');
  }
  if (currentSize <= maxSize) {
    return 0;
  }
  return currentSize - maxSize;
}

export function trimQueueOverflow<T>(queue: T[], maxSize: number): { retained: T[]; dropped: T[] } {
  const overflow = calculateQueueOverflow(queue.length, maxSize);
  if (overflow === 0) {
    return { retained: queue, dropped: [] };
  }
  return {
    retained: queue.slice(overflow),
    dropped: queue.slice(0, overflow),
  };
}
