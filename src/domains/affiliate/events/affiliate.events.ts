/**
 * Affiliate Domain Events
 * @description Events emitted by the affiliate bounded context
 */

import { BaseDomainEvent } from '../../shared/domain-event';

export interface AffiliateVisitPayload {
  readonly visitId: string;
  readonly affiliateId: string;
  readonly sessionId: string;
  readonly landingPage: string;
}

export class AffiliateVisitRecordedEvent extends BaseDomainEvent<'affiliate.visit', AffiliateVisitPayload> {
  constructor(payload: AffiliateVisitPayload) {
    super('affiliate.visit', payload);
  }
}

export interface AffiliateConversionPayload {
  readonly affiliateId: string;
  readonly revenue: { amount: number; currency: string };
  readonly commission: { amount: number; currency: string };
}

export class AffiliateConversionRecordedEvent extends BaseDomainEvent<'affiliate.conversion', AffiliateConversionPayload> {
  constructor(payload: AffiliateConversionPayload) {
    super('affiliate.conversion', payload);
  }
}
