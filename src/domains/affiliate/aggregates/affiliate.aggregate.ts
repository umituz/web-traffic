/**
 * Affiliate Aggregate Root
 * @description Manages affiliate partner and tracked visits/conversions
 */

import type { AffiliateVisit } from '../entities/affiliate-visit.entity';
import { AffiliateId } from '../value-objects/affiliate-id.vo';
import { SiteId } from '../value-objects/site-id.vo';
import { Money } from '../../conversion/value-objects/money.vo';
import { calculateCommissionAmount, calculateConversionRate } from '../../../shared/calculations';
import {
  assertValidCommissionRate,
  assertValidSlug,
  assertNonEmptyString,
} from '../../../shared/validation';

export interface AffiliateCreateInput {
  id: AffiliateId;
  siteId: SiteId;
  name: string;
  slug: string;
  commissionRate: number;
  active?: boolean;
}

export interface AffiliateStats {
  readonly totalVisits: number;
  readonly totalConversions: number;
  readonly totalRevenue: ReturnType<Money['toJSON']>;
  readonly commission: ReturnType<Money['toJSON']>;
  readonly conversionRate: number;
}

export interface AffiliateState {
  readonly id: string;
  readonly siteId: string;
  readonly name: string;
  readonly slug: string;
  readonly commissionRate: number;
  readonly active: boolean;
  readonly stats: AffiliateStats;
  readonly createdAt: number;
}

export class Affiliate {
  readonly id: AffiliateId;
  readonly siteId: SiteId;
  readonly name: string;
  readonly slug: string;
  readonly commissionRate: number;
  readonly active: boolean;
  readonly createdAt: number;
  private totalVisits: number = 0;
  private totalConversions: number = 0;
  private totalRevenue: Money;

  private constructor(input: Required<AffiliateCreateInput> & { createdAt: number; totalRevenue: Money }) {
    this.id = input.id;
    this.siteId = input.siteId;
    this.name = input.name;
    this.slug = input.slug;
    this.commissionRate = input.commissionRate;
    this.active = input.active;
    this.createdAt = input.createdAt;
    this.totalRevenue = input.totalRevenue;
  }

  static create(input: AffiliateCreateInput): Affiliate {
    assertNonEmptyString(input.name, 'Affiliate name');
    assertValidSlug(input.slug, 'Affiliate slug');
    assertValidCommissionRate(input.commissionRate);
    return new Affiliate({
      id: input.id,
      siteId: input.siteId,
      name: input.name,
      slug: input.slug,
      commissionRate: input.commissionRate,
      active: input.active ?? true,
      createdAt: Date.now(),
      totalRevenue: Money.zero(),
    });
  }

  static fromState(state: AffiliateState): Affiliate {
    const affiliate = new Affiliate({
      id: AffiliateId.of(state.id),
      siteId: SiteId.of(state.siteId),
      name: state.name,
      slug: state.slug,
      commissionRate: state.commissionRate,
      active: state.active,
      createdAt: state.createdAt,
      totalRevenue: Money.of(state.stats.totalRevenue.amount, state.stats.totalRevenue.currency),
    });
    affiliate.totalVisits = state.stats.totalVisits;
    affiliate.totalConversions = state.stats.totalConversions;
    return affiliate;
  }

  addVisit(visit: AffiliateVisit): void {
    this.assertActive();
    if (!visit.affiliateId.equals(this.id)) {
      throw new Error('Visit does not belong to this affiliate');
    }
    this.totalVisits++;
  }

  addConversion(revenue: Money): void {
    this.assertActive();
    this.totalConversions++;
    this.totalRevenue = this.totalRevenue.add(revenue);
  }

  calculateCommission(): Money {
    return this.totalRevenue.multiply(calculateCommissionAmount(1, this.commissionRate));
  }

  isActive(): boolean {
    return this.active;
  }

  getStats(): AffiliateStats {
    return {
      totalVisits: this.totalVisits,
      totalConversions: this.totalConversions,
      totalRevenue: this.totalRevenue.toJSON(),
      commission: this.calculateCommission().toJSON(),
      conversionRate: calculateConversionRate(this.totalVisits, this.totalConversions),
    };
  }

  toJSON(): AffiliateState {
    return {
      id: this.id.toString(),
      siteId: this.siteId.toString(),
      name: this.name,
      slug: this.slug,
      commissionRate: this.commissionRate,
      active: this.active,
      stats: this.getStats(),
      createdAt: this.createdAt,
    };
  }

  private assertActive(): void {
    if (!this.active) {
      throw new Error('Cannot perform operation on inactive affiliate');
    }
  }
}
