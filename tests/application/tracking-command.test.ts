/**
 * Test: TrackingCommandService
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TrackingCommandService,
  SessionNotFoundError,
} from '../../src/domains/tracking/application/tracking-command.service';
import type {
  ISessionRepository,
  IEventRepository,
  IPageviewRepository,
  TrackableEvent,
} from '../../src/domains/tracking/repositories/event.repository.interface';
import { Session } from '../../src/domains/tracking/aggregates/session.aggregate';
import { SessionId } from '../../src/domains/tracking/value-objects/session-id.vo';
import { DeviceId } from '../../src/domains/tracking/value-objects/device-id.vo';
import { SiteId } from '../../src/domains/affiliate/value-objects/site-id.vo';
import { DeviceInfo } from '../../src/domains/tracking/value-objects/device-info.vo';
import { EventId } from '../../src/domains/tracking/value-objects/event-id.vo';
import type { Event } from '../../src/domains/tracking/entities/event.entity';
import type { Pageview } from '../../src/domains/tracking/entities/pageview.entity';

class InMemorySessionRepo implements ISessionRepository {
  private sessions = new Map<string, Session>();

  async save(session: Session): Promise<void> {
    this.sessions.set(session.id.toString(), session);
  }
  async findById(id: SessionId): Promise<Session | null> {
    return this.sessions.get(id.toString()) ?? null;
  }
  async findActive(): Promise<Session | null> {
    return null;
  }
  async delete(id: SessionId): Promise<void> {
    this.sessions.delete(id.toString());
  }
}

class InMemoryEventRepo implements IEventRepository {
  public events: TrackableEvent[] = [];
  async save(event: TrackableEvent): Promise<void> {
    this.events.push(event);
  }
  async findById(): Promise<Event | null> {
    return null;
  }
  async findBySessionId(): Promise<ReadonlyArray<Event>> {
    return [];
  }
  async delete(_id: EventId): Promise<void> {}
}

class InMemoryPageviewRepo implements IPageviewRepository {
  public pageviews: Pageview[] = [];
  async save(pageview: Pageview): Promise<void> {
    this.pageviews.push(pageview);
  }
  async findById(): Promise<Pageview | null> {
    return null;
  }
  async findBySessionId(): Promise<ReadonlyArray<Pageview>> {
    return [];
  }
  async delete(_id: EventId): Promise<void> {}
}

function makeService() {
  const sessionRepo = new InMemorySessionRepo();
  const eventRepo = new InMemoryEventRepo();
  const pageviewRepo = new InMemoryPageviewRepo();
  const service = new TrackingCommandService(sessionRepo, eventRepo, pageviewRepo);
  return { service, sessionRepo, eventRepo, pageviewRepo };
}

async function seedSession(repo: ISessionRepository): Promise<Session> {
  const session = Session.create({
    id: SessionId.of('session-1'),
    deviceId: DeviceId.of('device-1'),
    siteId: SiteId.of('site-1'),
    deviceInfo: DeviceInfo.fromUserAgent('test', 1920, 1080),
  });
  await repo.save(session);
  return session;
}

test('TrackingCommandService - trackEvent persists and emits', async () => {
  const { service, sessionRepo, eventRepo } = makeService();
  const session = await seedSession(sessionRepo);

  const events: string[] = [];
  service.on('event.tracked', (e) => events.push(e.payload.name));

  const result = await service.trackEvent(session.id, 'click', { button: 'submit' });
  assert.equal(result.success, true);
  assert.equal(eventRepo.events.length, 1);
  assert.deepEqual(events, ['click']);
});

test('TrackingCommandService - trackEvent fails on missing session', async () => {
  const { service } = makeService();
  const result = await service.trackEvent(SessionId.of('session-missing'), 'click');
  assert.equal(result.success, false);
  assert.match(result.error!, /Session not found/);
});

test('TrackingCommandService - trackPageview persists and emits', async () => {
  const { service, sessionRepo, pageviewRepo } = makeService();
  const session = await seedSession(sessionRepo);

  const paths: string[] = [];
  service.on('pageview.tracked', (e) => paths.push(e.payload.path));

  const result = await service.trackPageview(session.id, '/home', 'https://google.com');
  assert.equal(result.success, true);
  assert.equal(pageviewRepo.pageviews.length, 1);
  assert.deepEqual(paths, ['/home']);
});

test('TrackingCommandService - tracks UTM in pageview event', async () => {
  const { service, sessionRepo } = makeService();
  const session = await seedSession(sessionRepo);

  let utmSource: string | undefined;
  service.on('pageview.tracked', (e) => {
    utmSource = e.payload.utmSource;
  });

  await service.trackPageview(session.id, '/landing', null, { source: 'google', medium: 'cpc' });
  assert.equal(utmSource, 'google');
});

test('TrackingCommandService - errors are emitted as tracking.error', async () => {
  const { service } = makeService();
  let errorEmitted = false;
  service.on('tracking.error', () => {
    errorEmitted = true;
  });
  await service.trackEvent(SessionId.of('session-missing'), 'x');
  assert.equal(errorEmitted, true);
});

test('SessionNotFoundError - has correct name and sessionId', () => {
  const err = new SessionNotFoundError('session-x');
  assert.equal(err.name, 'SessionNotFoundError');
  assert.equal(err.sessionId, 'session-x');
});
