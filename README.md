# Forge

## Forge nedir?

Forge, kullanıcının hedefi, seviyesi, ekipmanı ve haftalık uygunluğuna göre antrenman planı üreten bir React Native / Expo uygulamasıdır. V1 production runtime yalnızca denetlenmiş stable katalog üstünden çalışır.

## V1 ürün kapsamı

- Stable 26 program kataloğu
- Deterministic recommendation engine
- Workout session ve progression temeli
- AI Hub için kontrollü client/server entegrasyonu
- Premium ve rewarded credit altyapısı

## V1 production dışında bırakılanlar

- 300 programlık generated katalog
- Yoga programları
- Pilates programları
- Legacy 300 runtime import zinciri

## Teknoloji yığını

- Expo 57
- React Native 0.86
- React 19
- TypeScript 6
- Vitest
- ESLint
- RevenueCat
- Supabase
- Upstash Redis

## Kurulum

```bash
npm ci
```

## Development çalıştırma

```bash
npm run start
npm run ios
npm run android
```

## Test ve quality komutları

```bash
npm run typecheck
npm run lint
npm test
npm run check:content
npm run check:repo-hygiene
npm run check:quality
```

## Environment kurulumu

1. `.env.example` dosyasını referans al.
2. Gerekli public değerleri local env veya CI secret alanlarında tanımla.
3. Server secret’larını client tarafına taşıma.

Gerçek API key, canlı RevenueCat key veya gerçek production URL’leri repository’ye yazılmamalıdır.

## Public ve server-only config farkı

Client-public:

- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE`
- `EXPO_PUBLIC_PROGRESSION_WRITES`
- `EXPO_PUBLIC_PURCHASES_ENABLED`
- `EXPO_PUBLIC_RC_IOS_API_KEY`
- `EXPO_PUBLIC_RC_ANDROID_API_KEY`
- `EXPO_PUBLIC_AI_API_URL`
- `EXPO_PUBLIC_PRIVACY_URL`
- `EXPO_PUBLIC_TERMS_URL`
- `EXPO_PUBLIC_SUPPORT_EMAIL`

Server-only:

- `GEMINI_API_KEY`
- `REVENUECAT_SECRET_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Client config `src/config/clientConfig.ts` içinde, server config ise `src/server/serverConfig.ts` içinde doğrulanır.

## Stable 26 katalog kararı

Forge V1 production runtime yalnızca stable 26 template kataloğunu kullanır. Recommendation, exercise referential integrity ve progression akışları bu katalog üstünden çalışır.

## 300 / yoga / Pilates durumu

- 300 dataset production runtime dışında bırakılmıştır.
- Yoga ve Pilates V1 production katalogta yoktur.
- `templates300.generated.ts` ve ilişkili generated runtime dosyaları production kaynaktan çıkarılmıştır.

## Release doğrulama komutları

```bash
npm run check:release-config
npm run check:release-server
npm run check:config-inline
npm run check:release
```

Açıklama:

- `check:release-config`: mobil public config gate
- `check:release-server`: server deploy secret gate
- `check:config-inline`: Expo public env inline smoke testi
- `check:release`: mobile + server gate birleşimi

Gerçek production değerleri yoksa release gate’in başarısız olması beklenebilir. Bu, kalite kapılarının bozuk olduğu anlamına gelmez.

## Güvenlik notları

- Secret değerleri `EXPO_PUBLIC_` önekiyle tanımlanmaz.
- Client bundle içine server secret konmaz.
- Hata mesajları eksik anahtar adını gösterebilir, değerini göstermemelidir.
- Gerçek cihaz release QA’sı yapılmadıysa yapılmış gibi kabul edilmemelidir.

## Roadmap belgeleri

- `docs/roadmap/00_BASELINE.md`
- `docs/roadmap/FORGE_V1_FINAL_ROADMAP.md`

## Durum notu

16 Temmuz 2026 itibarıyla:

- Stable 26 production katalog aktif
- Repo hygiene geçiyor
- Quality gate geçiyor
- `check:expo` patch mismatch konusu Faz 1C kapsamına bırakıldı
# forge-mobile
