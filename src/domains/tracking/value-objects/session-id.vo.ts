/**
 * SessionId Value Object
 * @description Immutable value object for session identification
 */

export class SessionId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('SessionId cannot be empty');
    }
    if (!value.startsWith('session-')) {
      throw new Error('SessionId must start with "session-"');
    }
    this.value = value;
    Object.freeze(this);
  }

  equals(other: SessionId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }

  static generate(): SessionId {
    const id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    return new SessionId(id);
  }
}
