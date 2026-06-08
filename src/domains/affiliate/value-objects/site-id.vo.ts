/**
 * SiteId Value Object
 * @description Immutable typed identifier for a tracked site
 */

import { BrandedId } from '../../shared/branded-id';
import { assertString } from '../../../shared/validation';
import { SITE_ID_MIN_LENGTH, SITE_ID_MAX_LENGTH } from '../../../shared/config';

export class SiteId extends BrandedId {
  protected static override readonly BRAND: symbol = Symbol('SiteId');
  private static readonly PREFIX = 'site-';

  private constructor(value: string) {
    super(value);
  }

  static of(value: string): SiteId {
    assertString(value, 'SiteId');
    if (value.length < SITE_ID_MIN_LENGTH || value.length > SITE_ID_MAX_LENGTH) {
      throw new Error(`SiteId length must be between ${SITE_ID_MIN_LENGTH} and ${SITE_ID_MAX_LENGTH}`);
    }
    BrandedId.validate(value, { prefix: SiteId.PREFIX });
    return new SiteId(value);
  }

  static generate(): SiteId {
    return new SiteId(BrandedId.withPrefix(SiteId.PREFIX));
  }
}
