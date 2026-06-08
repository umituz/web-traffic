/**
 * Test: DeviceInfo Value Object
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DeviceInfo } from '../../src/domains/tracking/value-objects/device-info.vo';

test('DeviceInfo - detects Chrome on Windows', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const info = DeviceInfo.fromUserAgent(ua, 1920, 1080);
  assert.equal(info.getBrowser().name, 'Chrome');
  assert.equal(info.getOS().name, 'Windows');
  assert.equal(info.getDeviceType(), 'desktop');
  assert.equal(info.getScreenSize().width, 1920);
  assert.equal(info.getScreenSize().height, 1080);
});

test('DeviceInfo - detects Safari on iOS', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const info = DeviceInfo.fromUserAgent(ua, 375, 812);
  assert.equal(info.getBrowser().name, 'Safari');
  assert.equal(info.getOS().name, 'iOS');
  assert.equal(info.getDeviceType(), 'mobile');
  assert.ok(info.isMobile());
});

test('DeviceInfo - detects iPad as tablet', () => {
  const ua = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const info = DeviceInfo.fromUserAgent(ua, 1024, 768);
  assert.equal(info.getDeviceType(), 'tablet');
  assert.ok(info.isTablet());
});

test('DeviceInfo - detects Edge', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91';
  const info = DeviceInfo.fromUserAgent(ua, 1920, 1080);
  assert.equal(info.getBrowser().name, 'Edge');
});

test('DeviceInfo - unknown UA returns null names', () => {
  const info = DeviceInfo.fromUserAgent('', 1920, 1080);
  assert.equal(info.getBrowser().name, null);
  assert.equal(info.getOS().name, null);
  assert.equal(info.getDeviceType(), 'desktop');
});

test('DeviceInfo - screen-based detection when UA missing mobile marker', () => {
  const ua = 'Some Unknown Browser';
  const info = DeviceInfo.fromUserAgent(ua, 500, 800);
  assert.equal(info.getDeviceType(), 'mobile');
});
