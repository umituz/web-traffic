/**
 * OrderItem Entity
 * @description Represents an item in a conversion order
 */

export interface OrderItem {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly quantity: number;
}

export interface OrderItemCreateInput {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function createOrderItem(input: OrderItemCreateInput): OrderItem {
  return {
    id: input.id,
    name: input.name,
    price: input.price,
    quantity: input.quantity,
  };
}
