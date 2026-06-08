/**
 * Test: Order Aggregate
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Order } from '../../src/domains/conversion/aggregates/order.aggregate';
import { Money } from '../../src/domains/conversion/value-objects/money.vo';
import { SessionId } from '../../src/domains/tracking/value-objects/session-id.vo';

test('Order - creates with valid items', () => {
  const order = Order.create({
    sessionId: SessionId.of('session-test'),
    orderId: 'order-1',
    items: [
      { id: 'i1', name: 'Widget', price: 10, quantity: 2 },
      { id: 'i2', name: 'Gadget', price: 5, quantity: 1 },
    ],
  });
  assert.equal(order.isValid(), true);
  assert.equal(order.getItemCount(), 2);
  assert.equal(order.getTotalQuantity(), 3);
  assert.equal(order.getTotal().getAmount(), 25);
});

test('Order - rejects empty items', () => {
  assert.throws(() => Order.create({
    sessionId: SessionId.of('session-test'),
    orderId: 'order-1',
    items: [],
  }));
});

test('Order - rejects missing orderId', () => {
  assert.throws(() => Order.create({
    sessionId: SessionId.of('session-test'),
    orderId: '',
    items: [{ id: 'i1', name: 'X', price: 1, quantity: 1 }],
  }));
});

test('Order - uses custom currency', () => {
  const order = Order.create({
    sessionId: SessionId.of('session-test'),
    orderId: 'order-1',
    items: [{ id: 'i1', name: 'X', price: 1000, quantity: 1 }],
    currency: 'JPY',
  });
  assert.equal(order.getTotal().getCurrency(), 'JPY');
  assert.equal(order.getTotal().getAmount(), 1000);
});

test('Order - getItems returns readonly array', () => {
  const order = Order.create({
    sessionId: SessionId.of('session-test'),
    orderId: 'order-1',
    items: [{ id: 'i1', name: 'X', price: 1, quantity: 1 }],
  });
  const items = order.getItems();
  assert.equal(items.length, 1);
});

test('Order - toJSON roundtrip', () => {
  const original = Order.create({
    sessionId: SessionId.of('session-test'),
    orderId: 'order-1',
    items: [{ id: 'i1', name: 'X', price: 5, quantity: 3 }],
  });
  const restored = Order.fromState(original.toJSON());
  assert.equal(restored.orderId, original.orderId);
  assert.equal(restored.getTotal().getAmount(), 15);
  assert.ok(Money.of(15, 'USD').equals(restored.getTotal()));
});
