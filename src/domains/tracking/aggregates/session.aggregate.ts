/**
 * Session Aggregate Root
 * @description Manages user session and its events within consistency boundary
 */

import type { Pageview } from '../entities/pageview.entity';
import type { Event } from '../entities/event.entity';
import { SessionId } from '../value-objects/session-id.vo';

export interface SessionCreateInput {
  deviceId: string;
  startTime?: number;
}

export class Session {
  readonly id: SessionId;
  readonly deviceId: string;
  readonly startTime: number;
  private endTime: number | null;
  private events: Event[];
  private pageviews: Pageview[];
  private eventCount: number;
  private pageviewCount: number;

  constructor(input: SessionCreateInput & { id: SessionId }) {
    this.id = input.id;
    this.deviceId = input.deviceId;
    this.startTime = input.startTime ?? Date.now();
    this.endTime = null;
    this.events = [];
    this.pageviews = [];
    this.eventCount = 0;
    this.pageviewCount = 0;
    Object.freeze(this.id);
    Object.freeze(this.deviceId);
    Object.freeze(this.startTime);
  }

  // Aggregate root methods - maintain consistency
  addEvent(event: Event): void {
    if (this.isExpired()) {
      throw new Error('Cannot add event to expired session');
    }
    this.events.push(event);
    this.eventCount++;
    this.updateLastActivity();
  }

  addPageview(pageview: Pageview): void {
    if (this.isExpired()) {
      throw new Error('Cannot add pageview to expired session');
    }
    this.pageviews.push(pageview);
    this.pageviewCount++;
    this.updateLastActivity();
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
    return this.eventCount;
  }

  getPageviewCount(): number {
    return this.pageviewCount;
  }

  getEvents(): Event[] {
    return [...this.events];
  }

  getPageviews(): Pageview[] {
    return [...this.pageviews];
  }

  private updateLastActivity(): void {
    // Could emit domain event here
  }

  toJSON() {
    return {
      id: this.id.toString(),
      deviceId: this.deviceId,
      startTime: this.startTime,
      endTime: this.endTime,
      eventCount: this.eventCount,
      pageviewCount: this.pageviewCount,
      duration: this.getDuration(),
    };
  }
}
