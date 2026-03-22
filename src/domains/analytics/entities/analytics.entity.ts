/**
 * Analytics Entity
 * @description Represents aggregated analytics data
 */

export interface AnalyticsData {
  readonly pageviews: number;
  readonly sessions: number;
  readonly visitors: number;
  readonly bounceRate: number;
  readonly avgSessionDuration: number;
  readonly topPages: TopPage[];
  readonly topSources: TopSource[];
  readonly conversions: ConversionStats;
}

export interface TopPage {
  readonly path: string;
  readonly pageviews: number;
  readonly uniqueVisitors: number;
}

export interface TopSource {
  readonly source: string;
  readonly sessions: number;
  readonly percentage: number;
}

export interface ConversionStats {
  readonly total: number;
  readonly revenue: number;
  readonly rate: number;
}
