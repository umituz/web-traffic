/**
 * Money Value Object
 * @description Immutable value object for monetary values
 */

export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'USD') {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a valid ISO 4217 code');
    }
    this.amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
    this.currency = currency.toUpperCase();
    Object.freeze(this);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }
}
