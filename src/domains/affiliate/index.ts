/**
 * Affiliate Domain Export
 * Subpath: @umituz/web-traffic/affiliate
 */

export { Affiliate } from './aggregates/affiliate.aggregate';
export type { AffiliateCreateInput, AffiliateStats, AffiliateState } from './aggregates/affiliate.aggregate';

export { AffiliateVisit } from './entities/affiliate-visit.entity';
export type { AffiliateVisitCreateInput, AffiliateVisitState } from './entities/affiliate-visit.entity';

export { AffiliateId } from './value-objects/affiliate-id.vo';
export { SiteId } from './value-objects/site-id.vo';

export type {
  IAffiliateRepository,
  IAffiliateVisitRepository,
} from './repositories/affiliate.repository.interface';

export {
  AffiliateVisitRecordedEvent,
  AffiliateConversionRecordedEvent,
} from './events/affiliate.events';
export type {
  AffiliateVisitPayload,
  AffiliateConversionPayload,
} from './events/affiliate.events';
