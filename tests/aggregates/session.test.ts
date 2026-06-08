/**
 * Test: Session Aggregate
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Session, DEFAULT_SESSION_TIMEOUT_MS } from '../../src/domains/tracking/aggregates/session.aggregate';
import { SessionId } from '../../src/domains/tracking/value-objects/session-id.vo';
import { DeviceId } from '../../src/domains/tracking/value-objects/device-id.vo';
import { SiteId } from '../../src/domains/affiliate/value-objects/site-id.vo';
import { DeviceInfo } from '../../src/domains/tracking/value-objects/device-info.vo';
import { Event } from '../../src/domains/tracking/entities/event.entity';
import { Pageview } from '../../src/domains/tracking/entities/pageview.entity';

function makeSession(): Session {
  return Session.create({
    id: SessionId.of('session-test'),
    deviceId: DeviceId.of('device-test'),
    siteId: SiteId.of('site-test'),
    deviceInfo: DeviceInfo.fromUserAgent('test-ua', 1920, 1080),
  });
}

test('Session - create initializes empty state', () => {
  const session = makeSession();
  assert.equal(session.getEventCount(), 0);
  assert.equal(session.getPageviewCount(), 0);
  assert.equal(session.getEntryPage(), null);
  assert.equal(session.getExitPage(), null);
  assert.equal(session.isExpired(), false);
});

test('Session - addEvent increments count', () => {
  const session = makeSession();
  const event = Event.create({
    sessionId: session.id,
    name: 'click',
    properties: {},
  });
  session.addEvent(event);
  assert.equal(session.getEventCount(), 1);
  assert.equal(session.getEvents().length, 1);
});

test('Session - addPageview sets entry and exit', () => {
  const session = makeSession();
  const pageview = Pageview.create({
    sessionId: session.id,
    siteId: session.siteId,
    path: '/home',
    referrer: null,
    utmParameters: null,
  });
  session.addPageview(pageview);
  assert.equal(session.getEntryPage(), '/home');
  assert.equal(session.getExitPage(), '/home');
  assert.equal(session.getPageviewCount(), 1);
});

test('Session - exit page updates on subsequent pageview', () => {
  const session = makeSession();
  const p1 = Pageview.create({
    sessionId: session.id,
    siteId: session.siteId,
    path: '/home',
    referrer: null,
    utmParameters: null,
  });
  const p2 = Pageview.create({
    sessionId: session.id,
    siteId: session.siteId,
    path: '/about',
    referrer: null,
    utmParameters: null,
  });
  session.addPageview(p1);
  session.addPageview(p2);
  assert.equal(session.getEntryPage(), '/home');
  assert.equal(session.getExitPage(), '/about');
});

test('Session - rejects events on expired session', () => {
  const session = makeSession();
  session.close();
  const event = Event.create({
    sessionId: session.id,
    name: 'click',
    properties: {},
  });
  assert.throws(() => session.addEvent(event));
});

test('Session - close sets endTime and rejects re-close', () => {
  const session = makeSession();
  session.close();
  assert.equal(session.isExpired(), true);
  assert.throws(() => session.close());
});

test('Session - isExpired respects custom timeout', () => {
  const session = Session.create({
    id: SessionId.of('session-test'),
    deviceId: DeviceId.of('device-test'),
    siteId: SiteId.of('site-test'),
    deviceInfo: DeviceInfo.fromUserAgent('test-ua', 1920, 1080),
    startTime: Date.now() - 60_000,
  });
  assert.equal(session.isExpired(Infinity), false);
  assert.equal(session.isExpired(0), true);
  assert.equal(session.isExpired(30_000), true);
  assert.equal(session.isExpired(120_000), false);
});

test('Session - isActive is opposite of isExpired', () => {
  const session = makeSession();
  assert.equal(session.isActive(), !session.isExpired());
});

test('Session - getDuration calculates elapsed time', () => {
  const session = Session.create({
    id: SessionId.of('session-test'),
    deviceId: DeviceId.of('device-test'),
    siteId: SiteId.of('site-test'),
    deviceInfo: DeviceInfo.fromUserAgent('test-ua', 1920, 1080),
    startTime: Date.now() - 1000,
  });
  const duration = session.getDuration();
  assert.ok(duration >= 1000);
});

test('Session - toJSON roundtrip via fromState', () => {
  const original = makeSession();
  const event = Event.create({
    sessionId: original.id,
    name: 'test',
    properties: { a: 1 },
  });
  original.addEvent(event);

  const state = original.toJSON();
  const restored = Session.fromState(state);

  assert.equal(restored.id.toString(), original.id.toString());
  assert.equal(restored.deviceId.toString(), original.deviceId.toString());
  assert.equal(restored.getEventCount(), 1);
  assert.equal(restored.getEntryPage(), original.getEntryPage());
  assert.equal(restored.getExitPage(), original.getExitPage());
});

test('Session - DEFAULT_SESSION_TIMEOUT_MS is 30 minutes', () => {
  assert.equal(DEFAULT_SESSION_TIMEOUT_MS, 30 * 60 * 1000);
});
