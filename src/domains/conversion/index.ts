/**
 * Conversion Domain Export
 * Subpath: @umituz/web-traffic/conversion
 */

// Aggregates
export { Order } from './aggregates/order.aggregate';
export type { OrderCreateInput } from './aggregates/order.aggregate';

// Entities
export { createOrderItem } from './entities/order-item.entity';
export type { OrderItem, OrderItemCreateInput } from './entities/order-item.entity';

// Value Objects
export { Money } from './value-objects/money.vo';

// Repository Interfaces
export type { IConversionRepository } from './repositories/conversion.repository.interface';
