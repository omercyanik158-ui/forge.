# FORGE Uçtan Uca Teknik Denetim Raporu

Denetim kapsamı: servis katmanı (48 dosya), ekranlar (~25), premium/purchase akışı,
AI servisleri, bildirim, depolama, test coverage ve i18n. Bulgular 5 başlık altında,
önceliklendirilmiş olarak sunulmuştur.

---

## Başlık 1 — Eksiklik Analizi (kritik modüller/akışlar)

### E1. Rate limit gerçekten çalışmıyor (CRITICAL)
- **Dosya:** `src/server/rateLimit.ts:6`
- **Sorun:** `buckets = new Map()` bellek içi. Expo Router API route'ları serverless/edge
  olarak deploy edildiğinde her cold start'ta bellek sıfırlanır → rate limit bucket'ları
  kaybolur. Free tier saatte 5 istek limiti fiilen uygulanmaz.
- **Etki:** API kötüye kullanımı, Gemini maliyet patlaması, tek IP'den sınırsız istek.
- **Çözüm:** Kalıcı depolama (Upstash Redis, KV, veya en azından Vercel/Edge KV).
  `checkRateLimit` Redis INCR + EXPIRE tabanlı olmalı.

### E2. Entitlement doğrulaması yanlış (CRITICAL)
- **Dosya:** `src/services/purchaseService.ts:110`
- **Sorun:** `Object.keys(active).includes(entitlementId()) || Object.keys(active).length > 0`
  — `||`'dan sonraki koşul **herhangi bir** aktif entitlement'ı premium kabul eder.
  Kullanıcının alakasız/iptal edilmiş başka bir entitlement'ı varsa premium açılır.
- **Çözüm:** Sadece `Object.keys(active).includes(entitlementId())` ile sınırlandır.

### E3. Test coverage release için yetersiz (HIGH)
- **Dosya:** `tests/` (5 dosya, 27 test)
- **Sorun:** 48 servis + 25 ekran var; `calculations.ts`, `programCatalog.ts`,
  `cycleTracking.ts`, `personalCoach.ts`, `trainingAnalysis.ts` gibi çekirdek mantık
  test edilmiyor. Cycle-aware logic (yeni eklediğimiz) test dışında.
- **Çözüm:** Birim test eksiği öncelikli servisler için: calculations, cycleTracking,
  personalCoach (applyCycleIntensity/computeCycleIntensity), trainingAnalysis.

### E4. E2E/device test altyapısı yok (MEDIUM)
- **Sorun:** Brifin 5.1 maddesi "gerçek cihaz UX turu" istiyor ama otomatize edilmiş
  E2E yok (maestro/detox). Release öncesi regression riski yüksek.
- **Çözüm:** Maestro (Expo için en hafif seçenek) ile kritik akışlar: onboarding →
  program başlat → oturum → kaydet.

---

## Başlık 2 — Kod Kalitesi ve Temizlik

### Q1. 3 paralel premium feature sistemi (HIGH)
- **Dosyalar:** `src/services/subscription.ts:15-36` (LEGACY_PREMIUM_FEATURES),
  `src/features/premium/premiumFeatures.ts:10-51` (PREMIUM_FEATURES),
  `src/services/subscription.ts:54-113` (getPremiumFeatureInfo birleştirme)
- **Sorun:** Aynı feature'lar için üç ayrı metin kaynağı. `getPremiumFeatureInfo`
  modern key'leri kontrol edip SONRA legacy kontrolleri de yapıyor — çakışan/tekrarlayan
  metinler. Örn. `premium-programs` hem LEGACY'de hem modern'de farklı summary ile.
- **Çözüm:** LEGACY_PREMIUM_FEATURES ve getPremiumFeatureInfo'nun legacy dallarını kaldır;
  tek kaynak `PREMIUM_FEATURES` olsun. subscription.ts sadece modern sisteme delege etsin.

### Q2. premiumFeatures.ts mojibake (HIGH)
- **Dosya:** `src/features/premium/premiumFeatures.ts:15,21,29,39,45,47`
- **Sorun:** 6 satırda Türkçe karakterler ASCII'ye düşmüş: "Haftalik", "fotografi",
  "Sinirsiz", "bolgeler", "kutuphanesi", "icgoruleri".
- **Neden yakalanmadı:** `quality-check.mjs:6` mojibake pattern'i sadece `Ã.`/`Ä.`/`Å.`
  gibi Latin-1 artifact'leri arıyor; ASCII'ye dönüşmüş Türkçe karakterleri yakalamıyor.
- **Çözüm:** Karakterleri düzelt + quality-check pattern'ini genişlet (ASCII-only Türkçe
  kelime kontrolü: "Haftalik|fotograf|Sinirsiz" gibi bilinen yanlış yazımları tara).

### Q3. 583 inline `{tr,en}` metni kataloğa geçirilmemiş (MEDIUM)
- **Dosya:** `app/**/*.tsx` (en yoğun: program-session, fitness, index, cycle-tracking)
- **Sorun:** AGENTS.md bunu "kademeli geçirin" diyor ama AIHubScreen dışında hiçbiri
  tamamlanmamış. Tek dosyada 30+ inline metin → tutarsızlık ve bakım yükü.
- **Çözüm:** Öncelik: en yoğun ekranlardan başla (program-session ~40, fitness ~35).
  Script yazılabilir: inline `{tr,en}` nesnelerini tespit edip otomatik katalog anahtarı öner.

### Q4. revenueCatService gereksiz wrapper katmanı (LOW)
- **Dosya:** `src/services/revenueCatService.ts` (47 satır, tamamı)
- **Sorun:** `purchaseService`'in her fonksiyonunu 1:1 saran ince wrapper. Hiçbir ekstra
  mantık yok; sadece isim değişimi (purchasePremium → startPremiumPurchase).
- **Çözüm:** Doğrudan `purchaseService` kullan; wrapper'ı kaldır. Çağrı noktalarını güncelle.

---

## Başlık 3 — Hata ve Problem Tespiti

### B1. analyticsService `Function()` constructor (HIGH)
- **Dosya:** `src/services/analyticsService.ts:31`
- **Sorun:** `Function('s', 'return import(s)` — dinamik import workaround. Metro
  bundler bu kalıbı statik analiz edemez → posthog bundle'a dahil edilmeyebilir veya
  production build'de kırılabilir. Ayrıca `Function()` CSP/RETI riski.
- **Çözüm:** `const PostHog = (await import('posthog-react-native')).default` ile standart
  dinamik import. Metro bunu doğru bundle'lar.

### B2. notificationStore adaptive reminder saat kayması (MEDIUM)
- **Dosya:** `src/services/notificationStore.ts:139-142`
- **Sorun:** `syncReminderSchedules` adaptiveReminders açıkken, meal/workout saatini
  her sync'te ortalama saatle değiştirir. Kullanıcının manuel seçtiği saat sessizce
  üzerine yazılır. `next[key].hour === suggested[key]` kontrolü `suggested` compute
  edildikten sonra yapıldığı için ilk koşul her zaman override'a izin verir.
- **Çözüm:** Kullanıcı manuel saat seçtiyse adaptive override'ı devre dışı bırak;
  sadece `hour === DEFAULTS[key].hour` (kullanıcı hiç değiştirmedi) iken adaptive uygula.

### B3. foodApi hata metinleri i18n'siz (LOW)
- **Dosya:** `src/services/foodApi.ts:57,77`
- **Sorun:** `throw new Error('Arama başarısız')` — Türkçe sabit, lokalizasyondan bağımsız.
  İngilizce kullanıcının Türkçe hata görmesi.
- **Çözüm:** Hata kodu fırlat, UI katmanında `t()` ile çevir.

---

## Başlık 4 — Kapsam ve Gereksizlik Denetimi

### R1. `weeklyBalanceAnalysis` ölü premium feature (HIGH)
- **Dosya:** `src/config/premium.ts:20`, `src/features/premium/premiumFeatures.ts:44`
- **Sorun:** Feature key tanımlı, paywall'da gösteriliyor, ama hiçbir `canAccess*`
  gate'inde kullanılmıyor. `trainingInsights` ile örtüşen işlevsellik.
- **Çözüm:** Ya gerçek bir feature olarak bağla (hangi ekranda unlock ediyor?), ya da
  paywall'dan ve tanımlardan kaldır (kullanıcı ödediği özelliği bulamayacak).

### R2. `storageService.ts` vs `storageService.web.ts` ayrımı belirsiz (MEDIUM)
- **Dosyalar:** `src/services/storageService.ts`, `storageService.web.ts`
- **Sorun:** İki dosya ama `safeStorage.ts` zaten AsyncStorage soyutlaması yapıyor.
  storageService'in gerçek sorumluluğu (AIHub log saklama) net değil; üçüncü depolama
  katmanı oluşmuş.
- **Çözüm:** storageService'in sorumluluğunu netleştir; gerekirse safeStorage ile birleştir.

### R3. Fazla ayar ekranı (LOW)
- **Sorun:** `settings-appearance`, `settings-language`, `settings-notifications`,
  `settings-privacy` — 4 ayrı tam ekran. Brifin 9. bölümü "gelişmiş ayarları ana akıştan
  ayır" diyor ama bu kadar parçalanma gezinti maliyeti yaratır.
- **Çözüm:** Tek ayar ekranında bölümler (accordion/section); sadece notification
  gibi karmaşık olan ayrı kalsın.

---

## Başlık 5 — Geliştirme ve İyileştirme Önerileri

### I1. Haftalık koç planı / ilerleme zaman çizelgesi (değerli)
- **Brif referansı:** Bölüm 11 opsiyonel, Bölüm 6.4
- **Öneri:** `personalCoach.ts` zaten weekly snapshot üretiyor; bunu 7 günlük trend
  grafiğiyle göster. Kullanıcı "bu hafta nasıl ilerliyorum" görüyor olmalı.

### I2. Egzersiz değiştirme akışını güçlendir
- **Brif referansı:** Bölüm 9
- **Öneri:** `program-session.tsx:213-240` swap mantığı var ama sınırlı alternatifle.
  Limitasyon (diz/bel/omuz) bazlı otomatik öneri zaten var; ekipman bazlı filtre daha akıllı
  olabilir.

### I3. Boş durum ekranlarını motive edici hale getir (UI polish)
- **Brif referansı:** Bölüm 9.3
- **Öneri:** Hiç kayıt yok, hiç antrenman yok durumları için kişiselleştirilmiş CTA
  ("İlk öğününü ekle" gibi index.tsx'te var) — tüm ekranlara yay.

### I4. Sentry/analytics gerçek entegrasyon doğrulaması
- **Sorun:** errorReporting ve analyticsService no-op değil ama EXPO_PUBLIC_* env'leri
  set edilmediği için fiilen kapalı. Release öncesi gerçek DSN/key'lerle E2E doğrula.

---

## Önceliklendirilmiş Aksiyon Listesi

### P0 — Release öncesi zorunlu (güvenlik/doğruluk)
1. **E2** entitlement bug'ını düzelt (1 satır)
2. **E1** rate limit'i kalıcı depolamaya taşı (Upstash/KV)
3. **Q2** premiumFeatures.ts mojibake'i düzelt + quality-check pattern'i genişlet

### P1 — Release öncesi önemli (tutarlılık)
4. **Q1** 3 paralel premium sistemini tekilleştir (legacy kaldır)
5. **B1** analyticsService `Function()` → standart dinamik import
6. **R1** weeklyBalanceAnalysis: bağla veya kaldır
7. **E3** çekirdek servisler için birim test (calculations, cycleTracking, personalCoach)

### P2 — Sürdürülebilirlik (release sonrası)
8. **Q3** inline metinleri kataloğa geçir (program-session, fitness öncelikli)
9. **B2** notification adaptive override mantığını düzelt
10. **Q4** revenueCatService wrapper'ını kaldır

### P3 — İyileştirme (backlog)
11. **I1** haftalık ilerleme trend görseli
12. **E4** Maestro E2E test altyapısı
13. **R3** ayar ekranlarını birleştir

## Doğrulama
Her P0/P1 işinden sonra: `npm run check:quality` (typecheck + lint + test + content + expo-doctor).
Mojibake fix sonrası: quality-check pattern genişletildiği için mevcut kod tabanında
başka gizli mojibake tespit edilebilir — bunu P0#3 sırasında kontrol et.

## Kapsam dışı (bu denetimde değerlendirilmedi)
- UI/UX görsel tasarım incelemesi (renk, tipografi, animasyon)
- Performans profilleme (gerçek cihaz render/FPS ölçümü)
- Erişilebilirlik (a11y) denetimi — ekran okuyucu testi
- Bundle size analizi
