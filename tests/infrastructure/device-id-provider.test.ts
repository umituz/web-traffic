/**
 * Test: DeviceIdProvider
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DeviceIdProvider } from '../../src/infrastructure/tracking/device-id.provider';
import { memoryStorage } from '../../src/shared/safe-storage';

test('DeviceIdProvider - generates new id on first call', () => {
  const provider = new DeviceIdProvider(memoryStorage);
  const id = provider.getOrCreate();
  assert.ok(id.toString().startsWith('device-'));
});

test('DeviceIdProvider - returns same id on subsequent calls', () => {
  const provider = new DeviceIdProvider(memoryStorage);
  const first = provider.getOrCreate();
  const second = provider.getOrCreate();
  assert.equal(first.toString(), second.toString());
});

test('DeviceIdProvider - recovers from corrupted storage', () => {
  memoryStorage.setItem('wt_device_id', 'corrupted');
  const provider = new DeviceIdProvider(memoryStorage);
  const id = provider.getOrCreate();
  assert.ok(id.toString().startsWith('device-'));
});
