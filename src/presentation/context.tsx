/**
 * Web Traffic React Context
 * @description React context provider for web-traffic tracking
 */

import type { createContext } from 'react';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { webTrafficService, type WebTrafficConfig } from '../infrastructure/tracking/web-traffic.service';
import type { WebTrafficContextValue, TrackingCommandResult } from './hooks';

const TrackingContext = createContext<WebTrafficContextValue | null>(null);

export interface WebTrafficProviderProps {
  readonly children: ReactNode;
  readonly config: WebTrafficConfig;
}

export function WebTrafficProvider({ children, config }: WebTrafficProviderProps): React.ReactElement {
  useEffect(() => {
    webTrafficService.initialize(config);

    return () => {
      webTrafficService.destroy();
    };
  }, [config]);

  const value = useMemo<WebTrafficContextValue>(
    () => ({
      trackEvent: async (name: string, properties?: Record<string, unknown>) => {
        return webTrafficService.trackEvent(name, properties);
      },
      trackPageView: async (path?: string) => {
        return webTrafficService.trackPageView(path);
      },
      isInitialized: webTrafficService.isInitialized(),
    }),
    []
  );

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export { TrackingContext as WebTrafficContext };
