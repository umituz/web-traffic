/**
 * Web Traffic Service
 * @description Main service for web-traffic (Facade pattern)
 */

import { EventId } from '../domains/tracking/value-objects/event-id.vo';
import { SessionId } from '../domains/tracking/value-objects/session-id.vo';
import { SiteId } from '../domains/affiliate/value-objects/site-id.vo';
import { DeviceInfo } from '../domains/tracking/value-objects/device-info.vo';
import { Session } from '../domains/tracking/aggregates/session.aggregate';
import type { Event, Pageview } from '../domains/tracking/entities';
import type { TrackingCommandResult } from '../domains/tracking/application/tracking-command.service';
import { TrackingCommandService } from '../domains/tracking/application/tracking-command.service';
import {
  HTTPEventRepository,
  HTTPPageviewRepository,
  LocalSessionRepository,
} from './repositories/http-event.repository.impl';
import { HTTPAnalyticsRepository } from './analytics/http-analytics.repository.impl';

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

  initialize(config: WebTrafficConfig): void {
    if (this.initialized) {
      console.warn('WebTrafficService already initialized');
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

    // Get or create session
    this.initializeSession();

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
    const existingSession = await this.sessionRepo.findActive(deviceId);

    if (existingSession) {
      this.currentSession = existingSession;
    } else {
      const sessionId = SessionId.generate();
      this.currentSession = new Session({
        id: sessionId,
        deviceId,
      });
      await this.sessionRepo.save(this.currentSession);
    }
  }

  private getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') return '';

    let deviceId = localStorage.getItem('wt_device_id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('wt_device_id', deviceId);
    }

    return deviceId;
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
    this.trackPageView();

    // Track SPA navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackPageView();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.trackPageView();
    };

    window.addEventListener('popstate', () => {
      this.trackPageView();
    });
  }

  destroy(): void {
    this.eventRepo?.destroy();
    this.initialized = false;
  }
}

export const webTrafficService = new WebTrafficService();
