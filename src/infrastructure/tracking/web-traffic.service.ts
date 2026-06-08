/**
 * Web Traffic Service
 * @description Facade coordinating tracking collaborators
 */

import { TrackingCommandService, type TrackingCommandResult } from '../../domains/tracking/application/tracking-command.service';
import {
  HTTPEventRepository,
  HTTPPageviewRepository,
  LocalSessionRepository,
  type HTTPRepositoryConfig,
} from '../repositories/http-event.repository.impl';
import { HTTPAnalyticsRepository, type HTTPAnalyticsConfig } from '../analytics/http-analytics.repository.impl';
import { DeviceIdProvider } from './device-id.provider';
import { UtmExtractor } from './utm-extractor';
import { AutoTracker } from './auto-tracker';
import { SessionManager } from './session-manager';
import { TypedEventEmitter } from '../../domains/shared/event-emitter';
import type { WebTrafficEventMap } from '../../domains/events';
import type { Unsubscribe } from '../../domains/shared/event-emitter';
import {
  SessionStartedEvent,
  SessionClosedEvent,
} from '../../domains/tracking/events/tracking.events';
import { DEFAULT_ANALYTICS_API_URL } from '../../shared/config';

export type { HTTPRepositoryConfig, HTTPAnalyticsConfig, TrackingCommandResult };

export interface WebTrafficConfig {
  readonly apiKey: string;
  readonly apiUrl?: string;
  readonly autoTrack?: boolean;
  readonly sessionTimeoutMs?: number;
}

export class WebTrafficService {
  private eventRepo: HTTPEventRepository | null = null;
  private pageviewRepo: HTTPPageviewRepository | null = null;
  private sessionRepo: LocalSessionRepository | null = null;
  private analyticsRepo: HTTPAnalyticsRepository | null = null;
  private commandService: TrackingCommandService | null = null;
  private sessionManager: SessionManager | null = null;
  private deviceIdProvider: DeviceIdProvider | null = null;
  private utmExtractor: UtmExtractor | null = null;
  private autoTracker: AutoTracker | null = null;
  private config: WebTrafficConfig | null = null;
  private sessionUnsubscribe: Unsubscribe | null = null;
  private readonly emitter = new TypedEventEmitter<WebTrafficEventMap>();

  on = this.emitter.on.bind(this.emitter);
  once = this.emitter.once.bind(this.emitter);

  initialize(config: WebTrafficConfig): void {
    if (this.config) {
      return;
    }
    this.config = config;

    const apiUrl = config.apiUrl ?? DEFAULT_ANALYTICS_API_URL;
    const repoConfig: HTTPRepositoryConfig = { apiUrl, apiKey: config.apiKey };

    this.eventRepo = new HTTPEventRepository(repoConfig);
    this.pageviewRepo = new HTTPPageviewRepository(this.eventRepo);
    this.sessionRepo = new LocalSessionRepository();

    this.deviceIdProvider = new DeviceIdProvider();
    this.sessionManager = new SessionManager(
      this.sessionRepo,
      () => this.deviceIdProvider!.getOrCreate(),
    );

    this.commandService = new TrackingCommandService(
      this.sessionRepo,
      this.eventRepo,
      this.pageviewRepo,
    );

    this.utmExtractor = new UtmExtractor();
    this.analyticsRepo = new HTTPAnalyticsRepository(repoConfig);

    this.autoTracker = new AutoTracker((path) => {
      void this.trackPageView(path);
    });

    this.sessionUnsubscribe = this.sessionManager.onSessionReady((session) => {
      const isResumed = this.eventRepo!.getQueueSize() > 0;
      this.emitter.emit(
        'session.started',
        new SessionStartedEvent({
          sessionId: session.id.toString(),
          deviceId: session.deviceId.toString(),
          isResumed,
        }),
      );

      if (this.config?.autoTrack && this.autoTracker) {
        this.autoTracker.triggerInitial();
      }
    });

    void this.sessionManager.initialize();
  }

  isInitialized(): boolean {
    return this.config !== null;
  }

  getAnalyticsRepository(): HTTPAnalyticsRepository {
    this.assertInitialized();
    return this.analyticsRepo!;
  }

  getCommandService(): TrackingCommandService {
    this.assertInitialized();
    return this.commandService!;
  }

  getSessionManager(): SessionManager {
    this.assertInitialized();
    return this.sessionManager!;
  }

  async trackEvent(
    name: string,
    properties: Record<string, unknown> = {},
  ): Promise<TrackingCommandResult> {
    if (!this.commandService || !this.sessionManager) {
      return { success: false, error: 'Service not initialized' };
    }

    const session = this.sessionManager.getCurrent();
    if (!session) {
      return { success: false, error: 'Session not ready' };
    }

    return this.commandService.trackEvent(session.id, name, properties);
  }

  async trackPageView(path?: string): Promise<TrackingCommandResult> {
    if (!this.commandService || !this.sessionManager) {
      return { success: false, error: 'Service not initialized' };
    }

    const session = this.sessionManager.getCurrent();
    if (!session) {
      return { success: false, error: 'Session not ready' };
    }

    const resolvedPath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
    const referrer = typeof window !== 'undefined' ? document.referrer || null : null;
    const utm = this.utmExtractor?.fromCurrentUrl()?.toJSON() ?? undefined;

    return this.commandService.trackPageview(session.id, resolvedPath, referrer, utm);
  }

  destroy(): void {
    const session = this.sessionManager?.getCurrent();
    if (session) {
      this.emitter.emit(
        'session.closed',
        new SessionClosedEvent({
          sessionId: session.id.toString(),
          durationMs: session.getDuration(),
        }),
      );
    }

    this.sessionUnsubscribe?.();
    this.sessionUnsubscribe = null;
    this.autoTracker?.stop();
    this.eventRepo?.destroy();
    this.sessionManager?.reset();

    this.config = null;
    this.eventRepo = null;
    this.pageviewRepo = null;
    this.sessionRepo = null;
    this.analyticsRepo = null;
    this.commandService = null;
    this.sessionManager = null;
    this.deviceIdProvider = null;
    this.utmExtractor = null;
    this.autoTracker = null;
    this.emitter.removeAllListeners();
  }

  private assertInitialized(): void {
    if (!this.config) {
      throw new Error('WebTrafficService is not initialized');
    }
  }
}

export const webTrafficService = new WebTrafficService();
