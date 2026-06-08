/**
 * HTTP Analytics Repository Implementation
 * @description HTTP-based implementation of IAnalyticsRepository
 */

import type {
  IAnalyticsRepository,
  AnalyticsQuery,
} from '../../domains/analytics/repositories/analytics.repository.interface';
import type { AnalyticsData } from '../../domains/analytics/entities/analytics.entity';
import { createHttpClient, HttpError, type HttpClient } from '../http-client';
import {
  HTTP_REQUEST_TIMEOUT_MS,
  HTTP_RETRY_ATTEMPTS,
} from '../../shared/config';

export interface HTTPAnalyticsConfig {
  readonly apiUrl: string;
  readonly apiKey: string;
}

export class HTTPAnalyticsRepository implements IAnalyticsRepository {
  private readonly http: HttpClient;

  constructor(config: HTTPAnalyticsConfig) {
    this.http = createHttpClient(
      config.apiUrl,
      { 'X-API-Key': config.apiKey },
      { defaultTimeoutMs: HTTP_REQUEST_TIMEOUT_MS, defaultRetries: HTTP_RETRY_ATTEMPTS },
    );
  }

  async getAnalytics(query: AnalyticsQuery): Promise<AnalyticsData | null> {
    const params = new URLSearchParams({
      start_date: query.startDate.toISOString(),
      end_date: query.endDate.toISOString(),
      ...(query.path ? { path: query.path } : {}),
    });

    try {
      return await this.http.request<AnalyticsData>(`/analytics?${params.toString()}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getPageviews(query: AnalyticsQuery): Promise<number> {
    const data = await this.getAnalytics(query);
    return data?.pageviews ?? 0;
  }

  async getSessions(query: AnalyticsQuery): Promise<number> {
    const data = await this.getAnalytics(query);
    return data?.sessions ?? 0;
  }

  async getVisitors(query: AnalyticsQuery): Promise<number> {
    const data = await this.getAnalytics(query);
    return data?.visitors ?? 0;
  }
}
