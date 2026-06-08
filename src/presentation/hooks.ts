/**
 * Web Traffic React Hooks
 * @description React hooks for web-traffic tracking
 */

import { useContext, useEffect, useMemo, useState } from 'react';
import { WebTrafficContext } from './context';
import type { WebTrafficConfig } from '../infrastructure/tracking/web-traffic.service';
import type { AnalyticsQuery } from '../domains/analytics/repositories/analytics.repository.interface';
import type { AnalyticsData } from '../domains/analytics/entities/analytics.entity';
import type { TrackingCommandResult } from '../domains/tracking/application/tracking-command.service';

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

export interface UseAnalyticsResult {
  readonly data: AnalyticsData | null;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly refetch: () => void;
}

export function useAnalytics(query: AnalyticsQuery): UseAnalyticsResult {
  const { config, isInitialized } = useWebTraffic();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const stableQuery = useMemo(
    () => ({
      startDate: query.startDate,
      endDate: query.endDate,
      path: query.path,
    }),
    [query.startDate.getTime(), query.endDate.getTime(), query.path],
  );

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const { webTrafficService } = await import('../infrastructure/tracking/web-traffic.service');
        const repo = webTrafficService.getAnalyticsRepository();
        const result = await repo.getAnalytics(stableQuery);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchAnalytics();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isInitialized, config, stableQuery, reloadToken]);

  return {
    data,
    loading,
    error,
    refetch: () => setReloadToken((token) => token + 1),
  };
}
