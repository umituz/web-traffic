/**
 * Tracking Command Service
 * @description Application service implementing tracking use-cases
 */

import { SessionId } from '../value-objects/session-id.vo';
import { UTMParameters, type UTMParameterSet } from '../value-objects/utm-parameters.vo';
import { Session } from '../aggregates/session.aggregate';
import { Event } from '../entities/event.entity';
import { Pageview } from '../entities/pageview.entity';
import type {
  ISessionRepository,
  IEventRepository,
  IPageviewRepository,
} from '../repositories/event.repository.interface';
import { TypedEventEmitter } from '../../shared/event-emitter';
import type { WebTrafficEventMap } from '../../events';
import {
  EventTrackedEvent,
  PageviewTrackedEvent,
  TrackingErrorEvent,
} from '../events/tracking.events';

export interface TrackingCommandResult {
  readonly success: boolean;
  readonly id?: string;
  readonly error?: string;
}

export class SessionNotFoundError extends Error {
  constructor(public readonly sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = 'SessionNotFoundError';
  }
}

export class TrackingCommandService {
  private readonly emitter = new TypedEventEmitter<WebTrafficEventMap>();

  constructor(
    private readonly sessionRepo: ISessionRepository,
    private readonly eventRepo: IEventRepository,
    private readonly pageviewRepo: IPageviewRepository,
  ) {}

  on = this.emitter.on.bind(this.emitter);
  once = this.emitter.once.bind(this.emitter);

  async trackEvent(
    sessionId: SessionId,
    eventName: string,
    properties: Record<string, unknown> = {},
  ): Promise<TrackingCommandResult> {
    try {
      const event = Event.create({
        sessionId,
        name: eventName,
        properties,
      });

      const session = await this.requireSession(sessionId);
      session.addEvent(event);

      await Promise.all([
        this.eventRepo.save(event),
        this.sessionRepo.save(session),
      ]);

      this.emitter.emit(
        'event.tracked',
        new EventTrackedEvent({
          eventId: event.id.toString(),
          sessionId: sessionId.toString(),
          name: eventName,
        }),
      );

      return { success: true, id: event.id.toString() };
    } catch (error) {
      const message = this.toMessage(error);
      this.emitter.emit(
        'tracking.error',
        new TrackingErrorEvent({ operation: 'trackEvent', message }),
      );
      return { success: false, error: message };
    }
  }

  async trackPageview(
    sessionId: SessionId,
    path: string,
    referrer: string | null = null,
    utmParams?: UTMParameterSet,
  ): Promise<TrackingCommandResult> {
    try {
      const session = await this.requireSession(sessionId);

      const pageview = Pageview.create({
        sessionId,
        siteId: session.siteId,
        path,
        referrer,
        utmParameters: utmParams ? UTMParameters.of(utmParams) : null,
      });

      session.addPageview(pageview);

      await Promise.all([
        this.pageviewRepo.save(pageview),
        this.sessionRepo.save(session),
      ]);

      this.emitter.emit(
        'pageview.tracked',
        new PageviewTrackedEvent({
          pageviewId: pageview.id.toString(),
          sessionId: sessionId.toString(),
          path,
          referrer,
          utmSource: pageview.utmParameters?.getSource(),
        }),
      );

      return { success: true, id: pageview.id.toString() };
    } catch (error) {
      const message = this.toMessage(error);
      this.emitter.emit(
        'tracking.error',
        new TrackingErrorEvent({ operation: 'trackPageview', message }),
      );
      return { success: false, error: message };
    }
  }

  private async requireSession(sessionId: SessionId): Promise<Session> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new SessionNotFoundError(sessionId.toString());
    }
    return session;
  }

  private toMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error';
  }
}
