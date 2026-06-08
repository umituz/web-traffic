/**
 * EventId Value Object
 * @description Immutable typed identifier for a tracked event
 */

import { BrandedId } from '../../shared/branded-id';
import { assertHasPrefix } from '../../../shared/validation';

export class EventId extends BrandedId {
  protected static override readonly BRAND: symbol = Symbol('EventId');
  private static readonly PREFIX = 'event-';

  private constructor(value: string) {
    super(value);
  }

  static of(value: string): EventId {
    BrandedId.validate(value, { prefix: EventId.PREFIX });
    assertHasPrefix(value, EventId.PREFIX);
    return new EventId(value);
  }

  static generate(): EventId {
    return new EventId(BrandedId.withPrefix(EventId.PREFIX));
  }
}
