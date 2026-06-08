/**
 * OrderItem Entity
 * @description Immutable line item in a conversion order
 */

export interface OrderItemProps {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly quantity: number;
}

export class OrderItem {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly quantity: number;

  private constructor(props: OrderItemProps) {
    this.id = props.id;
    this.name = props.name;
    this.price = props.price;
    this.quantity = props.quantity;
  }

  static create(input: { id: string; name: string; price: number; quantity: number }): OrderItem {
    if (!input.id) throw new Error('OrderItem id is required');
    if (!input.name) throw new Error('OrderItem name is required');
    if (input.price < 0) throw new Error('OrderItem price cannot be negative');
    if (input.quantity <= 0) throw new Error('OrderItem quantity must be positive');
    return new OrderItem(input);
  }

  getSubtotal(): number {
    return this.price * this.quantity;
  }

  toJSON(): OrderItemProps {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      quantity: this.quantity,
    };
  }
}
