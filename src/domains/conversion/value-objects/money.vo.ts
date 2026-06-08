/**
 * Money Value Object
 * @description Immutable monetary value with ISO 4217 currency support
 */

import { getCurrencyMetadata } from '../../../shared/iso-4217';
import { roundCurrencyAmount } from '../../../shared/calculations';
import {
  assertFiniteNumber,
  assertValidCurrencyCode,
  normalizeCurrencyCode,
} from '../../../shared/validation';

export class Money {
  private readonly amount: number;
  private readonly currency: string;
  private readonly decimals: number;

  private constructor(amount: number, currency: string) {
    const metadata = getCurrencyMetadata(currency);
    this.amount = roundCurrencyAmount(amount, metadata.decimals);
    this.currency = metadata.code;
    this.decimals = metadata.decimals;
    Object.freeze(this);
  }

  static of(amount: number, currency: string = 'USD'): Money {
    assertFiniteNumber(amount, 'Amount');
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    const normalized = normalizeCurrencyCode(currency);
    assertValidCurrencyCode(normalized);
    return new Money(amount, normalized);
  }

  static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  getDecimals(): number {
    return this.decimals;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Subtraction would result in a negative amount');
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    if (!Number.isFinite(factor) || factor < 0) {
      throw new Error('Factor must be a non-negative finite number');
    }
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot perform operation on ${this.currency} and ${other.currency}`);
    }
  }
}
