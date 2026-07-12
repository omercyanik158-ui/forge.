# Plan: Upstash Redis Rate Limit (E1)

Rate limit'i bellek içi `Map`'ten Upstash Redis'e taşı. Sabit pencere (fixed window)
stratejisi, INCR+EXPIRE (tek pipeline isteği). Upstash yoksa/çökerse bellek içi fallback.

## Kararlar

- **Pencere stratejisi:** Sabit pencere (INCR + EXPIRE). Kayan pencere (sorted set) pahalı
  ve gereksiz — AI limitleri saatlik, küçük hassasiyet farkı önemli değil.
- **Fallback:** Hibrit. Upstash anahtarı varsa Redis (async); yoksa/çökerse bellek içi Map
  (senkron mantık). Geliştiriciler Upstash olmadan yerelde çalışabilir; Upstash çökerse
  uygulama çökmez, limit geçici olarak uygulanmaz.

## Başlangıç durumu (doğrulandı)

- `src/server/rateLimit.ts` — senkron `checkRateLimit(key, limit, windowMs, now?)` + bellek
  `Map`. Kayan pencere (timestamps[] array).
- Tek caller: `app/api/ai-analyze+api.ts:84` (`const rate = checkRateLimit(...)`, `await` yok).
  Başka caller yok (grep ile teyit).
- `tests/rate-limit.test.ts` — 4 senkron test, `now` parametresiyle zaman simülasyonu,
  `clearRateLimitState()` beforeEach.
- `.env.local` Upstash değerleri mevcut, `.env.example` placeholder eklendi, bağlantı PONG aldı.

## Görev 1 — `src/server/rateLimit.ts` yeniden yaz

- `checkRateLimit` → `async` (`Promise<RateLimitResult>`). İmzadan `now` parametresini
  kaldır (sabit pencere artık zaman damgası simülasyonu kullanmıyor).
- **Redis yolu** (Upstash anahtarı varsa):
  - REST pipeline: tek `POST {UPSTASH_REDIS_REST_URL}/pipeline` isteği,
    body `[["INCR", key], ["EXPIRE", key, windowSeconds]]`, header
    `Authorization: Bearer {UPSTASH_REDIS_REST_TOKEN}`.
  - INCR sonucu `count`. `count === 1` ise EXPIRE uygulanır (pipeline her zaman gönderilir,
    EXPIRE yalnızca ilk istekte anlamlı olur — Upstash idempotent).
  - `count > limit` → `{ allowed: false, remaining: 0, retryAfterSeconds: windowSeconds }`.
  - `count <= limit` → `{ allowed: true, remaining: limit - count, retryAfterSeconds: 0 }`.
- **Fallback yolu** (Upstash yoksa veya fetch hata verirse): mevcut bellek `Map` mantığını
  koru, ama sabit pencere basitleştirmesi gerekmez — mevcut kayan pencere yeterli (fallback
  zaten best-effort). `windowSeconds = Math.round(windowMs / 1000)`.
- **Upstash varlık kontrolü:** `process.env.UPSTASH_REDIS_REST_URL` ve `_TOKEN` ikisi de
  doluysa Redis yolu; biri bile eksikse fallback.
- **Hata yönetimi:** Redis fetch try/catch → catch'te fallback'e düş, hatayı yutma
  (console.error ile logla, sonra belleğe düş).
- `clearRateLimitState()` → yalnızca bellek fallback `Map`'ini temizler (Redis verisi
  otomatik EXPIRE ile silinir; manuel temizleme gerekmez).
- Upstash REST pipeline yardımcı fonksiyonu module-scope, ayrı `async function` (testlerde
  mock'lanabilir/aşılabilir).

## Görev 2 — `app/api/ai-analyze+api.ts` çağrıyı güncelle

- Satır 84: `const rate = checkRateLimit(...)` → `const rate = await checkRateLimit(...)`.
- Handler zaten `async` (`export async function POST`), başka değişiklik gerekmez.

## Görev 3 — `tests/rate-limit.test.ts` async + sabit pencere uyumu

- Tüm `checkRateLimit` çağrılarına `await` ekle (test ortamında Upstash anahtarı olmadığı
  için bellek fallback çalışır).
- Mevcut 4 testten `now` argümanlarını kaldır (imzadan kalktı). Zaman simülasyonu yerine
  bellek fallback'in sayaç mantığını test et:
  - izin verir + remaining sayar
  - limit dolunca reddeder (retryAfterSeconds > 0)
  - farklı anahtarlar bağımsız
  - (kayan pencere "pencere geçince açılır" testi: fallback kayan pencere korunduğu için
    zaman simülasyonu yerine fallback mantığıyla uyumlu hale getir — `now` kaldırıldığı için
    bu testi ya `vi.useFakeTimers` ile ya da basit ardışık çağrıyla uyarla)
- `clearRateLimitState()` beforeEach'te kalır (fallback belleği temizler).
- Yeni test: Upstash anahtarı yokken her zaman fallback kullanıldığını doğrula
  (allowed true, remaining azalıyor).

## Görev 4 — `clearRateLimitState` imza uyumu

- Eğer `now` kaldırıldıysa ve başka yer `clearRateLimitState` çağırıyorsa etkilenmez
  (o parametre almıyor). Sadece test beforeEach'i etkilenir — zaten güncelleniyor.

## Doğrulama

- `npm run typecheck` — `checkRateLimit` async dönüşü caller'larda uyumlu (tek caller await'li).
- `npm run lint` — temiz.
- `npm test` — güncellenmiş rate-limit testleri + mevcut 73 test yeşil.
- `npm run check:content` — temiz (mojibake yok).
- `npm run check:expo` — 18/18.

## Riskler

1. **Senkron→asenkron kırılma:** `checkRateLimit` artık Promise döner. `await` eklenmeyen
   caller kırılır. Tek caller `ai-analyze+api.ts` (görev 2'de güncelleniyor). Başka caller
   yok (grep teyit etti).
2. **Upstash ağ gecikmesi:** Her AI analizine ~50-150ms ekler (Avrupa bölgesi). Kullanıcı
   tarafından fark edilebilir ama kabul edilebilir. Fallback (bellek) anlık.
3. **Fallback kayan pencere vs Redis sabit pencere tutarsızlığı:** İki yol farklı pencere
  davranışı gösterir. Bu kabul edilebilir — fallback best-effort, üretimde Redis kullanılır.
4. **Token güvenliği:** `.env.local` `.gitignore`'da gizli (`.env*.local`). Upstash token'ı
   sohbete yapıştırıldı — kullanıcı token'ı Upstash panelinden rotate etmeli.

## Açık sorular

- Yok. Pencere stratejisi (sabit) ve fallback (hibrit) netleştirildi.
