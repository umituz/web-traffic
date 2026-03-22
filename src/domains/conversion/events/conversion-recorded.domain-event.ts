/**
 * Conversion Recorded Domain Event
 * @description Published when a conversion is recorded
 */

import type { Money } from '../value-objects/money.vo';

export class ConversionRecorded {
  readonly eventType = 'ConversionRecorded';
  readonly orderId: string;
  readonly sessionId: string;
  readonly revenue: Money;
  readonly itemCount: number;
  readonly occurredAt: number;

  constructor(params: {
    orderId: string;
    sessionId: string;
    revenue: Money;
    itemCount: number;
    occurredAt?: number;
  }) {
    this.orderId = params.orderId;
    this.sessionId = params.sessionId;
    this.revenue = params.revenue;
    this.itemCount = params.itemCount;
    this.occurredAt = params.occurredAt ?? Date.now();
    Object.freeze(this);
  }
}
