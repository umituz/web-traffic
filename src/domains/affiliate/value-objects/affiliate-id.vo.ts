/**
 * AffiliateId Value Object
 * @description Immutable typed identifier for an affiliate partner
 */

import { BrandedId } from '../../shared/branded-id';
import { assertValidSlug } from '../../../shared/validation';

export class AffiliateId extends BrandedId {
  protected static override readonly BRAND: symbol = Symbol('AffiliateId');

  private constructor(value: string) {
    super(value);
  }

  static of(slug: string): AffiliateId {
    assertValidSlug(slug, 'AffiliateId');
    return new AffiliateId(slug);
  }
}
