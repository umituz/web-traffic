/**
 * Test: HttpClient
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHttpClient, HttpError, HttpTimeoutError } from '../../src/infrastructure/http-client';

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('HttpClient - request returns parsed JSON', async () => {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch;

  const client = createHttpClient('https://api.example.com');
  const result = await client.request<{ ok: boolean }>('/ping');
  assert.equal(result.ok, true);
});

test('HttpClient - throws HttpError on non-ok response', async () => {
  globalThis.fetch = (async () =>
    new Response('bad', { status: 400, statusText: 'Bad Request' })) as typeof fetch;

  const client = createHttpClient('https://api.example.com', {}, { defaultRetries: 0 });
  await assert.rejects(client.request('/x'), (err: unknown) => {
    return err instanceof HttpError && err.status === 400;
  });
});

test('HttpClient - retries on 5xx but not 4xx', async () => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    if (calls < 3) {
      return new Response('fail', { status: 503 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  const client = createHttpClient('https://api.example.com', {}, {
    defaultRetries: 3,
    defaultRetryBackoffMs: 1,
  });
  const result = await client.request<{ ok: boolean }>('/x');
  assert.equal(result.ok, true);
  assert.equal(calls, 3);
});

test('HttpClient - throws HttpTimeoutError on abort', async () => {
  globalThis.fetch = (async (_url, init) => {
    return new Promise((_, reject) => {
      const signal = (init as RequestInit).signal;
      if (signal) {
        signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }
    });
  }) as typeof fetch;

  const client = createHttpClient('https://api.example.com', {}, {
    defaultTimeoutMs: 50,
    defaultRetries: 0,
  });
  await assert.rejects(client.request('/x'), (err: unknown) => {
    return err instanceof HttpTimeoutError && err.timeoutMs === 50;
  });
});

test('HttpClient - sends default and per-request headers', async () => {
  let capturedHeaders: Record<string, string> = {};
  globalThis.fetch = (async (_url, init) => {
    capturedHeaders = init.headers as Record<string, string>;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  const client = createHttpClient('https://api.example.com', { 'X-Default': 'yes' });
  await client.request('/x', { headers: { 'X-Custom': '1' } });
  assert.equal(capturedHeaders['X-Default'], 'yes');
  assert.equal(capturedHeaders['X-Custom'], '1');
});

test('HttpClient - serializes body as JSON', async () => {
  let capturedBody: string | undefined;
  globalThis.fetch = (async (_url, init) => {
    capturedBody = init.body as string;
    return new Response('{}', { status: 200 });
  }) as typeof fetch;

  const client = createHttpClient('https://api.example.com');
  await client.request('/x', { method: 'POST', body: { hello: 'world' } });
  assert.equal(capturedBody, JSON.stringify({ hello: 'world' }));
});
