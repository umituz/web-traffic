# TEST_SCENARIOS.md — @umituz/web-traffic

> **Amaç:** Bu doküman, paketin **manuel entegrasyon testi** için gerekli tüm senaryoları içerir. Her senaryo; önkoşullar, adımlar, beklenen sonuç ve başarısızlık kriterlerini açıkça tanımlar.

> **Test ortamı:** Modern tarayıcı (Chrome/Firefox/Safari) + React 18+ uygulaması + çalışan analitik backend.

---

## İçindekiler

1. [Hızlı Başlangıç](#hızlı-başlangıç)
2. [Domain: Tracking](#domain-tracking)
3. [Domain: Conversion](#domain-conversion)
4. [Domain: Affiliate](#domain-affiliate)
5. [Domain: Analytics](#domain-analytics)
6. [Domain Events Subscription](#domain-events-subscription)
7. [Altyapı: HTTP & Retry](#altyapı-http--retry)
8. [Altyapı: Session Persistence](#altyapı-session-persistence)
9. [Auto-Tracking (SPA)](#auto-tracking-spa)
10. [Edge Cases & Hata Yönetimi](#edge-cases--hata-yönetimi)
11. [Production Smoke Tests](#production-smoke-tests)

---

## Hızlı Başlangıç

### Önkoşullar

- Node 22+ kurulu
- Paket build edilebilir: `npm install && npm test && npm run typecheck && npm run lint`
- Bir test uygulaması (`examples/quickstart.tsx`) içinde:

```tsx
import { WebTrafficProvider, useWebTraffic } from '@umituz/web-traffic/presentation';

function App() {
  return (
    <WebTrafficProvider config={{ apiKey: 'test-key', apiUrl: 'http://localhost:3001', autoTrack: true }}>
      <TestHarness />
    </WebTrafficProvider>
  );
}
```

### Mock Backend (Opsiyonel)

```js
// mock-backend.js
const http = require('http');
http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => body += c);
  req.on('end', () => {
    console.log(`[${req.method}] ${req.url}`);
    if (req.url.startsWith('/track')) console.log('  events:', JSON.parse(body).events.length);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{}');
  });
}).listen(3001);
```

Çalıştır: `node mock-backend.js`

---

## Domain: Tracking

### TS-1.1 — `trackEvent` başarılı çağrı

**Önkoşul:** `WebTrafficProvider` mount edildi, session oluştu (UI'da `isInitialized: true`).

**Adımlar:**
1. Bir butona `useWebTraffic().trackEvent('button_click', { id: 'submit' })` bağla
2. Tıkla
3. Network sekmesinde `POST /track` isteğini izle

**Beklenen:**
- HTTP `200 OK`
- İstek body'sinde: `{ events: [{ name: 'button_click', properties: { id: 'submit' }, sessionId: 'session-...', timestamp: <number> }] }`
- localStorage'da `wt_session` anahtarı mevcut

**Başarısızlık:** HTTP `4xx/5xx` veya body'de `error` alanı.

### TS-1.2 — `trackPageView` otomatik navigation izleme

**Önkoşul:** `autoTrack: true`.

**Adımlar:**
1. Uygulamayı `/home` yolunda aç
2. React Router ile `/about`'a navigate ol
3. Backend loglarını kontrol et

**Beklenen:**
- İlk yüklemede 1 pageview (`/home`)
- Navigation sonrası 1 pageview daha (`/about`)

**Başarısızlık:** Navigation tetiklenmediğinde pageview gelmedi.

### TS-1.3 — UTM parametreleri otomatik yakalanır

**Adımlar:**
1. `https://example.com/?utm_source=google&utm_medium=cpc` adresine git
2. `trackPageView()` çağır
3. Backend log'da `utmParameters` alanını kontrol et

**Beklenen:**
```json
{ "utmParameters": { "source": "google", "medium": "cpc", "campaign": null, "term": null, "content": null } }
```

**Başarısızlık:** `utmParameters: null` veya boş.

### TS-1.4 — UTM validation (200 karakter üstü reddedilir)

**Adımlar:**
1. `trackPageView('/x', null, { source: 'a'.repeat(300) })` çağır
2. Sonucu kontrol et

**Beklenen:** `{ success: false, error: 'UTM source exceeds max length of 200 characters' }`

**Başarısızlık:** Hata sessizce yutulursa.

### TS-1.5 — Event ID formatı

**Adımlar:**
1. Bir event track et
2. Backend log'da event'in `id` alanını kontrol et

**Beklenen:** `id` `event-<uuid>` formatında. Pattern: `^event-[a-zA-Z0-9-]+$`

**Başarısızlık:** `id` eksik veya yanlış formatta.

### TS-1.6 — Session yeniden kullanımı (aynı cihaz)

**Önkoşul:** İlk yükleme tamamlandı, `wt_session` mevcut.

**Adımlar:**
1. Sayfayı yenile
2. `wt_session` değerini kontrol et

**Beklenen:** Aynı `sessionId` korunur (30 dakika içinde).

**Başarısızlık:** Her yenilemede yeni session oluşuyor.

### TS-1.7 — Session timeout sonrası yeni session

**Önkoşullar:** `wt_device_id` mevcut, `wt_session` 30+ dakika önce oluşmuş.

**Adımlar:**
1. localStorage'da `wt_session.startTime`'ı eski bir tarihe set et
2. Sayfayı yenile
3. Yeni `wt_session.id`'yi kontrol et

**Beklenen:** Yeni `sessionId` (eski süresi dolmuş sayılır).

---

## Domain: Conversion

### TS-2.1 — `Order.create` geçerli öğelerle

**Adımlar:**
```ts
const order = Order.create({
  sessionId: SessionId.of('session-x'),
  orderId: 'ord-1',
  items: [{ id: 'i1', name: 'X', price: 10, quantity: 2 }],
  currency: 'USD',
});
```

**Beklenen:** `order.getTotal().getAmount() === 20`

**Başarısızlık:** `total` yanlış veya throw.

### TS-2.2 — Currency-specific decimals (JPY, KWD)

**Adımlar:**
```ts
const jpy = Order.create({ ..., items: [{ id: 'i', name: 'X', price: 100.7, quantity: 1 }], currency: 'JPY' });
const kwd = Order.create({ ..., items: [{ id: 'i', name: 'X', price: 1.12345, quantity: 1 }], currency: 'KWD' });
```

**Beklenen:**
- `jpy.getTotal().getAmount() === 101` (0 ondalık)
- `kwd.getTotal().getAmount() === 1.123` (3 ondalık)

**Başarısızlık:** JPY 100.7 → 100.70 dönüyorsa.

### TS-2.3 — Para birimi uyuşmazlığı reddedilir

**Adımlar:**
```ts
const a = Money.of(10, 'USD');
const b = Money.of(5, 'EUR');
a.add(b);
```

**Beklenen:** `Error: Cannot perform operation on USD and EUR`

**Başarısızlık:** Sessiz birleştirme veya NaN.

### TS-2.4 — Boş items reddedilir

**Adımlar:**
```ts
Order.create({ sessionId, orderId: 'o', items: [] });
```

**Beklenen:** `Error: Order must have at least one item`

### TS-2.5 — Negatif fiyat reddedilir

**Adımlar:**
```ts
OrderItem.create({ id: 'i', name: 'X', price: -1, quantity: 1 });
```

**Beklenen:** `Error: OrderItem price cannot be negative`

---

## Domain: Affiliate

### TS-3.1 — Affiliate commission doğru hesaplanır

**Adımlar:**
```ts
const aff = Affiliate.create({ ..., commissionRate: 10 });
aff.addConversion(Money.of(100, 'USD'));
const commission = aff.calculateCommission();
```

**Beklenen:** `commission.getAmount() === 10`

### TS-3.2 — Başka affiliate'in visit'i reddedilir

**Adımlar:**
```ts
const aff = Affiliate.create({ id: AffiliateId.of('a'), ... });
const other = Affiliate.create({ id: AffiliateId.of('b'), ... });
aff.addVisit(makeVisit(other));
```

**Beklenen:** `Error: Visit does not belong to this affiliate`

### TS-3.3 — Inactive affiliate reddedilir

**Adımlar:**
```ts
const aff = Affiliate.create({ ..., active: false });
aff.addVisit(makeVisit(aff));
```

**Beklenen:** `Error: Cannot perform operation on inactive affiliate`

### TS-3.4 — Slug validation

**Adımlar:**
```ts
AffiliateId.of('bad slug!');
AffiliateId.of('a'); // too short
AffiliateId.of('valid-slug-123');
```

**Beklenen:**
- İlk ikisi `Error` fırlatır
- Üçüncüsü başarılı

### TS-3.5 — Conversion rate hesabı

**Adımlar:**
```ts
aff.addVisit(...); aff.addVisit(...); aff.addVisit(...); aff.addVisit(...);
aff.addConversion(Money.of(100, 'USD'));
aff.getStats().conversionRate; // ?
```

**Beklenen:** `25` (1 conversion / 4 visits × 100)

---

## Domain: Analytics

### TS-4.1 — `useAnalytics` başarılı veri çekme

**Adımlar:**
```tsx
function Dashboard() {
  const { data, loading, error } = useAnalytics({
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
  });
  if (loading) return <Spinner />;
  if (error) return <Error msg={error.message} />;
  return <pre>{JSON.stringify(data)}</pre>;
}
```

**Beklenen:**
- İlk render: `loading: true`
- ~100ms sonra: `data` dolu, `loading: false`, `error: null`

### TS-4.2 — `useAnalytics` 404 durumu

**Önkoşul:** Backend `/analytics?start_date=...&end_date=...` 404 dönüyor.

**Beklenen:** `data: null`, `error: null` (404 sessizce null yapılır).

**Başarısızlık:** `error` set edilir.

### TS-4.3 — `useAnalytics` server hatası (500)

**Beklenen:** `error: Error(...)` ile UI'da hata mesajı gösterilir.

### TS-4.4 — `useAnalytics` refetch

**Adımlar:**
1. `useAnalytics` kullanan bir component
2. `refetch()` çağır
3. Yeni istek gönderildiğini doğrula

**Beklenen:** Network tab'de yeni `GET /analytics` isteği.

### TS-4.5 — Query memoization

**Adımlar:**
1. Her render'da yeni obje oluşturan query ile `useAnalytics` çağır
2. Network tab'i izle

**Beklenen:** Sadece 1 istek (memoization çalışıyor).

**Başarısızlık:** Sonsuz istek döngüsü.

---

## Domain Events Subscription

### TS-5.1 — `event.tracked` event'ine abone olma

**Adımlar:**
```ts
const unsub = webTrafficService.on('event.tracked', (e) => {
  console.log('Tracked:', e.payload.name);
});
// trigger event
await trackEvent('test');
// later
unsub();
```

**Beklenen:** Her `trackEvent` çağrısında listener tetiklenir.

### TS-5.2 — Listener hatası diğerlerini kırmaz

**Adımlar:**
```ts
service.on('event.tracked', () => { throw new Error('boom'); });
service.on('event.tracked', () => { /* this should still fire */ });
await trackEvent('test');
```

**Beklenen:** İkinci listener da tetiklenir. Console'da hata loglanır.

### TS-5.3 — `session.started` event'i session oluştuğunda tetiklenir

**Adımlar:**
1. Provider mount et
2. `service.on('session.started', e => log(e.payload.sessionId))` kaydet
3. Session oluştuğunda listener tetiklenmeli

**Beklenen:** Listener 1 kez tetiklenir (sessionId payload'ında).

### TS-5.4 — `tracking.error` event'i hata durumunda

**Adımlar:**
1. Bir event'i yanlış `sessionId` ile tracklemeyi dene
2. `tracking.error` listener'ı tetiklenmeli

**Beklenen:** `{ operation: 'trackEvent', message: '...' }` payload'ı.

---

## Altyapı: HTTP & Retry

### TS-6.1 — HTTP timeout

**Önkoşul:** Backend asla cevap vermiyor (sleep 60).

**Beklenen:** 15 saniye sonra `HttpTimeoutError` fırlatılır, event kuyruğa geri eklenir.

### TS-6.2 — 5xx retry with backoff

**Önkoşul:** Backend 2 kez 503, sonra 200 dönüyor.

**Adımlar:** Event gönder, log'ları izle.

**Beklenen:**
- İlk deneme: 503 → bekle (500ms)
- İkinci deneme: 503 → bekle (1000ms)
- Üçüncü deneme: 200 ✓

**Başarısızlık:** 503 sonrası retry yapılmadan hata fırlatılır.

### TS-6.3 — 4xx retry yapılmaz

**Önkoşul:** Backend 400 dönüyor.

**Beklenen:** Tek deneme sonra `HttpError(400)` fırlatılır. Retry yok.

### TS-6.4 — Event queue overflow

**Önkoşul:** 105 event gönder, batch flush tetikleme.

**Beklenen:**
- Queue max 100
- Console warning: `Queue exceeded 100 items, dropped 5 oldest events`
- İlk 5 event kayıp, son 100 gönderildi

---

## Altyapı: Session Persistence

### TS-7.1 — localStorage corruption recovery

**Adımlar:**
1. `localStorage.setItem('wt_session', 'not json')`
2. Sayfayı yenile
3. `wt_session`'ı kontrol et

**Beklenen:**
- `localStorage.removeItem('wt_session')` çağrıldı
- Yeni session oluşturuldu
- Yeni `wt_session` mevcut

### TS-7.2 — Device ID persistence

**Adımlar:**
1. İlk yükleme → `wt_device_id` oluşur
2. Sayfayı yenile → aynı `wt_device_id`
3. localStorage'ı temizle → yeni deviceId

### TS-7.3 — Cross-tab session (aynı browser, farklı tab)

**Adımlar:**
1. Tab A'da session oluştur
2. Tab B'yi aç
3. Tab B'de aynı session kullanılmalı

**Beklenen:** Her iki tab aynı `sessionId` ile event gönderir.

---

## Auto-Tracking (SPA)

### TS-8.1 — `pushState` navigation

**Adımlar:**
1. SPA'da `history.pushState({}, '', '/new')` çağır
2. Backend log'u kontrol et

**Beklenen:** `POST /track` ile yeni pageview event gönderildi.

### TS-8.2 — `replaceState` navigation

**Adımlar:** `history.replaceState` ile aynı test.

**Beklenen:** Pageview tetiklendi.

### TS-8.3 — `popstate` (back/forward)

**Adımlar:**
1. Bir kaç sayfa gez
2. Tarayıcı "back" tuşuna bas
3. Backend log'u kontrol et

**Beklenen:** Her back/forward'da pageview.

### TS-8.4 — `destroy()` orijinal history'yi geri yükler

**Adımlar:**
1. Service'i başlat
2. `pushState` overridden kontrol et (farklı reference)
3. `webTrafficService.destroy()` çağır
4. `pushState` orijinal referansına eşit mi?

**Beklenen:** `history.pushState === originalPushState` (true).

### TS-8.5 — Auto-track session ready olmadan tetiklenmez

**Adımlar:**
1. `autoTrack: true` ile initialize
2. `SessionManager` async load ederken `triggerInitial` çağrılmamalı
3. Session ready olunca ilk pageview gönderilmeli

**Beklenen:** Sadece 1 pageview (initial) session hazır olduktan sonra.

---

## Edge Cases & Hata Yönetimi

### TS-9.1 — localStorage devre dışı

**Adımlar:**
1. Tarayıcıda localStorage'ı devre dışı bırak
2. Uygulamayı aç
3. track et

**Beklenen:**
- Uygulama çökmez
- In-memory storage'a fallback
- Event'ler normal gönderilir

### TS-9.2 — Çoklu provider (React StrictMode)

**Adımlar:**
1. React StrictMode'da `WebTrafficProvider` iki kez mount olur
2. Service singleton olduğu için ikinci `initialize` no-op
3. İkinci `destroy` cleanup'ı tetikler

**Beklenen:** Tek bir `webTrafficService.initialize()` çağrısı.

### TS-9.3 — Service hata sonrası tekrar kullanılabilir

**Adımlar:**
1. `trackEvent` → başarısız (network hatası)
2. `trackEvent` → tekrar başarısız
3. Backend'i düzelt
4. `trackEvent` → başarılı

**Beklenen:** Service kendini recover eder, kuyruktaki event'ler gönderilir.

### TS-9.4 — UTM with special characters

**Adımlar:**
```ts
UTMParameters.of({ source: '<script>alert(1)</script>' });
```

**Beklenen:** `Error: UTM source contains invalid characters`

### TS-9.5 — Pageview boş path reddedilir

```ts
Pageview.create({ sessionId, siteId, path: '', referrer: null, utmParameters: null });
```

**Beklenen:** `Error: Pageview path cannot be empty`

### TS-9.6 — Boş event name reddedilir

```ts
Event.create({ sessionId, name: '', properties: {} });
```

**Beklenen:** `Error: Event name cannot be empty`

### TS-9.7 — Çok uzun UTM source reddedilir

```ts
UTMParameters.of({ source: 'a'.repeat(201) });
```

**Beklenen:** `Error: UTM source exceeds max length of 200 characters`

---

## Production Smoke Tests

### TS-10.1 — Tam akış

**Adımlar:**
1. Fresh tarayıcı (tüm storage temiz)
2. `https://example.com/?utm_source=test` adresine git
3. 30 saniye bekle
4. Network tab'i kontrol et
5. localStorage'ı kontrol et
6. 30+ saniye daha bekle
7. SPA içinde 3 sayfa gez
8. Backend'de toplam event sayısını kontrol et

**Beklenen:**
- 1 pageview (initial, UTM ile)
- 3 pageview (SPA navigations)
- 4+ pageview toplam
- localStorage'da: `wt_session` ve `wt_device_id`
- Console'da hata yok

### TS-10.2 — 1 saat sonra session yenileme

**Adımlar:**
1. İlk yükleme
2. `wt_session.startTime`'ı 31 dakika önceye set et
3. Bir event trackle
4. Yeni session oluştuğunu doğrula

**Beklenen:** Yeni `sessionId` (eski expired).

### TS-10.3 — Çoklu tab yük testi

**Adımlar:**
1. Aynı anda 5 tab aç
2. Her birinde 10 event track et
3. Backend'de toplam event sayısı

**Beklenen:** ~50 event gönderildi (tüm tab'lar paylaşımlı session/deviceId).

### TS-10.4 — Backend downtime recovery

**Adımlar:**
1. Backend'i kapat
2. 5 event track et
3. Backend'i aç
4. 30 saniye bekle (flush interval)

**Beklenen:**
- Event'ler kuyruğa eklendi
- Backend açılınca kuyruk flush oldu
- 5 event backend'de

### TS-10.5 — Hata durumunda kullanıcı deneyimi

**Adımlar:**
1. Backend 500 dönüyor
2. `trackEvent` çağır
3. UI'da herhangi bir crash var mı kontrol et

**Beklenen:** UI normal çalışır, `result.success === false` döner. Hata loglanır.

---

## Checklist: Dağıtım Öncesi

Tüm senaryolar geçtikten sonra aşağıdaki kontrolleri doğrula:

- [ ] `npm run typecheck` — 0 hata
- [ ] `npm run lint` — 0 hata, 0 uyarı
- [ ] `npm test` — tüm testler geçiyor (DOM-bağımlı 4 test skip)
- [ ] TS-1.1, TS-1.2, TS-1.3 (Temel tracking çalışıyor)
- [ ] TS-2.1, TS-2.2 (Conversion doğru hesaplanıyor)
- [ ] TS-3.1 (Affiliate commission doğru)
- [ ] TS-4.1 (Analytics veri çekiyor)
- [ ] TS-5.1 (Domain events çalışıyor)
- [ ] TS-8.1, TS-8.2 (SPA navigation izleniyor)
- [ ] TS-9.1 (localStorage devre dışı → graceful fallback)
- [ ] TS-10.1 (Tam akış çalışıyor)
- [ ] TS-10.4 (Backend recovery)

---

## Bilinen Sınırlamalar

1. **Cross-tab senkronizasyon:** Aynı domain'deki tab'lar arası `storage` event'leri dinlenmiyor. İki tab aynı session'ı kullanır ama biri tarafından oluşturulan event diğerinin kuyruğunda olmaz.
2. **Offline mode:** İnternet yokken event'ler yalnızca 100'lük kuyrukta tutulur; daha fazlası drop edilir.
3. **Service worker entegrasyonu:** Şu an yok; eklenirse offline queue daha robust olabilir.
4. **GDPR / Consent:** Otomatik tracking başlamadan önce consent yönetimi uygulama katmanının sorumluluğundadır.

---

## Hata Ayıklama

### Console log'ları aktif mi?

Paket aşağıdaki tag'lerle log üretir (kontrol için):

- `[HTTPEventRepository]` — queue/flush/retry
- `[TypedEventEmitter]` — listener hataları
- `[SessionManager]` — listener hataları

Production'da bu log'lar kapatılabilir; şu an debug için aktiftir.

### Sık karşılaşılan sorunlar

| Sorun | Olası sebep | Çözüm |
|-------|-------------|-------|
| Event'ler gelmiyor | `apiUrl` yanlış, CORS | Backend log kontrol |
| Session her sayfada yenileniyor | localStorage temizleniyor | Private mode değil |
| UTM yakalanmıyor | `?utm_...` URL'de değil | Adres çubuğunu kontrol |
| Queue overflow | Çok sık event gönderimi | FLUSH_THRESHOLD artır |
| Listener tetiklenmiyor | `webTrafficService` singleton değil | Tek instance kullan |

---

**Son güncelleme:** 2026-06-07
**Test runner:** `node --test` (built-in)
**Toplam senaryo:** 40+
**Tahmini manuel test süresi:** 45-60 dakika
