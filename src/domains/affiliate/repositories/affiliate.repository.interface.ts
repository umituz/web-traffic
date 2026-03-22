/**
 * Affiliate Repository Interface
 * @description Repository interface for Affiliate persistence (Domain Layer)
 */

import type { Affiliate } from '../aggregates/affiliate.aggregate';
import type { AffiliateVisit } from '../entities/affiliate-visit.entity';
import type { AffiliateId } from '../value-objects/affiliate-id.vo';
import type { SiteId } from '../value-objects/site-id.vo';
import type { SessionId } from '../../tracking/value-objects/session-id.vo';

export interface IAffiliateRepository {
  save(affiliate: Affiliate): Promise<void>;
  findById(id: AffiliateId): Promise<Affiliate | null>;
  findBySlug(siteId: SiteId, slug: string): Promise<Affiliate | null>;
  findBySite(siteId: SiteId): Promise<Affiliate[]>;
  delete(id: AffiliateId): Promise<void>;
}

export interface IAffiliateVisitRepository {
  save(visit: AffiliateVisit): Promise<void>;
  findById(id: import('../../tracking/value-objects/event-id.vo').EventId): Promise<AffiliateVisit | null>;
  findByAffiliate(affiliateId: AffiliateId): Promise<AffiliateVisit[]>;
  findByVisitorAndSession(visitorId: string, sessionId: SessionId): Promise<AffiliateVisit[]>;
  delete(id: import('../../tracking/value-objects/event-id.vo').EventId): Promise<void>;
}
