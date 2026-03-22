/**
 * Event Entity
 * @description Represents a tracked analytics event using value objects
 */

import { EventId } from '../value-objects/event-id.vo';
import type { SessionId } from '../value-objects/session-id.vo';

export interface EventCreateInput {
  sessionId: SessionId;
  name: string;
  properties: Record<string, unknown>;
}

export class Event {
  readonly id: EventId;
  readonly sessionId: SessionId;
  readonly name: string;
  readonly properties: Record<string, unknown>;
  readonly timestamp: number;

  constructor(input: EventCreateInput & { id: EventId; timestamp?: number }) {
    this.id = input.id;
    this.sessionId = input.sessionId;
    this.name = input.name;
    this.properties = { ...input.properties };
    this.timestamp = input.timestamp ?? Date.now();
    Object.freeze(this.properties);
  }

  hasProperty(key: string): boolean {
    return key in this.properties;
  }

  getProperty<T = unknown>(key: string): T | undefined {
    return this.properties[key] as T;
  }

  toJSON() {
    return {
      id: this.id.toString(),
      sessionId: this.sessionId.toString(),
      name: this.name,
      properties: this.properties,
      timestamp: this.timestamp,
    };
  }
}
