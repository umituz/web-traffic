/**
 * Test: Affiliate Aggregate
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Affiliate } from '../../src/domains/affiliate/aggregates/affiliate.aggregate';
import { AffiliateId } from '../../src/domains/affiliate/value-objects/affiliate-id.vo';
import { SiteId } from '../../src/domains/affiliate/value-objects/site-id.vo';
import { Money } from '../../src/domains/conversion/value-objects/money.vo';
import { AffiliateVisit } from '../../src/domains/affiliate/entities/affiliate-visit.entity';
import { EventId } from '../../src/domains/tracking/value-objects/event-id.vo';
import { SessionId } from '../../src/domains/tracking/value-objects/session-id.vo';

function makeAffiliate(commissionRate = 10): Affiliate {
  return Affiliate.create({
    id: AffiliateId.of('partner-1'),
    siteId: SiteId.of('site-test'),
    name: 'Test Partner',
    slug: 'partner-1',
    commissionRate,
  });
}

function makeVisit(affiliate: Affiliate): AffiliateVisit {
  return AffiliateVisit.create({
    affiliateId: affiliate.id,
    siteId: affiliate.siteId,
    visitorId: 'visitor-1',
    sessionId: SessionId.of('session-test'),
    landingPage: '/home',
  });
}

test('Affiliate - create initializes state', () => {
  const aff = makeAffiliate();
  assert.equal(aff.isActive(), true);
  const stats = aff.getStats();
  assert.equal(stats.totalVisits, 0);
  assert.equal(stats.totalConversions, 0);
  assert.equal(stats.conversionRate, 0);
});

test('Affiliate - rejects invalid commission rate', () => {
  assert.throws(() => makeAffiliate(-1));
  assert.throws(() => makeAffiliate(101));
});

test('Affiliate - addVisit increments count', () => {
  const aff = makeAffiliate();
  aff.addVisit(makeVisit(aff));
  aff.addVisit(makeVisit(aff));
  assert.equal(aff.getStats().totalVisits, 2);
});

test('Affiliate - addVisit rejects visit from other affiliate', () => {
  const aff = makeAffiliate();
  const other = Affiliate.create({
    id: AffiliateId.of('partner-2'),
    siteId: SiteId.of('site-test'),
    name: 'Other',
    slug: 'partner-2',
    commissionRate: 5,
  });
  assert.throws(() => aff.addVisit(makeVisit(other)));
});

test('Affiliate - addConversion accumulates revenue', () => {
  const aff = makeAffiliate();
  aff.addConversion(Money.of(100, 'USD'));
  aff.addConversion(Money.of(50, 'USD'));
  const stats = aff.getStats();
  assert.equal(stats.totalConversions, 2);
  assert.equal(stats.totalRevenue.amount, 150);
});

test('Affiliate - calculateCommission applies rate', () => {
  const aff = makeAffiliate(10);
  aff.addConversion(Money.of(100, 'USD'));
  const commission = aff.calculateCommission();
  assert.equal(commission.getAmount(), 10);
});

test('Affiliate - inactive blocks operations', () => {
  const aff = Affiliate.create({
    id: AffiliateId.of('partner-1'),
    siteId: SiteId.of('site-test'),
    name: 'Test',
    slug: 'partner-1',
    commissionRate: 10,
    active: false,
  });
  assert.throws(() => aff.addVisit(makeVisit(aff)));
  assert.throws(() => aff.addConversion(Money.of(10, 'USD')));
});

test('Affiliate - conversionRate calculation', () => {
  const aff = makeAffiliate();
  for (let i = 0; i < 4; i++) {
    aff.addVisit(makeVisit(aff));
  }
  aff.addConversion(Money.of(100, 'USD'));
  const stats = aff.getStats();
  assert.equal(stats.conversionRate, 25);
});

test('Affiliate - toJSON roundtrip', () => {
  const original = makeAffiliate(15);
  original.addVisit(makeVisit(original));
  original.addConversion(Money.of(200, 'USD'));

  const restored = Affiliate.fromState(original.toJSON());
  assert.equal(restored.commissionRate, 15);
  assert.equal(restored.getStats().totalVisits, 1);
  assert.equal(restored.getStats().totalRevenue.amount, 200);
});

test('AffiliateVisit - creates with required fields', () => {
  const visit = AffiliateVisit.create({
    affiliateId: AffiliateId.of('partner-1'),
    siteId: SiteId.of('site-test'),
    visitorId: 'v1',
    sessionId: SessionId.of('session-test'),
    landingPage: '/home',
  });
  assert.ok(visit.id.toString().startsWith('event-'));
  assert.equal(visit.landingPage, '/home');
});

test('AffiliateVisit - rejects empty landing page', () => {
  assert.throws(() => AffiliateVisit.create({
    affiliateId: AffiliateId.of('partner-1'),
    siteId: SiteId.of('site-test'),
    visitorId: 'v1',
    sessionId: SessionId.of('session-test'),
    landingPage: '',
  }));
});

test('AffiliateVisit - custom id is preserved', () => {
  const customId = EventId.of('event-custom-1');
  const visit = AffiliateVisit.create({
    id: customId,
    affiliateId: AffiliateId.of('partner-1'),
    siteId: SiteId.of('site-test'),
    visitorId: 'v1',
    sessionId: SessionId.of('session-test'),
    landingPage: '/home',
  });
  assert.equal(visit.id.toString(), 'event-custom-1');
});
