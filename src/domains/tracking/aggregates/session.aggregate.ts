/**
 * Session Aggregate Root
 * @description Manages user session and its events within consistency boundary
 */

import type { Pageview } from '../entities/pageview.entity';
import type { Event } from '../entities/event.entity';
import { SessionId } from '../value-objects/session-id.vo';
import type { SiteId } from '../../affiliate/value-objects/site-id.vo';
import type { DeviceInfo } from '../value-objects/device-info.vo';

export interface SessionCreateInput {
  deviceId: string;
  siteId: SiteId;
  deviceInfo: DeviceInfo;
  startTime?: number;
}

export class Session {
  readonly id: SessionId;
  readonly deviceId: string;
  readonly siteId: SiteId;
  readonly deviceInfo: DeviceInfo;
  readonly startTime: number;
  private endTime: number | null;
  private events: Event[];
  private pageviews: Pageview[];
  private entryPage: string | null;
  private exitPage: string | null;

  constructor(input: SessionCreateInput & { id: SessionId }) {
    this.id = input.id;
    this.deviceId = input.deviceId;
    this.siteId = input.siteId;
    this.deviceInfo = input.deviceInfo;
    this.startTime = input.startTime ?? Date.now();
    this.endTime = null;
    this.events = [];
    this.pageviews = [];
    this.entryPage = null;
    this.exitPage = null;
    Object.freeze(this.id);
    Object.freeze(this.deviceId);
    Object.freeze(this.siteId);
    Object.freeze(this.deviceInfo);
    Object.freeze(this.startTime);
  }

  // Aggregate root methods - maintain consistency
  addEvent(event: Event): void {
    if (this.isExpired()) {
      throw new Error('Cannot add event to expired session');
    }
    this.events.push(event);
  }

  addPageview(pageview: Pageview): void {
    if (this.isExpired()) {
      throw new Error('Cannot add pageview to expired session');
    }
    this.pageviews.push(pageview);
    this.exitPage = pageview.path;
    if (!this.entryPage) {
      this.entryPage = pageview.path;
    }
  }

  getEntryPage(): string | null {
    return this.entryPage;
  }

  getExitPage(): string | null {
    return this.exitPage;
  }

  getSiteId(): SiteId {
    return this.siteId;
  }

  getVisitorId(): string {
    return this.deviceId;
  }

  getDeviceInfo(): DeviceInfo {
    return this.deviceInfo;
  }

  close(): void {
    if (this.endTime) {
      throw new Error('Session already closed');
    }
    this.endTime = Date.now();
  }

  isExpired(timeoutMs: number = 30 * 60 * 1000): boolean {
    if (this.endTime) {
      return true;
    }
    return Date.now() - this.startTime > timeoutMs;
  }

  isActive(timeoutMs: number = 30 * 60 * 1000): boolean {
    return !this.isExpired(timeoutMs);
  }

  getDuration(): number {
    const end = this.endTime ?? Date.now();
    return end - this.startTime;
  }

  getEventCount(): number {
    return this.events.length;
  }

  getPageviewCount(): number {
    return this.pageviews.length;
  }

  getEvents(): Event[] {
    return [...this.events];
  }

  getPageviews(): Pageview[] {
    return [...this.pageviews];
  }

  toJSON() {
    return {
      id: this.id.toString(),
      deviceId: this.deviceId,
      siteId: this.siteId.toString(),
      deviceInfo: this.deviceInfo.toJSON(),
      startTime: this.startTime,
      endTime: this.endTime,
      eventCount: this.events.length,
      pageviewCount: this.pageviews.length,
      entryPage: this.entryPage,
      exitPage: this.exitPage,
      duration: this.getDuration(),
    };
  }
}
