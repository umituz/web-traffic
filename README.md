# @umituz/web-traffic

Web analytics tracking library built with **Domain-Driven Design (DDD)** principles. Track pageviews, events, sessions, conversions, and affiliate referrals with clean architecture.

## 🎯 Features

- **✨ DDD Architecture** - Clean separation of domains, aggregates, and value objects
- **🎯 Event & Pageview Tracking** - Track user interactions and page views
- **📊 Session Management** - Automatic session creation with entry/exit page tracking
- **🔍 UTM Parameters** - Value object-based campaign tracking
- **💰 Conversion Tracking** - Order aggregate with Money value object
- **🎯 Affiliate System** - Track referrals with commission calculation
- **🌐 Multi-site Support** - Track multiple websites with SiteId
- **📱 Enhanced Device Detection** - Browser, OS, and device type tracking
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
│   │   ├── value-objects/     # SessionId, EventId, UTMParameters, DeviceInfo
│   │   ├── repositories/      # Repository interfaces
│   │   ├── events/            # Domain events
│   │   └── application/       # Command services
│   ├── conversion/            # Conversion Bounded Context
│   │   ├── aggregates/        # Order
│   │   ├── entities/          # OrderItem
│   │   ├── value-objects/     # Money
│   │   ├── repositories/      # Repository interfaces
│   │   └── events/            # Domain events
│   ├── affiliate/             # Affiliate Bounded Context
│   │   ├── aggregates/        # Affiliate (commission tracking)
│   │   ├── entities/          # AffiliateVisit
│   │   ├── value-objects/     # AffiliateId, SiteId
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
  DeviceInfo
} from '@umituz/web-traffic/tracking';
import { Money } from '@umituz/web-traffic/conversion';
import { SiteId } from '@umituz/web-traffic/affiliate';

// Value objects ensure validity
const sessionId = new SessionId('session-123'); // Validates format
const utm = UTMParameters.fromURLSearchParams(searchParams);
const deviceInfo = DeviceInfo.fromUserAgent(navigator.userAgent);

// Money value object prevents invalid amounts
const total = new Money(99.99, 'USD');
const tax = total.multiply(0.1);
const final = total.add(tax);

// Multi-site support
const siteId = new SiteId('site-myapp1');
```

### Work with Aggregates

```typescript
import { Session } from '@umituz/web-traffic/tracking';
import { Order } from '@umituz/web-traffic/conversion';
import { Affiliate } from '@umituz/web-traffic/affiliate';

// Session aggregate maintains consistency
const session = new Session({
  id: SessionId.generate(),
  deviceId: 'device-123',
  siteId: new SiteId('site-abc'),
  deviceInfo: DeviceInfo.fromUserAgent(navigator.userAgent)
});

session.addEvent(event);
session.addPageview(pageview);

// Session journey tracking
session.getEntryPage(); // '/home'
session.getExitPage();  // '/checkout'

// Session enforces business rules
if (session.isExpired()) {
  throw new Error('Session expired');
}

session.close(); // Cannot add more events

// Affiliate aggregate
const affiliate = new Affiliate({
  id: AffiliateId.fromSlug('partner123'),
  siteId: new SiteId('site-abc'),
  name: 'Partner ABC',
  slug: 'partner123',
  commissionRate: 10, // 10%
});

affiliate.addVisit(visit);
affiliate.addConversion(revenue);
const commission = affiliate.calculateCommission();
```

## 📦 Subpath Exports

```typescript
// Presentation (React hooks & Provider)
import { WebTrafficProvider, useWebTraffic } from '@umituz/web-traffic/presentation';

// Tracking Domain
import {
  Session,
  SessionId,
  EventId,
  UTMParameters,
  DeviceInfo
} from '@umituz/web-traffic/tracking';

// Conversion Domain
import { Order, Money } from '@umituz/web-traffic/conversion';

// Affiliate Domain
import { Affiliate, AffiliateId, SiteId } from '@umituz/web-traffic/affiliate';

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

- ✅ **Bounded Contexts** - Tracking, Conversion, Analytics, Affiliate domains
- ✅ **Aggregates** - Session, Order, Affiliate (consistency boundaries)
- ✅ **Value Objects** - SessionId, EventId, UTMParameters, DeviceInfo, Money, SiteId (immutable)
- ✅ **Repositories** - Interface/implementation separation
- ✅ **Domain Events** - EventTracked, PageviewTracked, ConversionRecorded
- ✅ **Application Services** - TrackingCommandService (use-cases)
- ✅ **Facade Pattern** - WebTrafficService

## 🚀 Features from Traffic-Source Integration

This package integrates best practices from [traffic-source](https://github.com/mddanishyusuf/traffic-source):

- ✅ **Affiliate Tracking** - Track referrals with `?ref=` parameter
- ✅ **Multi-site Support** - Manage multiple websites with SiteId
- ✅ **Enhanced Device Detection** - Browser, OS, and device type detection
- ✅ **Session Journey** - Track entry/exit pages
- ✅ **Real-time Session Management** - Session aggregate with timeout handling

## License

MIT
