/**
 * AffiliateVisit Entity
 * @description Represents a visit attributed to an affiliate
 */

import { EventId } from '../../tracking/value-objects/event-id.vo';
import type { AffiliateId } from '../value-objects/affiliate-id.vo';
import type { SiteId } from '../value-objects/site-id.vo';
import type { SessionId } from '../../tracking/value-objects/session-id.vo';
import { assertValidLandingPage } from '../../../shared/validation';

export interface AffiliateVisitCreateInput {
  affiliateId: AffiliateId;
  siteId: SiteId;
  visitorId: string;
  sessionId: SessionId;
  landingPage: string;
}

export interface AffiliateVisitState {
  readonly id: string;
  readonly affiliateId: string;
  readonly siteId: string;
  readonly visitorId: string;
  readonly sessionId: string;
  readonly landingPage: string;
  readonly timestamp: number;
}

export class AffiliateVisit {
  readonly id: EventId;
  readonly affiliateId: AffiliateId;
  readonly siteId: SiteId;
  readonly visitorId: string;
  readonly sessionId: SessionId;
  readonly landingPage: string;
  readonly timestamp: number;

  private constructor(input: {
    id: EventId;
    affiliateId: AffiliateId;
    siteId: SiteId;
    visitorId: string;
    sessionId: SessionId;
    landingPage: string;
    timestamp: number;
  }) {
    this.id = input.id;
    this.affiliateId = input.affiliateId;
    this.siteId = input.siteId;
    this.visitorId = input.visitorId;
    this.sessionId = input.sessionId;
    this.landingPage = input.landingPage;
    this.timestamp = input.timestamp;
  }

  static create(input: AffiliateVisitCreateInput & { id?: EventId; timestamp?: number }): AffiliateVisit {
    assertValidLandingPage(input.landingPage);
    return new AffiliateVisit({
      id: input.id ?? EventId.generate(),
      affiliateId: input.affiliateId,
      siteId: input.siteId,
      visitorId: input.visitorId,
      sessionId: input.sessionId,
      landingPage: input.landingPage,
      timestamp: input.timestamp ?? Date.now(),
    });
  }

  toJSON(): AffiliateVisitState {
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
