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
    throw new Error('useWebTraffic must be used within WebTrafficProvider');
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
