/**
 * UTMParameters Value Object
 * @description Immutable value object for UTM campaign parameters
 */

export class UTMParameters {
  private readonly source?: string;
  private readonly medium?: string;
  private readonly campaign?: string;
  private readonly term?: string;
  private readonly content?: string;

  constructor(params: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  }) {
    this.source = params.source;
    this.medium = params.medium;
    this.campaign = params.campaign;
    this.term = params.term;
    this.content = params.content;
    Object.freeze(this);
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
    return !!(this.source || this.medium || this.campaign || this.term || this.content);
  }

  toJSON() {
    return {
      source: this.source,
      medium: this.medium,
      campaign: this.campaign,
      term: this.term,
      content: this.content,
    };
  }

  static fromURLSearchParams(searchParams: URLSearchParams): UTMParameters | null {
    const source = searchParams.get('utm_source') || undefined;
    const medium = searchParams.get('utm_medium') || undefined;
    const campaign = searchParams.get('utm_campaign') || undefined;
    const term = searchParams.get('utm_term') || undefined;
    const content = searchParams.get('utm_content') || undefined;

    if (!source && !medium && !campaign && !term && !content) {
      return null;
    }

    return new UTMParameters({ source, medium, campaign, term, content });
  }
}
