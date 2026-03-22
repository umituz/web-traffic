/**
 * HTTP Analytics Repository Implementation
 * @description HTTP-based implementation of IAnalyticsRepository
 */

import type {
  IAnalyticsRepository,
  AnalyticsQuery,
} from '../../domains/analytics/repositories/analytics.repository.interface';
import type { AnalyticsData } from '../../domains/analytics/entities/analytics.entity';

export interface HTTPAnalyticsConfig {
  readonly apiUrl: string;
  readonly apiKey: string;
}

export class HTTPAnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly config: HTTPAnalyticsConfig) {}

  async getAnalytics(query: AnalyticsQuery): Promise<AnalyticsData | null> {
    try {
      const params = new URLSearchParams({
        start_date: query.startDate.toISOString(),
        end_date: query.endDate.toISOString(),
        ...(query.path && { path: query.path }),
      });

      const response = await fetch(`${this.config.apiUrl}/analytics?${params}`, {
        headers: {
          'X-API-Key': this.config.apiKey,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      return null;
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
