/**
 * Conversion Repository Interface
 * @description Repository interface for Order persistence (Domain Layer)
 */

import type { Order } from '../aggregates/order.aggregate';

export interface IConversionRepository {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findBySessionId(sessionId: string): Promise<Order[]>;
  delete(orderId: string): Promise<void>;
}
