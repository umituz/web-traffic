/**
 * Conversion Repository Interface
 * @description Persistence contract for the Order aggregate (Domain Layer)
 */

import type { Order } from '../aggregates/order.aggregate';
import type { SessionId } from '../../tracking/value-objects/session-id.vo';

export interface IConversionRepository {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findBySessionId(sessionId: SessionId): Promise<ReadonlyArray<Order>>;
  delete(orderId: string): Promise<void>;
}
