/**
 * Conversion Domain Events
 * @description Events emitted by the conversion bounded context
 */

import { BaseDomainEvent } from '../../shared/domain-event';

export interface ConversionRecordedPayload {
  readonly orderId: string;
  readonly sessionId: string;
  readonly total: { amount: number; currency: string };
}

export class ConversionRecordedEvent extends BaseDomainEvent<'conversion.recorded', ConversionRecordedPayload> {
  constructor(payload: ConversionRecordedPayload) {
    super('conversion.recorded', payload);
  }
}
