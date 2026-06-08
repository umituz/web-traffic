/**
 * Pageview Entity
 * @description Represents a page view within a session
 */

import { EventId } from '../value-objects/event-id.vo';
import type { SessionId } from '../value-objects/session-id.vo';
import type { SiteId } from '../../affiliate/value-objects/site-id.vo';
import { UTMParameters } from '../value-objects/utm-parameters.vo';
import { assertValidPageviewPath } from '../../../shared/validation';

export interface PageviewCreateInput {
  sessionId: SessionId;
  siteId: SiteId;
  path: string;
  referrer: string | null;
  utmParameters: UTMParameters | null;
}

export class Pageview {
  readonly id: EventId;
  readonly sessionId: SessionId;
  readonly siteId: SiteId;
  readonly path: string;
  readonly referrer: string | null;
  readonly utmParameters: UTMParameters | null;
  readonly timestamp: number;

  private constructor(input: {
    id: EventId;
    sessionId: SessionId;
    siteId: SiteId;
    path: string;
    referrer: string | null;
    utmParameters: UTMParameters | null;
    timestamp: number;
  }) {
    this.id = input.id;
    this.sessionId = input.sessionId;
    this.siteId = input.siteId;
    this.path = input.path;
    this.referrer = input.referrer;
    this.utmParameters = input.utmParameters;
    this.timestamp = input.timestamp;
  }

  static create(input: PageviewCreateInput & { id?: EventId; timestamp?: number }): Pageview {
    assertValidPageviewPath(input.path);
    return new Pageview({
      id: input.id ?? EventId.generate(),
      sessionId: input.sessionId,
      siteId: input.siteId,
      path: input.path,
      referrer: input.referrer,
      utmParameters: input.utmParameters,
      timestamp: input.timestamp ?? Date.now(),
    });
  }

  hasUTMParameters(): boolean {
    return this.utmParameters?.hasAnyUTM() ?? false;
  }

  toJSON() {
    return {
      id: this.id.toString(),
      sessionId: this.sessionId.toString(),
      siteId: this.siteId.toString(),
      path: this.path,
      referrer: this.referrer,
      utmParameters: this.utmParameters?.toJSON() ?? null,
      timestamp: this.timestamp,
    };
  }
}
