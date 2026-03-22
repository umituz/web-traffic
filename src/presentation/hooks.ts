/**
 * Web Traffic React Hooks
 * @description React hooks for web-traffic tracking
 */

import { useContext, useCallback, useEffect, useState } from 'react';
import { WebTrafficContext } from './context';
import { webTrafficService } from '../infrastructure/tracking/web-traffic.service';
import { HTTPAnalyticsRepository } from '../infrastructure/analytics/http-analytics.repository.impl';
import type { AnalyticsQuery } from '../domains/analytics/repositories/analytics.repository.interface';
import type { AnalyticsData } from '../domains/analytics/entities/analytics.entity';

export interface TrackingCommandResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

import type { WebTrafficConfig } from '../infrastructure/tracking/web-traffic.service';

export interface WebTrafficContextValue {
  readonly trackEvent: (name: string, properties?: Record<string, unknown>) => Promise<TrackingCommandResult>;
  readonly trackPageView: (path?: string) => Promise<TrackingCommandResult>;
  readonly isInitialized: boolean;
  readonly config: WebTrafficConfig;
}

export function useWebTraffic(): WebTrafficContextValue {
  const context = useContext(WebTrafficContext);

  if (!context) {
    // If no context, use service directly
    return {
      trackEvent: useCallback(async (name: string, properties?: Record<string, unknown>) => {
        return webTrafficService.trackEvent(name, properties);
      }, []),
      trackPageView: useCallback(async (path?: string) => {
        return webTrafficService.trackPageView(path);
      }, []),
      isInitialized: webTrafficService.isInitialized(),
      config: { apiKey: '' }, // Fallback - context should always be used
    };
  }

  return context;
}

export function useAnalytics(query: AnalyticsQuery) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { config } = useWebTraffic();

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);

      const repo = new HTTPAnalyticsRepository({
        apiUrl: config.apiUrl ?? 'https://analytics.umituz.com',
        apiKey: config.apiKey,
      });

      const result = await repo.getAnalytics(query);

      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    }

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, [query, config]);

  return { data, loading, error };
}
