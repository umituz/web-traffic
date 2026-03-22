/**
 * Analytics Repository Interface
 * @description Repository interface for Analytics queries (Domain Layer)
 */

import type { AnalyticsData } from '../entities/analytics.entity';

export interface AnalyticsQuery {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly path?: string;
}

export interface IAnalyticsRepository {
  getAnalytics(query: AnalyticsQuery): Promise<AnalyticsData | null>;
  getPageviews(query: AnalyticsQuery): Promise<number>;
  getSessions(query: AnalyticsQuery): Promise<number>;
  getVisitors(query: AnalyticsQuery): Promise<number>;
}
