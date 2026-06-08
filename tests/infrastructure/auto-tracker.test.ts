/**
 * Test: AutoTracker
 * @description Skipped in non-DOM environments (Node test runner)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AutoTracker } from '../../src/infrastructure/tracking/auto-tracker';

const SKIP_REASON = 'AutoTracker requires browser environment (window/history)';

test('AutoTracker - listener receives current path on triggerInitial', { skip: typeof window === 'undefined' ? SKIP_REASON : false }, () => {
  let received: string | null = null;
  const tracker = new AutoTracker((path) => {
    received = path;
  });
  tracker.triggerInitial();
  assert.equal(received, window.location.pathname);
  tracker.stop();
});

test('AutoTracker - stop is idempotent', () => {
  const tracker = new AutoTracker(() => {});
  tracker.stop();
  tracker.stop();
  assert.ok(true);
});

test('AutoTracker - start wraps history methods', { skip: typeof window === 'undefined' ? SKIP_REASON : false }, () => {
  const originalPush = history.pushState;
  const tracker = new AutoTracker(() => {});
  tracker.start();
  assert.notEqual(history.pushState, originalPush);
  tracker.stop();
});

test('AutoTracker - stop restores history methods', { skip: typeof window === 'undefined' ? SKIP_REASON : false }, () => {
  const originalPush = history.pushState;
  const originalReplace = history.replaceState;
  const tracker = new AutoTracker(() => {});
  tracker.start();
  tracker.stop();
  assert.equal(history.pushState, originalPush);
  assert.equal(history.replaceState, originalReplace);
});

test('AutoTracker - wrapped pushState triggers listener', { skip: typeof window === 'undefined' ? SKIP_REASON : false }, () => {
  let received: string | null = null;
  const tracker = new AutoTracker((path) => {
    received = path;
  });
  tracker.start();
  history.pushState({}, '', '/test-path');
  assert.equal(received, '/test-path');
  tracker.stop();
});
