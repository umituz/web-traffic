/**
 * AffiliateId Value Object
 * @description Immutable value object for affiliate identification
 */

export class AffiliateId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('AffiliateId cannot be empty');
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      throw new Error('AffiliateId must contain only alphanumeric characters, hyphens, and underscores');
    }
    this.value = value;
    Object.freeze(this);
  }

  equals(other: AffiliateId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }

  static fromSlug(slug: string): AffiliateId {
    return new AffiliateId(slug);
  }
}
