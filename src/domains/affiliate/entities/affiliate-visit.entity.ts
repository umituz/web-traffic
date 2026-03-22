/**
 * AffiliateVisit Entity
 * @description Represents a visit attributed to an affiliate
 */

import type { EventId } from '../../tracking/value-objects/event-id.vo';
import type { AffiliateId } from '../value-objects/affiliate-id.vo';
import type { SiteId } from '../value-objects/site-id.vo';
import type { SessionId } from '../../tracking/value-objects/session-id.vo';

export interface AffiliateVisitCreateInput {
  id: EventId;
  affiliateId: AffiliateId;
  siteId: SiteId;
  visitorId: string;
  sessionId: SessionId;
  landingPage: string;
  timestamp?: number;
}

export class AffiliateVisit {
  readonly id: EventId;
  readonly affiliateId: AffiliateId;
  readonly siteId: SiteId;
  readonly visitorId: string;
  readonly sessionId: SessionId;
  readonly landingPage: string;
  readonly timestamp: number;

  constructor(input: AffiliateVisitCreateInput) {
    this.id = input.id;
    this.affiliateId = input.affiliateId;
    this.siteId = input.siteId;
    this.visitorId = input.visitorId;
    this.sessionId = input.sessionId;
    this.landingPage = input.landingPage;
    this.timestamp = input.timestamp ?? Date.now();
    Object.freeze(this);
  }

  toJSON() {
    return {
      id: this.id.toString(),
      affiliateId: this.affiliateId.toString(),
      siteId: this.siteId.toString(),
      visitorId: this.visitorId,
      sessionId: this.sessionId.toString(),
      landingPage: this.landingPage,
      timestamp: this.timestamp,
    };
  }
}
