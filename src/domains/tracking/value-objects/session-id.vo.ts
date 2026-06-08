/**
 * SessionId Value Object
 * @description Immutable typed identifier for a tracking session
 */

import { BrandedId } from '../../shared/branded-id';
import { assertHasPrefix } from '../../../shared/validation';

export class SessionId extends BrandedId {
  protected static override readonly BRAND: symbol = Symbol('SessionId');
  private static readonly PREFIX = 'session-';

  private constructor(value: string) {
    super(value);
  }

  static of(value: string): SessionId {
    BrandedId.validate(value, { prefix: SessionId.PREFIX });
    assertHasPrefix(value, SessionId.PREFIX);
    return new SessionId(value);
  }

  static generate(): SessionId {
    return new SessionId(BrandedId.withPrefix(SessionId.PREFIX));
  }
}
