/**
 * Order Aggregate Root
 * @description Manages conversion order and its items
 */

import type { OrderItem } from '../entities/order-item.entity';
import type { EventId } from '../../tracking/value-objects/event-id.vo';
import { Money } from '../value-objects/money.vo';

export interface OrderCreateInput {
  sessionId: string;
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  currency?: string;
}

export class Order {
  readonly id: EventId;
  readonly sessionId: string;
  readonly orderId: string;
  private items: OrderItem[];
  private total: Money;
  readonly createdAt: number;

  constructor(input: OrderCreateInput & { id: EventId }) {
    this.id = input.id;
    this.sessionId = input.sessionId;
    this.orderId = input.orderId;
    this.createdAt = Date.now();
    this.items = [];

    // Calculate total and create items
    let totalAmount = 0;
    for (const item of input.items) {
      const orderItem: OrderItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      };
      this.items.push(orderItem);
      totalAmount += item.price * item.quantity;
    }

    this.total = new Money(totalAmount, input.currency);

    Object.freeze(this.items);
    Object.freeze(this.id);
    Object.freeze(this.sessionId);
    Object.freeze(this.orderId);
    Object.freeze(this.createdAt);
  }

  getTotal(): Money {
    return this.total;
  }

  getItems(): OrderItem[] {
    return [...this.items];
  }

  getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  isValid(): boolean {
    return this.items.length > 0 && this.total.getAmount() > 0;
  }

  toJSON() {
    return {
      id: this.id.toString(),
      sessionId: this.sessionId,
      orderId: this.orderId,
      items: this.getItems(),
      total: this.total.toJSON(),
      createdAt: this.createdAt,
    };
  }
}
