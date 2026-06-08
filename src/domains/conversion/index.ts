/**
 * Conversion Domain Export
 * Subpath: @umituz/web-traffic/conversion
 */

export { Order } from './aggregates/order.aggregate';
export type { OrderCreateInput, OrderState } from './aggregates/order.aggregate';

export { OrderItem } from './entities/order-item.entity';
export type { OrderItemProps } from './entities/order-item.entity';

export { Money } from './value-objects/money.vo';

export type { IConversionRepository } from './repositories/conversion.repository.interface';

export { ConversionRecordedEvent } from './events/conversion.events';
export type { ConversionRecordedPayload } from './events/conversion.events';
