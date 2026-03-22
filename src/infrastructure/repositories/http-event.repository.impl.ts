/**
 * HTTP Event Repository Implementation
 * @description HTTP-based implementation of IEventRepository
 */

import type {
  IEventRepository,
  IPageviewRepository,
  ISessionRepository,
} from '../../domains/tracking/repositories/event.repository.interface';
import type { Event } from '../../domains/tracking/entities/event.entity';
import type { Pageview } from '../../domains/tracking/entities/pageview.entity';
import type { Session } from '../../domains/tracking/aggregates/session.aggregate';
import type { EventId } from '../../domains/tracking/value-objects/event-id.vo';
import type { SessionId } from '../../domains/tracking/value-objects/session-id.vo';

export interface HTTPRepositoryConfig {
  readonly apiUrl: string;
  readonly apiKey: string;
}

export class HTTPEventRepository implements IEventRepository {
  private queue: Array<{ event: Event | Pageview; timestamp: number }> = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  private readonly MAX_QUEUE_SIZE = 100;

  constructor(private readonly config: HTTPRepositoryConfig) {
    this.startFlushTimer();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  async save(event: Event): Promise<void> {
    this.queue.push({ event, timestamp: Date.now() });
    if (this.queue.length >= 10) {
      await this.flush();
    }
  }

  async findById(id: EventId): Promise<Event | null> {
    // For HTTP repository, we don't fetch individual events
    return null;
  }

  async findBySessionId(sessionId: SessionId): Promise<Event[]> {
    // Would need an endpoint to fetch events by session
    return [];
  }

  async delete(id: EventId): Promise<void> {
    // Implement if needed
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const items = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(`${this.config.apiUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify({
          events: items.map((item) => item.event.toJSON()),
        }),
        keepalive: true,
      });

      if (!response.ok) {
        console.error('Tracking failed:', response.statusText);
        this.queue.unshift(...items);
      }
    } catch (error) {
      console.error('Tracking error:', error);
      this.queue.unshift(...items);
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

export class HTTPPageviewRepository implements IPageviewRepository {
  private eventRepo: IEventRepository;

  constructor(config: HTTPRepositoryConfig) {
    this.eventRepo = new HTTPEventRepository(config);
  }

  async save(pageview: Pageview): Promise<void> {
    await this.eventRepo.save(pageview as any);
  }

  async findById(id: EventId): Promise<Pageview | null> {
    return null;
  }

  async findBySessionId(sessionId: SessionId): Promise<Pageview[]> {
    return [];
  }

  async delete(id: EventId): Promise<void> {
    // Implement if needed
  }
}

export class LocalSessionRepository implements ISessionRepository {
  private sessions = new Map<string, Session>();

  async save(session: Session): Promise<void> {
    this.sessions.set(session.id.toString(), session);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wt_session', JSON.stringify(session.toJSON()));
    }
  }

  async findById(id: SessionId): Promise<Session | null> {
    return this.sessions.get(id.toString()) || null;
  }

  async findActive(deviceId: string, timeoutMs: number): Promise<Session | null> {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem('wt_session');
    if (!stored) return null;

    const data = JSON.parse(stored);
    const sessionId = new SessionId(data.id);

    const session = this.sessions.get(sessionId.toString());
    if (session && session.isActive(timeoutMs)) {
      return session;
    }

    return null;
  }

  async delete(id: SessionId): Promise<void> {
    this.sessions.delete(id.toString());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wt_session');
    }
  }
}
