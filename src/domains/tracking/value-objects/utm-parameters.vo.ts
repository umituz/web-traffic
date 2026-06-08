/**
 * UTMParameters Value Object
 * @description Immutable campaign tracking parameters with length validation
 */

import { assertValidUtmValue } from '../../../shared/validation';

export interface UTMParameterSet {
  readonly source?: string;
  readonly medium?: string;
  readonly campaign?: string;
  readonly term?: string;
  readonly content?: string;
}

export class UTMParameters {
  private readonly source?: string;
  private readonly medium?: string;
  private readonly campaign?: string;
  private readonly term?: string;
  private readonly content?: string;

  private constructor(params: UTMParameterSet) {
    this.source = params.source;
    this.medium = params.medium;
    this.campaign = params.campaign;
    this.term = params.term;
    this.content = params.content;
    Object.freeze(this);
  }

  static of(params: UTMParameterSet): UTMParameters {
    UTMParameters.validateAll(params);
    return new UTMParameters({ ...params });
  }

  static empty(): UTMParameters {
    return new UTMParameters({});
  }

  static fromURLSearchParams(searchParams: URLSearchParams): UTMParameters | null {
    const params: UTMParameterSet = {
      source: searchParams.get('utm_source') ?? undefined,
      medium: searchParams.get('utm_medium') ?? undefined,
      campaign: searchParams.get('utm_campaign') ?? undefined,
      term: searchParams.get('utm_term') ?? undefined,
      content: searchParams.get('utm_content') ?? undefined,
    };

    if (!UTMParameters.hasAny(params)) {
      return null;
    }

    return new UTMParameters(params);
  }

  private static hasAny(params: UTMParameterSet): boolean {
    return Boolean(params.source || params.medium || params.campaign || params.term || params.content);
  }

  private static validateAll(params: UTMParameterSet): void {
    assertValidUtmValue(params.source, 'source');
    assertValidUtmValue(params.medium, 'medium');
    assertValidUtmValue(params.campaign, 'campaign');
    assertValidUtmValue(params.term, 'term');
    assertValidUtmValue(params.content, 'content');
  }

  getSource(): string | undefined {
    return this.source;
  }

  getMedium(): string | undefined {
    return this.medium;
  }

  getCampaign(): string | undefined {
    return this.campaign;
  }

  getTerm(): string | undefined {
    return this.term;
  }

  getContent(): string | undefined {
    return this.content;
  }

  hasAnyUTM(): boolean {
    return UTMParameters.hasAny({
      source: this.source,
      medium: this.medium,
      campaign: this.campaign,
      term: this.term,
      content: this.content,
    });
  }

  toJSON(): UTMParameterSet {
    return {
      source: this.source,
      medium: this.medium,
      campaign: this.campaign,
      term: this.term,
      content: this.content,
    };
  }
}
