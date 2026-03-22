/**
 * EventId Value Object
 * @description Immutable value object for event identification
 */

export class EventId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('EventId cannot be empty');
    }
    if (!value.startsWith('event-')) {
      throw new Error('EventId must start with "event-"');
    }
    this.value = value;
    Object.freeze(this);
  }

  equals(other: EventId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }

  static generate(): EventId {
    const id = `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    return new EventId(id);
  }
}
