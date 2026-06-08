/**
 * HTTP Client
 * @description Centralized fetch wrapper with timeout, retry, and typed responses
 */

import { sleep } from '../shared/async';
import { calculateExponentialBackoff } from '../shared/calculations';
import {
  HTTP_REQUEST_TIMEOUT_MS,
  HTTP_RETRY_ATTEMPTS,
  HTTP_RETRY_BASE_DELAY_MS,
} from '../shared/config';

export interface HttpRequestOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
  readonly timeoutMs?: number;
  readonly retries?: number;
  readonly retryBackoffMs?: number;
  readonly signal?: AbortSignal;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(`HTTP ${status} ${statusText}: ${body}`);
    this.name = 'HttpError';
  }
}

export class HttpTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'HttpTimeoutError';
  }
}

export interface HttpClient {
  request<T>(path: string, options?: HttpRequestOptions): Promise<T>;
}

export interface HttpClientConfig {
  readonly defaultTimeoutMs?: number;
  readonly defaultRetries?: number;
  readonly defaultRetryBackoffMs?: number;
}

export function createHttpClient(
  baseUrl: string,
  defaultHeaders: Readonly<Record<string, string>> = {},
  config: HttpClientConfig = {},
): HttpClient {
  const defaultTimeout = config.defaultTimeoutMs ?? HTTP_REQUEST_TIMEOUT_MS;
  const defaultRetries = config.defaultRetries ?? HTTP_RETRY_ATTEMPTS;
  const defaultBackoff = config.defaultRetryBackoffMs ?? HTTP_RETRY_BASE_DELAY_MS;

  return {
    async request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
      const url = `${baseUrl}${path}`;
      const method = options.method ?? 'GET';
      const timeoutMs = options.timeoutMs ?? defaultTimeout;
      const retries = options.retries ?? defaultRetries;
      const backoff = options.retryBackoffMs ?? defaultBackoff;
      const maxAttempts = retries + 1;

      let lastError: unknown = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (attempt > 0) {
          await sleep(calculateExponentialBackoff(attempt - 1, backoff));
        }

        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

        const externalSignal = options.signal;
        if (externalSignal) {
          if (externalSignal.aborted) {
            clearTimeout(timeoutHandle);
            throw new DOMException('Aborted', 'AbortError');
          }
          externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
        }

        try {
          const init: RequestInit = {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...defaultHeaders,
              ...options.headers,
            },
            signal: controller.signal,
            ...(options.body !== undefined && { body: JSON.stringify(options.body) }),
          };

          const response = await fetch(url, init);
          clearTimeout(timeoutHandle);

          if (!response.ok) {
            const body = await response.text();
            throw new HttpError(response.status, response.statusText, body);
          }

          if (response.status === 204) {
            return undefined as T;
          }

          return (await response.json()) as T;
        } catch (error) {
          clearTimeout(timeoutHandle);

          if (error instanceof DOMException && error.name === 'AbortError') {
            lastError = new HttpTimeoutError(timeoutMs);
          } else {
            lastError = error;
          }

          if (error instanceof HttpError && !isRetryableStatus(error.status)) {
            throw error;
          }
        }
      }

      throw lastError instanceof Error ? lastError : new Error('HTTP request failed');
    },
  };
}

function isRetryableStatus(status: number): boolean {
  return status >= RETRYABLE_MIN && status < RETRYABLE_MAX;
}

const RETRYABLE_MIN = 500;
const RETRYABLE_MAX = 600;
