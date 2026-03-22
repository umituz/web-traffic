/**
 * SiteId Value Object
 * @description Immutable value object for site identification (multi-site support)
 */

export class SiteId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('SiteId cannot be empty');
    }
    this.value = value;
    Object.freeze(this);
  }

  equals(other: SiteId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }

  static generate(): SiteId {
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const id = `site-${uniqueId}`;
    return new SiteId(id);
  }
}
