/**
 * Order Aggregate Root
 * @description Manages a conversion order and its line items
 */

import { OrderItem } from '../entities/order-item.entity';
import { Money } from '../value-objects/money.vo';
import { EventId } from '../../tracking/value-objects/event-id.vo';
import { SessionId } from '../../tracking/value-objects/session-id.vo';

export interface OrderCreateInput {
  id?: EventId;
  sessionId: SessionId;
  orderId: string;
  items: ReadonlyArray<{ id: string; name: string; price: number; quantity: number }>;
  currency?: string;
}

export interface OrderState {
  readonly id: string;
  readonly sessionId: string;
  readonly orderId: string;
  readonly items: ReadonlyArray<ReturnType<OrderItem['toJSON']>>;
  readonly total: ReturnType<Money['toJSON']>;
  readonly createdAt: number;
}

export class Order {
  readonly id: EventId;
  readonly sessionId: SessionId;
  readonly orderId: string;
  readonly createdAt: number;
  private readonly items: ReadonlyArray<OrderItem>;
  private readonly total: Money;

  private constructor(input: {
    id: EventId;
    sessionId: SessionId;
    orderId: string;
    items: ReadonlyArray<OrderItem>;
    total: Money;
    createdAt: number;
  }) {
    this.id = input.id;
    this.sessionId = input.sessionId;
    this.orderId = input.orderId;
    this.items = input.items;
    this.total = input.total;
    this.createdAt = input.createdAt;
  }

  static create(input: OrderCreateInput): Order {
    if (!input.orderId) throw new Error('Order id is required');
    if (input.items.length === 0) throw new Error('Order must have at least one item');

    const items = input.items.map((item) => OrderItem.create(item));
    const currency = input.currency ?? 'USD';
    const total = items.reduce(
      (acc, item) => acc.add(Money.of(item.getSubtotal(), currency)),
      Money.zero(currency),
    );

    return new Order({
      id: input.id ?? EventId.generate(),
      sessionId: input.sessionId,
      orderId: input.orderId,
      items,
      total,
      createdAt: Date.now(),
    });
  }

  static fromState(state: OrderState): Order {
    const items = state.items.map((item) => OrderItem.create(item));
    return new Order({
      id: EventId.of(state.id),
      sessionId: SessionId.of(state.sessionId),
      orderId: state.orderId,
      items,
      total: Money.of(state.total.amount, state.total.currency),
      createdAt: state.createdAt,
    });
  }

  getTotal(): Money {
    return this.total;
  }

  getItems(): ReadonlyArray<OrderItem> {
    return this.items;
  }

  getItemCount(): number {
    return this.items.length;
  }

  getTotalQuantity(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  isValid(): boolean {
    return this.items.length > 0 && this.total.isPositive();
  }

  toJSON(): OrderState {
    return {
      id: this.id.toString(),
      sessionId: this.sessionId.toString(),
      orderId: this.orderId,
      items: this.items.map((item) => item.toJSON()),
      total: this.total.toJSON(),
      createdAt: this.createdAt,
    };
  }
}
