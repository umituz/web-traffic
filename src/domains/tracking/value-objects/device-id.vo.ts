/**
 * DeviceId Value Object
 * @description Immutable typed identifier for a device
 */

import { BrandedId } from '../../shared/branded-id';
import { assertHasPrefix } from '../../../shared/validation';

export class DeviceId extends BrandedId {
  protected static override readonly BRAND: symbol = Symbol('DeviceId');
  private static readonly PREFIX = 'device-';

  private constructor(value: string) {
    super(value);
  }

  static of(value: string): DeviceId {
    BrandedId.validate(value, { prefix: DeviceId.PREFIX });
    assertHasPrefix(value, DeviceId.PREFIX);
    return new DeviceId(value);
  }

  static generate(): DeviceId {
    return new DeviceId(BrandedId.withPrefix(DeviceId.PREFIX));
  }
}
