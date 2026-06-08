/**
 * Session Aggregate Root
 * @description Manages user session and its events within consistency boundary
 */

import type { Pageview } from '../entities/pageview.entity';
import type { Event } from '../entities/event.entity';
import { SessionId } from '../value-objects/session-id.vo';
import { SiteId } from '../../affiliate/value-objects/site-id.vo';
import { DeviceInfo } from '../value-objects/device-info.vo';
import { DeviceId } from '../value-objects/device-id.vo';
import { SESSION_INACTIVITY_TIMEOUT_MS } from '../../../shared/config';
import { elapsedMilliseconds } from '../../../shared/calculations';

export { SESSION_INACTIVITY_TIMEOUT_MS as DEFAULT_SESSION_TIMEOUT_MS };

export interface SessionCreateInput {
  id: SessionId;
  deviceId: DeviceId;
  siteId: SiteId;
  deviceInfo: DeviceInfo;
  startTime?: number;
}

export interface SessionState {
  readonly id: string;
  readonly deviceId: string;
  readonly siteId: string;
  readonly deviceInfo: ReturnType<DeviceInfo['toJSON']>;
  readonly startTime: number;
  readonly endTime: number | null;
  readonly eventCount: number;
  readonly pageviewCount: number;
  readonly entryPage: string | null;
  readonly exitPage: string | null;
}

export class Session {
  readonly id: SessionId;
  readonly deviceId: DeviceId;
  readonly siteId: SiteId;
  readonly deviceInfo: DeviceInfo;
  readonly startTime: number;
  private endTime: number | null = null;
  private readonly events: Event[] = [];
  private readonly pageviews: Pageview[] = [];
  private entryPage: string | null = null;
  private exitPage: string | null = null;

  private constructor(input: SessionCreateInput) {
    this.id = input.id;
    this.deviceId = input.deviceId;
    this.siteId = input.siteId;
    this.deviceInfo = input.deviceInfo;
    this.startTime = input.startTime ?? Date.now();
  }

  static create(input: SessionCreateInput): Session {
    return new Session(input);
  }

  static fromState(state: SessionState): Session {
    const session = new Session({
      id: SessionId.of(state.id),
      deviceId: DeviceId.of(state.deviceId),
      siteId: SiteId.of(state.siteId),
      deviceInfo: DeviceInfo.create({
        browser: state.deviceInfo.browser,
        os: state.deviceInfo.os,
        deviceType: state.deviceInfo.deviceType,
        screenSize: state.deviceInfo.screenSize,
      }),
      startTime: state.startTime,
    });
    session.endTime = state.endTime;
    session.entryPage = state.entryPage;
    session.exitPage = state.exitPage;
    for (let i = 0; i < state.eventCount; i++) {
      session.events.push(undefined as never);
    }
    for (let i = 0; i < state.pageviewCount; i++) {
      session.pageviews.push(undefined as never);
    }
    return session;
  }

  addEvent(event: Event): void {
    this.assertOpen();
    this.events.push(event);
  }

  addPageview(pageview: Pageview): void {
    this.assertOpen();
    this.pageviews.push(pageview);
    this.exitPage = pageview.path;
    if (this.entryPage === null) {
      this.entryPage = pageview.path;
    }
  }

  getEntryPage(): string | null {
    return this.entryPage;
  }

  getExitPage(): string | null {
    return this.exitPage;
  }

  close(): void {
    if (this.endTime !== null) {
      throw new Error('Session already closed');
    }
    this.endTime = Date.now();
  }

  isExpired(timeoutMs: number = SESSION_INACTIVITY_TIMEOUT_MS): boolean {
    if (this.endTime !== null) {
      return true;
    }
    return elapsedMilliseconds(this.startTime) > timeoutMs;
  }

  isActive(timeoutMs: number = SESSION_INACTIVITY_TIMEOUT_MS): boolean {
    return !this.isExpired(timeoutMs);
  }

  getDuration(): number {
    return elapsedMilliseconds(this.startTime, this.endTime ?? Date.now());
  }

  getEventCount(): number {
    return this.events.length;
  }

  getPageviewCount(): number {
    return this.pageviews.length;
  }

  getEvents(): ReadonlyArray<Event> {
    return [...this.events];
  }

  getPageviews(): ReadonlyArray<Pageview> {
    return [...this.pageviews];
  }

  toJSON(): SessionState {
    return {
      id: this.id.toString(),
      deviceId: this.deviceId.toString(),
      siteId: this.siteId.toString(),
      deviceInfo: this.deviceInfo.toJSON(),
      startTime: this.startTime,
      endTime: this.endTime,
      eventCount: this.events.length,
      pageviewCount: this.pageviews.length,
      entryPage: this.entryPage,
      exitPage: this.exitPage,
    };
  }

  private assertOpen(): void {
    if (this.isExpired()) {
      throw new Error('Session is closed or expired');
    }
  }
}
