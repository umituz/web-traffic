/**
 * Domain Event Base
 * @description Marker interface and metadata for domain events
 */

export interface DomainEvent<TType extends string = string, TPayload = unknown> {
  readonly type: TType;
  readonly occurredAt: number;
  readonly payload: TPayload;
}

export abstract class BaseDomainEvent<TType extends string, TPayload> implements DomainEvent<TType, TPayload> {
  readonly type: TType;
  readonly occurredAt: number;
  readonly payload: TPayload;

  protected constructor(type: TType, payload: TPayload) {
    this.type = type;
    this.payload = payload;
    this.occurredAt = Date.now();
  }
}
