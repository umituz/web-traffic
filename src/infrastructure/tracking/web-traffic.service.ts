/**
 * Web Traffic Service
 * @description Main service for web-traffic (Facade pattern)
 */

import { EventId } from '../../domains/tracking/value-objects/event-id.vo';
import { SessionId } from '../../domains/tracking/value-objects/session-id.vo';
import { SiteId } from '../../domains/affiliate/value-objects/site-id.vo';
import { DeviceInfo } from '../../domains/tracking/value-objects/device-info.vo';
import { Session } from '../../domains/tracking/aggregates/session.aggregate';
import type { Event } from '../../domains/tracking/entities/event.entity';
import type { Pageview } from '../../domains/tracking/entities/pageview.entity';
import type { TrackingCommandResult } from '../../domains/tracking/application/tracking-command.service';
import { TrackingCommandService } from '../../domains/tracking/application/tracking-command.service';
import {
  HTTPEventRepository,
  HTTPPageviewRepository,
  LocalSessionRepository,
} from '../repositories/http-event.repository.impl';
import { HTTPAnalyticsRepository } from '../analytics/http-analytics.repository.impl';

export interface WebTrafficConfig {
  readonly apiKey: string;
  readonly apiUrl?: string;
  readonly autoTrack?: boolean;
}

class WebTrafficService {
  private initialized = false;
  private commandService: TrackingCommandService | null = null;
  private currentSession: Session | null = null;
  private eventRepo: HTTPEventRepository | null = null;
  private pageviewRepo: HTTPPageviewRepository | null = null;
  private sessionRepo: LocalSessionRepository | null = null;
  private originalPushState: typeof history.pushState | null = null;
  private originalReplaceState: typeof history.replaceState | null = null;
  private popStateHandler: (() => void) | null = null;

  initialize(config: WebTrafficConfig): void {
    if (this.initialized) {
      return;
    }

    const apiUrl = config.apiUrl ?? 'https://analytics.umituz.com';

    // Initialize repositories
    this.eventRepo = new HTTPEventRepository({ apiUrl, apiKey: config.apiKey });
    this.pageviewRepo = new HTTPPageviewRepository({ apiUrl, apiKey: config.apiKey });
    this.sessionRepo = new LocalSessionRepository();

    // Initialize command service
    this.commandService = new TrackingCommandService(
      this.sessionRepo,
      this.eventRepo,
      this.pageviewRepo
    );

    // Get or create session - this is async but we don't await it
    // The service will return "not initialized" errors if called before session is ready
    void this.initializeSession();

    // Setup auto-tracking if enabled
    if (config.autoTrack && typeof window !== 'undefined') {
      this.setupAutoTrack();
    }

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async trackEvent(
    name: string,
    properties: Record<string, unknown> = {}
  ): Promise<TrackingCommandResult> {
    if (!this.commandService || !this.currentSession) {
      return { success: false, error: 'Service not initialized' };
    }

    return this.commandService.trackEvent(
      this.currentSession.id.toString(),
      name,
      properties
    );
  }

  async trackPageView(path?: string): Promise<TrackingCommandResult> {
    if (!this.commandService || !this.currentSession) {
      return { success: false, error: 'Service not initialized' };
    }

    const currentPath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
    const referrer = typeof window !== 'undefined' ? document.referrer : null;

    return this.commandService.trackPageview(
      this.currentSession.id.toString(),
      currentPath,
      referrer,
      this.getUTMFromURL()
    );
  }

  private async initializeSession(): Promise<void> {
    if (!this.sessionRepo) return;

    const deviceId = this.getOrCreateDeviceId();
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    const existingSession = await this.sessionRepo.findActive(deviceId, SESSION_TIMEOUT_MS);

    if (existingSession) {
      this.currentSession = existingSession;
    } else {
      const sessionId = SessionId.generate();
      const siteId = SiteId.generate();
      const deviceInfo = DeviceInfo.fromUserAgent(
        typeof window !== 'undefined' ? navigator.userAgent : '',
        typeof window !== 'undefined' ? window.screen.width : undefined
      );

      this.currentSession = new Session({
        id: sessionId,
        deviceId,
        siteId,
        deviceInfo,
      });
      await this.sessionRepo.save(this.currentSession);
    }
  }

  private getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') return '';

    try {
      let deviceId = localStorage.getItem('wt_device_id');
      if (!deviceId) {
        const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        deviceId = `device-${uniqueId}`;
        localStorage.setItem('wt_device_id', deviceId);
      }
      return deviceId;
    } catch {
      // Storage unavailable - generate temporary device ID
      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      return `device-${uniqueId}`;
    }
  }

  private getUTMFromURL() {
    if (typeof window === 'undefined') return undefined;

    const searchParams = new URLSearchParams(window.location.search);
    const source = searchParams.get('utm_source') || undefined;
    const medium = searchParams.get('utm_medium') || undefined;
    const campaign = searchParams.get('utm_campaign') || undefined;
    const term = searchParams.get('utm_term') || undefined;
    const content = searchParams.get('utm_content') || undefined;

    if (!source && !medium && !campaign && !term && !content) {
      return undefined;
    }

    return { source, medium, campaign, term, content };
  }

  private setupAutoTrack(): void {
    if (typeof window === 'undefined') return;

    // Track initial pageview
    void this.trackPageView();

    // Track SPA navigation
    this.originalPushState = history.pushState;
    this.originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      this.originalPushState!.apply(history, args);
      void this.trackPageView();
    };

    history.replaceState = (...args) => {
      this.originalReplaceState!.apply(history, args);
      void this.trackPageView();
    };

    this.popStateHandler = () => {
      void this.trackPageView();
    };
    window.addEventListener('popstate', this.popStateHandler);
  }

  destroy(): void {
    // Restore original history methods
    if (this.originalPushState && typeof history !== 'undefined') {
      history.pushState = this.originalPushState;
      this.originalPushState = null;
    }
    if (this.originalReplaceState && typeof history !== 'undefined') {
      history.replaceState = this.originalReplaceState;
      this.originalReplaceState = null;
    }

    // Remove popstate event listener
    if (this.popStateHandler && typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.popStateHandler);
      this.popStateHandler = null;
    }

    this.eventRepo?.destroy();
    this.initialized = false;
    this.commandService = null;
    this.currentSession = null;
    this.eventRepo = null;
    this.pageviewRepo = null;
    this.sessionRepo = null;
  }
}

export const webTrafficService = new WebTrafficService();
