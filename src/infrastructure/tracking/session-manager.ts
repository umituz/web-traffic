/**
 * Session Manager
 * @description Single responsibility: session lifecycle with safe async loading
 */

import { Session } from '../../domains/tracking/aggregates/session.aggregate';
import { SESSION_INACTIVITY_TIMEOUT_MS } from '../../shared/config';
import { SessionId } from '../../domains/tracking/value-objects/session-id.vo';
import { SiteId } from '../../domains/affiliate/value-objects/site-id.vo';
import { DeviceInfo } from '../../domains/tracking/value-objects/device-info.vo';
import { DeviceId } from '../../domains/tracking/value-objects/device-id.vo';
import type { ISessionRepository } from '../../domains/tracking/repositories/event.repository.interface';

export type SessionListener = (session: Session) => void;
export type Unsubscribe = () => void;

export class SessionManager {
  private currentSession: Session | null = null;
  private initializationPromise: Promise<Session> | null = null;
  private readonly listeners = new Set<SessionListener>();

  constructor(
    private readonly sessionRepo: ISessionRepository,
    private readonly deviceIdProvider: () => DeviceId,
  ) {}

  getCurrent(): Session | null {
    return this.currentSession;
  }

  isReady(): boolean {
    return this.currentSession !== null;
  }

  onSessionReady(listener: SessionListener): Unsubscribe {
    this.listeners.add(listener);
    if (this.currentSession) {
      this.notifySingleListener(listener);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  async initialize(): Promise<Session> {
    if (this.currentSession) {
      return this.currentSession;
    }
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.loadOrCreate();
    try {
      const session = await this.initializationPromise;
      this.currentSession = session;
      this.notifyAllListeners(session);
      return session;
    } finally {
      this.initializationPromise = null;
    }
  }

  async refresh(): Promise<Session> {
    if (this.currentSession) {
      await this.sessionRepo.delete(this.currentSession.id);
    }
    this.currentSession = null;
    return this.initialize();
  }

  async close(): Promise<void> {
    if (!this.currentSession) {
      return;
    }
    try {
      this.currentSession.close();
      await this.sessionRepo.save(this.currentSession);
    } finally {
      this.currentSession = null;
    }
  }

  reset(): void {
    this.currentSession = null;
    this.initializationPromise = null;
    this.listeners.clear();
  }

  private async loadOrCreate(): Promise<Session> {
    const deviceId = this.deviceIdProvider();
    const existing = await this.sessionRepo.findActive(deviceId, SESSION_INACTIVITY_TIMEOUT_MS);
    if (existing) {
      return existing;
    }

    const session = Session.create({
      id: SessionId.generate(),
      deviceId,
      siteId: SiteId.generate(),
      deviceInfo: this.detectDeviceInfo(),
    });
    await this.sessionRepo.save(session);
    return session;
  }

  private detectDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return DeviceInfo.fromUserAgent('', undefined, undefined);
    }
    return DeviceInfo.fromUserAgent(
      navigator.userAgent,
      window.screen?.width,
      window.screen?.height,
    );
  }

  private notifyAllListeners(session: Session): void {
    for (const listener of [...this.listeners]) {
      this.notifySingleListener(listener, session);
    }
  }

  private notifySingleListener(listener: SessionListener, session?: Session): void {
    const target = session ?? this.currentSession;
    if (!target) return;
    try {
      listener(target);
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.error('[SessionManager] listener threw:', error);
      }
    }
  }
}
