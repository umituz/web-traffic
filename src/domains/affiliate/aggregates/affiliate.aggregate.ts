/**
 * Affiliate Aggregate Root
 * @description Manages affiliate and their visits within consistency boundary
 */

import type { AffiliateVisit } from '../entities/affiliate-visit.entity';
import { AffiliateId } from '../value-objects/affiliate-id.vo';
import { SiteId } from '../value-objects/site-id.vo';
import { Money } from '../../conversion/value-objects/money.vo';

export interface AffiliateCreateInput {
  id: AffiliateId;
  siteId: SiteId;
  name: string;
  slug: string;
  commissionRate: number; // Percentage (e.g., 10 for 10%)
  active?: boolean;
}

export class Affiliate {
  readonly id: AffiliateId;
  readonly siteId: SiteId;
  readonly name: string;
  readonly slug: string;
  readonly commissionRate: number;
  readonly active: boolean;
  private totalVisits: number = 0;
  private totalConversions: number = 0;
  private totalRevenue: Money;
  readonly createdAt: number;

  constructor(input: AffiliateCreateInput) {
    this.id = input.id;
    this.siteId = input.siteId;
    this.name = input.name;
    this.slug = input.slug;
    this.commissionRate = input.commissionRate;
    this.active = input.active ?? true;
    this.totalRevenue = Money.zero('USD');
    this.createdAt = Date.now();
    Object.freeze(this.id);
    Object.freeze(this.siteId);
    Object.freeze(this.name);
    Object.freeze(this.slug);
  }

  // Aggregate root methods - maintain consistency
  addVisit(visit: AffiliateVisit): void {
    if (!this.active) {
      throw new Error('Cannot add visit to inactive affiliate');
    }
    if (!visit.affiliateId.equals(this.id)) {
      throw new Error('Visit does not belong to this affiliate');
    }
    this.totalVisits++;
  }

  addConversion(revenue: Money): void {
    if (!this.active) {
      throw new Error('Cannot add conversion to inactive affiliate');
    }
    this.totalConversions++;
    this.totalRevenue = this.totalRevenue.add(revenue);
  }

  calculateCommission(): Money {
    return this.totalRevenue.multiply(this.commissionRate / 100);
  }

  isActive(): boolean {
    return this.active;
  }

  getStats() {
    return {
      totalVisits: this.totalVisits,
      totalConversions: this.totalConversions,
      totalRevenue: this.totalRevenue,
      commission: this.calculateCommission(),
      conversionRate: this.totalVisits > 0
        ? (this.totalConversions / this.totalVisits) * 100
        : 0,
    };
  }

  toJSON() {
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
}
