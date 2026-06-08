/**
 * Web Traffic React Context
 * @description React context provider for web-traffic tracking
 */

import React, { createContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { ReactElement } from 'react';
import { WebTrafficService, type WebTrafficConfig } from '../infrastructure/tracking/web-traffic.service';
import type { WebTrafficContextValue } from './hooks';

export const WebTrafficContext = createContext<WebTrafficContextValue | null>(null);

const defaultService = new WebTrafficService();

export interface WebTrafficProviderProps {
  readonly children: ReactNode;
  readonly config: WebTrafficConfig;
  readonly service?: WebTrafficService;
}

export function WebTrafficProvider({ children, config, service = defaultService }: WebTrafficProviderProps): ReactElement {
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    service.initialize(configRef.current);
    return () => {
      service.destroy();
    };
  }, [service]);

  const value = useMemo<WebTrafficContextValue>(
    () => ({
      trackEvent: (name, properties) => service.trackEvent(name, properties),
      trackPageView: (path) => service.trackPageView(path),
      isInitialized: service.isInitialized(),
      config,
    }),
    [service, config],
  );

  return <WebTrafficContext.Provider value={value}>{children}</WebTrafficContext.Provider>;
}
