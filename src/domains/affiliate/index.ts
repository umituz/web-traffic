/**
 * Affiliate Domain Export
 * Subpath: @umituz/web-traffic/affiliate
 */

// Aggregates
export { Affiliate } from './aggregates/affiliate.aggregate';
export type { AffiliateCreateInput } from './aggregates/affiliate.aggregate';

// Entities
export { AffiliateVisit } from './entities/affiliate-visit.entity';
export type { AffiliateVisitCreateInput } from './entities/affiliate-visit.entity';

// Value Objects
export { AffiliateId } from './value-objects/affiliate-id.vo';
export { SiteId } from './value-objects/site-id.vo';

// Repository Interfaces
export type {
  IAffiliateRepository,
  IAffiliateVisitRepository,
} from './repositories/affiliate.repository.interface';
