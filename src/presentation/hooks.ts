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
import type { TrackingCommandResult } from '../domains/tracking/application/tracking-command.service';

export interface WebTrafficContextValue {
  readonly trackEvent: (name: string, properties?: Record<string, unknown>) => Promise<TrackingCommandResult>;
  readonly trackPageView: (path?: string) => Promise<TrackingCommandResult>;
  readonly isInitialized: boolean;
}

export function useWebTraffic(): WebTrafficContextValue {
  const context = useContext(WebTrafficContext);

  if (!context) {
    // If no context, use service directly
    return {
      trackEvent: useCallback(async (name, properties) => {
        return webTrafficService.trackEvent(name, properties);
      }, []),
      trackPageView: useCallback(async (path) => {
        return webTrafficService.trackPageView(path);
      }, []),
      isInitialized: webTrafficService.isInitialized(),
    };
  }

  return context;
}

export function useAnalytics(query: AnalyticsQuery) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);

      // Note: You'll need to initialize this with proper config
      const repo = new HTTPAnalyticsRepository({
        apiUrl: 'https://analytics.umituz.com',
        apiKey: 'your-api-key', // This should come from config
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
  }, [query]);

  return { data, loading, error };
}
