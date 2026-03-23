/**
 * Web Traffic React Context
 * @description React context provider for web-traffic tracking
 */

import React, { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { webTrafficService, type WebTrafficConfig } from '../infrastructure/tracking/web-traffic.service';
import type { WebTrafficContextValue } from './hooks';
import type { TrackingCommandResult } from '../domains/tracking/application/tracking-command.service';

const WebTrafficContext = createContext<WebTrafficContextValue | null>(null);

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
      trackEvent: (name: string, properties?: Record<string, unknown>) => {
        return webTrafficService.trackEvent(name, properties);
      },
      trackPageView: (path?: string) => {
        return webTrafficService.trackPageView(path);
      },
      isInitialized: webTrafficService.isInitialized(),
      config,
    }),
    [config]
  );

  return <WebTrafficContext.Provider value={value}>{children}</WebTrafficContext.Provider>;
}

export { WebTrafficContext };
