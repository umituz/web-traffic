/**
 * BrandedId Base Class
 * @description Template Method base for typed ID value objects
 */

import { generateUniqueId } from '../../shared/unique-id';

export interface IdValidationRule {
  readonly prefix?: string;
  readonly pattern?: RegExp;
  readonly minLength?: number;
  readonly maxLength?: number;
}

export abstract class BrandedId {
  protected static readonly BRAND: symbol = Symbol('BrandedId');
  protected readonly value: string;

  protected constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: this): boolean {
    if (other == null) {
      return false;
    }
    return this.value === other.value;
  }

  protected static validate(value: string, rule: IdValidationRule): void {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('ID cannot be empty');
    }

    if (rule.prefix && !value.startsWith(rule.prefix)) {
      throw new Error(`ID must start with "${rule.prefix}"`);
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      throw new Error('ID format is invalid');
    }

    if (rule.minLength !== undefined && value.length < rule.minLength) {
      throw new Error(`ID must be at least ${rule.minLength} characters`);
    }

    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      throw new Error(`ID must be at most ${rule.maxLength} characters`);
    }
  }

  protected static withPrefix(prefix: string): string {
    return `${prefix}-${generateUniqueId()}`;
  }
}
