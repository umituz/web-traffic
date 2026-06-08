/**
 * Test: BrandedId
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SessionId } from '../src/domains/tracking/value-objects/session-id.vo';
import { EventId } from '../src/domains/tracking/value-objects/event-id.vo';
import { DeviceId } from '../src/domains/tracking/value-objects/device-id.vo';
import { SiteId } from '../src/domains/affiliate/value-objects/site-id.vo';
import { AffiliateId } from '../src/domains/affiliate/value-objects/affiliate-id.vo';

test('SessionId - rejects empty value', () => {
  assert.throws(() => SessionId.of(''));
  assert.throws(() => SessionId.of('   '));
});

test('SessionId - rejects wrong prefix', () => {
  assert.throws(() => SessionId.of('foo-123'));
});

test('SessionId - accepts valid value', () => {
  const id = SessionId.of('session-abc');
  assert.equal(id.toString(), 'session-abc');
});

test('SessionId - generate produces unique prefixed values', () => {
  const a = SessionId.generate();
  const b = SessionId.generate();
  assert.notEqual(a.toString(), b.toString());
  assert.ok(a.toString().startsWith('session-'));
});

test('SessionId - equals is value-based', () => {
  const a = SessionId.of('session-x');
  const b = SessionId.of('session-x');
  const c = SessionId.of('session-y');
  assert.ok(a.equals(b));
  assert.ok(!a.equals(c));
});

test('EventId - enforces prefix', () => {
  assert.throws(() => EventId.of('session-x'));
  const id = EventId.of('event-x');
  assert.equal(id.toString(), 'event-x');
});

test('DeviceId - generates with prefix', () => {
  const id = DeviceId.generate();
  assert.ok(id.toString().startsWith('device-'));
});

test('SiteId - enforces length', () => {
  assert.throws(() => SiteId.of('s'));
  assert.throws(() => SiteId.of('a'.repeat(100)));
  const id = SiteId.of('site-valid');
  assert.equal(id.toString(), 'site-valid');
});

test('AffiliateId - validates slug pattern', () => {
  assert.throws(() => AffiliateId.of('bad slug!'));
  assert.throws(() => AffiliateId.of('a'));
  const id = AffiliateId.of('partner-123');
  assert.equal(id.toString(), 'partner-123');
});
