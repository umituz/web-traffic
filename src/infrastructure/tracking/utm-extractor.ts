/**
 * UTM Extractor
 * @description Single responsibility: UTM parameter extraction from URL
 */

import { UTMParameters } from '../../domains/tracking/value-objects/utm-parameters.vo';

export class UtmExtractor {
  fromCurrentUrl(): UTMParameters | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return UTMParameters.fromURLSearchParams(new URLSearchParams(window.location.search));
  }

  fromSearchParams(searchParams: URLSearchParams): UTMParameters | null {
    return UTMParameters.fromURLSearchParams(searchParams);
  }
}
