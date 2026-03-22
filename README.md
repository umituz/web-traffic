# @umituz/web-traffic

Web analytics tracking library built with **Domain-Driven Design (DDD)** principles. Track pageviews, events, sessions, and conversions with clean architecture.

## 🎯 Features

- **✨ DDD Architecture** - Clean separation of domains, aggregates, and value objects
- **🎯 Event & Pageview Tracking** - Track user interactions and page views
- **📊 Session Management** - Automatic session creation with aggregate pattern
- **🔍 UTM Parameters** - Value object-based campaign tracking
- **💰 Conversion Tracking** - Order aggregate with Money value object
- **🔒 Type Safety** - Full TypeScript support with immutable value objects
- **🧩 Modular** - Subpath exports for tree-shaking

## 📦 Installation

```bash
npm install @umituz/web-traffic
```

## 🏗️ Architecture

### DDD Layer Structure

```
src/
├── domains/                    # Domain Layer (Pure business logic)
│   ├── tracking/              # Tracking Bounded Context
│   │   ├── aggregates/        # Session (aggregate root)
│   │   ├── entities/          # Event, Pageview
│   │   ├── value-objects/     # SessionId, EventId, UTMParameters
│   │   ├── repositories/      # Repository interfaces
│   │   ├── events/            # Domain events
│   │   └── application/       # Command services
│   ├── conversion/            # Conversion Bounded Context
│   │   ├── aggregates/        # Order
│   │   ├── entities/          # OrderItem
│   │   ├── value-objects/     # Money
│   │   └── repositories/      # Repository interfaces
│   └── analytics/             # Analytics Bounded Context
│       ├── entities/          # AnalyticsData
│       └── repositories/      # Repository interfaces
│
├── infrastructure/            # Infrastructure Layer (Implementation)
│   ├── repositories/          # HTTP repository implementations
│   ├── analytics/             # HTTP analytics client
│   └── tracking/              # WebTrafficService (Facade)
│
└── presentation/              # Presentation Layer (React)
    ├── hooks.ts               # useWebTraffic, useAnalytics
    └── context.tsx            # WebTrafficProvider
```

### DDD Concepts

**Value Objects** - Immutable, identity-less objects:
```typescript
import { SessionId, EventId, UTMParameters, Money } from '@umituz/web-traffic/tracking';

const sessionId = SessionId.generate(); // Always valid, frozen
const utm = new UTMParameters({ source: 'google', medium: 'cpc' });
const money = new Money(99.99, 'USD');
```

**Aggregates** - Consistency boundaries:
```typescript
import { Session } from '@umituz/web-traffic/tracking';

const session = new Session({ id: sessionId, deviceId: 'xxx' });
session.addEvent(event);    // Maintains invariant
session.addPageview(pageview);
const duration = session.getDuration();
```

**Repositories** - Data access interfaces:
```typescript
// Domain layer defines interface
interface IEventRepository {
  save(event: Event): Promise<void>;
  findById(id: EventId): Promise<Event | null>;
}

// Infrastructure layer implements
class HTTPEventRepository implements IEventRepository { ... }
```

## 🚀 Usage

### Basic Setup

```typescript
import { WebTrafficProvider } from '@umituz/web-traffic/presentation';

function App() {
  return (
    <WebTrafficProvider
      config={{
        apiKey: 'your-api-key',
        apiUrl: 'https://your-analytics-api.com',
        autoTrack: true,
      }}
    >
      <YourApp />
    </WebTrafficProvider>
  );
}
```

### Track Events

```typescript
import { useWebTraffic } from '@umituz/web-traffic/presentation';

function MyComponent() {
  const { trackEvent, trackPageView } = useWebTraffic();

  const handleClick = () => {
    await trackEvent('button_click', {
      button_id: 'submit',
      page: '/home',
    });
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### Work with Value Objects

```typescript
import {
  SessionId,
  EventId,
  UTMParameters,
  Money
} from '@umituz/web-traffic/tracking';

// Value objects ensure validity
const sessionId = new SessionId('session-123'); // Validates format
const utm = UTMParameters.fromURLSearchParams(searchParams);

// Money value object prevents invalid amounts
const total = new Money(99.99, 'USD');
const tax = total.multiply(0.1);
const final = total.add(tax);
```

### Work with Aggregates

```typescript
import { Session } from '@umituz/web-traffic/tracking';
import { Order } from '@umituz/web-traffic/conversion';

// Session aggregate maintains consistency
const session = new Session({
  id: SessionId.generate(),
  deviceId: 'device-123'
});

session.addEvent(event);
session.addPageview(pageview);

// Session enforces business rules
if (session.isExpired()) {
  throw new Error('Session expired');
}

session.close(); // Cannot add more events
```

## 📦 Subpath Exports

```typescript
// Presentation (React hooks & Provider)
import { WebTrafficProvider, useWebTraffic } from '@umituz/web-traffic/presentation';

// Tracking Domain
import { Session, EventId, SessionId } from '@umituz/web-traffic/tracking';

// Conversion Domain
import { Order, Money } from '@umituz/web-traffic/conversion';

// Analytics Domain
import type { AnalyticsData, AnalyticsQuery } from '@umituz/web-traffic/analytics';

// Infrastructure
import { webTrafficService } from '@umituz/web-traffic/infrastructure';
```

## 🧪 Testing

DDD architecture makes testing easy:

```typescript
// Test domain logic in isolation
describe('Session Aggregate', () => {
  it('should maintain event count', () => {
    const session = new Session({ id, deviceId });
    session.addEvent(event1);
    session.addEvent(event2);
    expect(session.getEventCount()).toBe(2);
  });
});

// Mock repositories for testing
class MockEventRepository implements IEventRepository {
  savedEvents: Event[] = [];
  async save(event: Event) {
    this.savedEvents.push(event);
  }
}
```

## 📚 DDD Patterns Used

- ✅ **Bounded Contexts** - Tracking, Conversion, Analytics domains
- ✅ **Aggregates** - Session, Order (consistency boundaries)
- ✅ **Value Objects** - SessionId, Money, UTMParameters (immutable)
- ✅ **Repositories** - Interface/implementation separation
- ✅ **Domain Events** - EventTracked, PageviewTracked
- ✅ **Application Services** - TrackingCommandService (use-cases)
- ✅ **Facade Pattern** - WebTrafficService

## License

MIT
