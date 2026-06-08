/**
 * Event Entity
 * @description Represents a tracked analytics event
 */

import { EventId } from '../value-objects/event-id.vo';
import type { SessionId } from '../value-objects/session-id.vo';
import { assertValidEventName } from '../../../shared/validation';

export interface EventCreateInput {
  sessionId: SessionId;
  name: string;
  properties: Record<string, unknown>;
}

export class Event {
  readonly id: EventId;
  readonly sessionId: SessionId;
  readonly name: string;
  readonly properties: Readonly<Record<string, unknown>>;
  readonly timestamp: number;

  private constructor(input: { id: EventId; sessionId: SessionId; name: string; properties: Record<string, unknown>; timestamp: number }) {
    this.id = input.id;
    this.sessionId = input.sessionId;
    this.name = input.name;
    this.properties = Object.freeze({ ...input.properties });
    this.timestamp = input.timestamp;
  }

  static create(input: EventCreateInput & { id?: EventId; timestamp?: number }): Event {
    assertValidEventName(input.name);
    return new Event({
      id: input.id ?? EventId.generate(),
      sessionId: input.sessionId,
      name: input.name,
      properties: input.properties,
      timestamp: input.timestamp ?? Date.now(),
    });
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
