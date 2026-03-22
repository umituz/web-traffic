/**
 * Tracking Command Service
 * @description Application service for tracking commands (use-cases)
 */

import { EventId } from '../../tracking/value-objects/event-id.vo';
import { SessionId } from '../../tracking/value-objects/session-id.vo';
import { UTMParameters } from '../../tracking/value-objects/utm-parameters.vo';
import { Session } from '../../tracking/aggregates/session.aggregate';
import { Event } from '../../tracking/entities/event.entity';
import { Pageview } from '../../tracking/entities/pageview.entity';
import type { ISessionRepository, IEventRepository, IPageviewRepository } from '../../tracking/repositories/event.repository.interface';
import type { EventTracked, PageviewTracked } from '../../tracking/events';

export interface TrackingCommandResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

export class TrackingCommandService {
  constructor(
    private readonly sessionRepo: ISessionRepository,
    private readonly eventRepo: IEventRepository,
    private readonly pageviewRepo: IPageviewRepository
  ) {}

  async trackEvent(
    sessionId: string,
    eventName: string,
    properties: Record<string, unknown> = {}
  ): Promise<TrackingCommandResult> {
    try {
      const sessionIdVo = new SessionId(sessionId);
      const eventId = EventId.generate();

      const event = new Event({
        id: eventId,
        sessionId: sessionIdVo,
        name: eventName,
        properties,
      });

      // Get or create session
      let session = await this.sessionRepo.findById(sessionIdVo);
      if (!session) {
        throw new Error('Session not found');
      }

      session.addEvent(event);
      await this.eventRepo.save(event);
      await this.sessionRepo.save(session);

      return {
        success: true,
        eventId: eventId.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async trackPageview(
    sessionId: string,
    path: string,
    referrer: string | null = null,
    utmParams?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string }
  ): Promise<TrackingCommandResult> {
    try {
      const sessionIdVo = new SessionId(sessionId);
      const pageviewId = EventId.generate();

      const utmParameters = utmParams ? new UTMParameters(utmParams) : null;

      const pageview = new Pageview({
        id: pageviewId,
        sessionId: sessionIdVo,
        siteId: sessionIdVo.getSiteId(),
        path,
        referrer,
        utmParameters,
      });

      // Get or create session
      let session = await this.sessionRepo.findById(sessionIdVo);
      if (!session) {
        throw new Error('Session not found');
      }

      session.addPageview(pageview);
      await this.pageviewRepo.save(pageview);
      await this.sessionRepo.save(session);

      return {
        success: true,
        eventId: pageviewId.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
