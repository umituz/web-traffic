/**
 * Test: SessionManager
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SessionManager } from '../../src/infrastructure/tracking/session-manager';
import { DeviceIdProvider } from '../../src/infrastructure/tracking/device-id.provider';
import { memoryStorage } from '../../src/shared/safe-storage';
import { LocalSessionRepository } from '../../src/infrastructure/repositories/http-event.repository.impl';
import { DeviceId } from '../../src/domains/tracking/value-objects/device-id.vo';

function makeManager() {
  const sessionRepo = new LocalSessionRepository(memoryStorage);
  const deviceIdProvider = new DeviceIdProvider(memoryStorage);
  const manager = new SessionManager(sessionRepo, () => deviceIdProvider.getOrCreate());
  return { manager, sessionRepo, deviceIdProvider };
}

test('SessionManager - initialize creates new session', async () => {
  const { manager } = makeManager();
  const session = await manager.initialize();
  assert.ok(session.id);
  assert.equal(manager.isReady(), true);
  assert.equal(manager.getCurrent()?.id.toString(), session.id.toString());
});

test('SessionManager - returns same session on repeated calls', async () => {
  const { manager } = makeManager();
  const a = await manager.initialize();
  const b = await manager.initialize();
  assert.equal(a.id.toString(), b.id.toString());
});

test('SessionManager - onSessionReady fires immediately if ready', async () => {
  const { manager } = makeManager();
  await manager.initialize();
  let received = false;
  manager.onSessionReady(() => {
    received = true;
  });
  assert.equal(received, true);
});

test('SessionManager - refresh creates new session', async () => {
  const { manager } = makeManager();
  const a = await manager.initialize();
  const b = await manager.refresh();
  assert.notEqual(a.id.toString(), b.id.toString());
});

test('SessionManager - close clears current', async () => {
  const { manager } = makeManager();
  await manager.initialize();
  await manager.close();
  assert.equal(manager.getCurrent(), null);
});

test('SessionManager - reset clears state', async () => {
  const { manager } = makeManager();
  await manager.initialize();
  manager.reset();
  assert.equal(manager.getCurrent(), null);
  assert.equal(manager.isReady(), false);
});

test('SessionManager - listener errors do not break', async () => {
  const { manager } = makeManager();
  manager.onSessionReady(() => {
    throw new Error('oops');
  });
  await manager.initialize();
});

test('DeviceIdProvider integration - same device gets same session', async () => {
  memoryStorage.removeItem('wt_device_id');
  const { manager: m1, deviceIdProvider: d1 } = makeManager();
  const sessionA = await m1.initialize();
  const storedDeviceId = memoryStorage.getItem('wt_device_id');
  assert.ok(storedDeviceId);

  const sessionB = d1.getOrCreate();
  assert.equal(sessionA.deviceId.toString(), sessionB.toString());
  assert.equal(DeviceId.of(storedDeviceId!).equals(sessionA.deviceId), true);
});
