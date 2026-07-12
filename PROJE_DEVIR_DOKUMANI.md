# FORGE — Proje Devir ve Analiz Dokümanı

> Bu doküman, projeyi sıfırdan devralacak başka bir yapay zeka asistanı (veya geliştirici) için hazırlanmıştır. Amaç: hiçbir önceki bağlamı olmayan bir AI'ın bu dosyayı okuyarak projenin ne olduğunu, hangi teknolojilerle yazıldığını, mimarisinin nasıl kurulduğunu, şu ana kadar neler yapıldığını ve bundan sonra nelere odaklanması gerektiğini anlamasıdır.
>
> Not: Projede bu dokümana ek olarak `yeniplan.md`, `yapilacaklar.md`, `CODE_ARCHITECTURE_AUDIT.md`, `docs/` klasörü gibi başka devir dosyaları da var. Bu doküman onların yerini almaz, en güncel ve en kapsamlı özet olarak eklenmiştir. Çelişki olursa **bu dosyayı** ve dosya tarihini (en güncel commit/oturum) esas al.

---

## 1. Proje Nedir

- **Ürün adı:** FORGE
- **Tip:** Fitness + beslenme + yapay zeka destekli kişisel antrenman/koçluk mobil uygulaması
- **Platformlar:** iOS, Android, (kısmen) Web
- **Diller:** Türkçe (varsayılan) ve İngilizce — kullanıcı ayarlardan değiştirebilir
- **Tema:** Açık ve koyu tema desteği
- **İş modeli:** Freemium — RevenueCat üzerinden abonelik + AdMob ödüllü reklamlarla ek AI analiz hakkı
- **Proje klasörü:** `C:\Users\omercanyanik\Desktop\yenispor - Kopya`
- **Bundle ID:** `com.yenispor.forge`

Uygulamanın 5 ana sekmesi var (`app/(tabs)/_layout.tsx`):

1. **Ana Sayfa** (`index.tsx`) — özet dashboard, streak, kalori/makro halkaları, kişisel koç kartları
2. **Antrenman** (`fitness.tsx`) — kütüphane programları, kullanıcının kendi/AI programları, favori programlar
3. **Beslenme** (`nutrition.tsx`) — günlük öğünler, makrolar, öğün şablonları
4. **AI Hub** (`ai.tsx` → `src/screens/AIHubScreen.tsx`) — fotoğraftan yemek/fizik analizi (Gemini)
5. **Profil** (`profile.tsx`) — istatistikler, başarımlar, ayarlar, premium CTA

---

## 2. Teknoloji Yığını

### Çekirdek
- **Expo SDK:** `~54.0.35` — ⚠️ Expo 54 dokümantasyonu klasik Expo dokümanlarından farklı, kod yazmadan önce `https://docs.expo.dev/versions/v54.0.0/` referans alınmalı
- **React:** `19.1.0`
- **React Native:** `0.81.5` (New Architecture aktif — `newArchEnabled: true`)
- **Expo Router:** `~6.0.24` (dosya tabanlı routing, `app/` klasörü)
- **TypeScript:** `~5.9.3` (strict mode açık)
- **Node:** `>=20` gerekli

### UI / Görsel
- `@expo/vector-icons` (Ionicons)
- `expo-image`, `expo-blur`, `expo-image-manipulator`, `expo-image-picker`
- `react-native-svg`, `@shopify/flash-list`
- `react-native-safe-area-context`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets`
- `react-native-view-shot` (paylaşılabilir grafik/ekran görüntüsü)
- Fontlar: `@expo-google-fonts/inter`, `@expo-google-fonts/montserrat` (iOS'ta SF Pro Rounded, Android'de Montserrat/Inter)

### Cihaz servisleri
- `expo-localization`, `expo-notifications`, `expo-file-system`, `expo-sqlite`, `expo-system-ui`, `expo-constants`, `expo-device`, `expo-application`, `expo-camera` (barkod tarama dahil)

### Satın alma / Reklam / Analytics
- `react-native-purchases` (RevenueCat)
- `react-native-google-mobile-ads` (AdMob — `app.config.js` içinde `EXPO_PUBLIC_ADMOB_ENABLED` ile koşullu eklenir)
- `posthog-react-native` (analytics)
- `@sentry/react-native` (opsiyonel hata raporlama, DSN yoksa no-op)

### Backend / API
- `@upstash/redis` (rate limit + monetization için Redis, yoksa in-memory fallback)
- Gemini API (Google) — sunucu tarafında (`src/server/geminiServer.ts`), API key asla client'a gömülmez

### Test / Kalite
- `vitest` (Node ortamında, RN renderer yok — saf mantık testleri)
- `eslint` (flat config, `eslint-config-expo`)
- `tsc --noEmit` (typecheck)

### Komutlar (`package.json`)
```
npm run start / start:tunnel / android / ios / web
npm run build:exercises      # egzersiz veritabanını dış kaynaktan üretir
npm run typecheck            # tsc --noEmit
npm run lint                 # eslint app src scripts --max-warnings=0
npm run test                 # vitest run
npm run check:content        # scripts/quality-check.mjs (mojibake + i18n denge kontrolü)
npm run check:expo           # npx expo-doctor
npm run check:quality        # yukarıdakilerin hepsi zincirlenmiş — HER DEĞİŞİKLİKTEN SONRA ÇALIŞTIRILMALI
```

### Ortam değişkenleri (`.env`)
- `EXPO_PUBLIC_PEXELS_KEY`, `EXPO_PUBLIC_PURCHASES_ENABLED`
- `EXPO_PUBLIC_RC_IOS_API_KEY`, `EXPO_PUBLIC_RC_ANDROID_API_KEY`, `EXPO_PUBLIC_RC_ENTITLEMENT_ID`, `EXPO_PUBLIC_RC_OFFERING_ID`
- `EXPO_PUBLIC_AI_API_URL`
- `GEMINI_API_KEY` (gizli, sadece server), `GEMINI_MODEL`
- `EXPO_PUBLIC_` ile başlayanlar build-time'da client bundle'a gömülür, diğerleri sadece server tarafında kullanılır

---

## 3. Klasör Yapısı

```
app/                        # Expo Router — her dosya bir route
├── _layout.tsx             # Root layout: fontlar, splash, bildirim, purchases init, tema/i18n provider, onboarding yönlendirmesi
├── (tabs)/
│   ├── _layout.tsx         # Alt sekme tanımı (5 sekme)
│   ├── index.tsx           # Ana Sayfa
│   ├── fitness.tsx         # Antrenman sekmesi (bkz. §9 — çok yakın zamanda kapsamlı yeniden tasarlandı)
│   ├── nutrition.tsx       # Beslenme sekmesi
│   ├── ai.tsx              # AI Hub sekmesi (AIHubScreen'i re-export eder)
│   └── profile.tsx         # Profil sekmesi
├── api/
│   ├── ai-analyze+api.ts          # Gemini yemek/fizik analiz endpoint'i
│   └── ai-rewarded-credit+api.ts  # Ödüllü reklam kredisi grant/sync endpoint'i
└── (diğer ~30 stack ekranı — bkz. §5)

src/
├── components/            # Paylaşılan UI bileşenleri (+ ai-hub/ alt klasörü)
├── config/                 # premium.ts, rewardedAds.ts, analyticsEvents.ts
├── data/                    # exercises.ts (büyük egzersiz kataloğu), exerciseProgrammingMeta.ts
├── features/premium/        # premiumFeatures, usePremiumAccess, paywallCopy
├── providers/                # localization-context.tsx
├── screens/                  # AIHubScreen.tsx
├── server/                    # geminiServer, rateLimit, aiMonetization, revenueCatVerification, upstashRedis
├── services/                  # ~85+ servis modülü (store'lar, iş mantığı, AI motorları)
├── theme/                      # Tasarım tokenları
├── types/                       # AI program + AI hub domain tipleri
└── types.ts                      # Çekirdek domain tipleri (UserProfile, Meal, WorkoutLog, Program, ...)

scripts/                     # quality-check.mjs, release-check.mjs, convert-free-exercise-db.mjs, ...
tests/                        # 24 vitest dosyası
docs/                          # Yayına hazırlık, gizlilik, RevenueCat kurulum dokümanları
```

---

## 4. Ekran Envanteri (`app/`)

### Sekme ekranları
| Route | Açıklama |
|---|---|
| `(tabs)/index.tsx` | Ana sayfa — streak, kalori/makro halkaları, koç kartları, hızlı erişim |
| `(tabs)/fitness.tsx` | Antrenman sekmesi — kütüphane + kendi programların + AI programların hepsi burada (bkz §9) |
| `(tabs)/nutrition.tsx` | Beslenme — günlük öğün listesi, makro takip, şablonlar |
| `(tabs)/ai.tsx` | AI Hub sekmesi girişi |
| `(tabs)/profile.tsx` | Profil, istatistik, ayar linkleri |

### Diğer ekranlar
| Route | Açıklama |
|---|---|
| `onboarding.tsx` | İlk kurulum — vücut ölçüleri, hedef, cinsiyet |
| `ai-program-builder.tsx` | 12 adımlı AI antrenman programı oluşturma sihirbazı |
| `ai-program-detail.tsx` | Üretilen AI programının detayı — haftalık tab, gün kartları, ilerleme (bkz §9) |
| `programs.tsx` | Kütüphane programlarını listeleme/filtreleme |
| `program-detail.tsx` | Kütüphane programı detayı, favorileme, başlatma, premium kilidi |
| `program-session.tsx` | **Aktif antrenman oturumu** — set/tekrar/ağırlık girişi, dinlenme süresi, taslak kaydı |
| `create-workout.tsx` | Kendi antrenmanını oluşturma/düzenleme |
| `workout-log-detail.tsx` | Tamamlanmış antrenman kaydını görüntüleme/düzenleme |
| `workout-progress.tsx` | Haftalık push/pull dengesi, bölge hacmi analizi |
| `strength-progress.tsx` | Egzersiz bazlı güç trendi, paylaşılabilir grafik |
| `personal-coach.tsx` | Kişisel koç — haftalık skor, öneri, ağırlık/öğün önerisi |
| `add-meal.tsx` | Manuel öğün girişi |
| `barcode-scanner.tsx` | Kamera ile barkod tarama → gıda arama |
| `calorie-insights.tsx` | Kalori/makro trend analizi |
| `water-tracking.tsx` | Su takibi (2.25L formatı, 250ml adım) |
| `cycle-tracking.tsx` | Adet döngüsü fazı takibi (sadece kadın profilinde görünür) |
| `goals.tsx` | Kilo/vücut kompozisyonu hedef ayarı |
| `achievements.tsx` | Rozet/streak gamifikasyon |
| `premium.tsx` | Paywall — RevenueCat paketleri, restore |
| `settings-appearance.tsx` | Açık/koyu tema |
| `settings-language.tsx` | Dil + ölçü birimi |
| `settings-notifications.tsx` | Bildirim programı/izinleri |
| `settings-privacy.tsx` | Veri sağlığı, destek, sıfırlama |
| `+not-found.tsx` | 404 |

> **Önemli:** `app/my-workouts.tsx` artık **yok** — içeriği tamamen `(tabs)/fitness.tsx` içine taşındı ve dosya silindi (bkz §9). Eğer eski dokümanlarda (`yeniplan.md` vb.) `my-workouts.tsx` referansı görürsen bunlar güncelliğini yitirmiştir.

---

## 5. Servis Envanteri (`src/services/`)

Tüm kalıcı veri `safeStorage.ts` (AsyncStorage sarmalayıcı, versiyonlu zarf + yedek anahtar) ve `storageRegistry.ts` (merkezi `STORAGE_KEYS` sözlüğü) üzerinden yönetilir.

### Altyapı
`safeStorage.ts`, `storageRegistry.ts`, `storageService.ts` (+`.web.ts`, SQLite tabanlı AI Hub geçmişi), `appReset.ts`, `dataHealth.ts`, `installIdentity.ts`, `errorReporting.ts`, `dateUtils.ts`, `textUtils.ts` (mojibake onarımı), `interactionFeedback.ts`

### Profil / Tercihler
`profileStore.ts`, `appPreferencesStore.ts`, `themeStore.ts`, `notificationStore.ts`, `coachPreferences.ts`

### Beslenme
`mealStore.ts`, `mealTemplateStore.ts`, `mealInsights.ts`, `foodApi.ts`, `calculations.ts` (BMR, kalori, makro, vücut yağı hesapları), `waterStore.ts`

### Antrenman
`workoutStore.ts`, `workoutInsights.ts`, `workoutSessionDraftStore.ts`, `customWorkoutStore.ts`, `strengthProgress.ts`, `trainingAnalysis.ts`, `exerciseCatalog.ts`, `exerciseFavorites.ts`, `achievementStore.ts`

### Programlar (Kütüphane)
`programCatalog.ts` (statik kürasyonlu program kataloğu), `program-localization.ts`, `programProgressStore.ts` (kütüphane + AI programları için `ai:` önekiyle ilerleme takibi), `programFavoriteStore.ts`, `userProgramsStore.ts`

### AI Hub (Fotoğraf Analizi)
`geminiService.ts` (client → `/api/ai-analyze`), `aiImageService.ts`, `aiHubValidation.ts`, `aiHubComparison.ts`, `aiHubFoodScaling.ts`, `aiHubAccess.ts` (client tarafı kullanım penceresi), `aiQuotaGate.ts` (premium/free/rewarded karar mantığı), `aiLimitModalModel.ts`, `ai/promptRegistry.ts` (Gemini prompt şablonları + JSON şemaları)

### AI Program Üretimi (deterministik motor zinciri — bkz §7)
`aiProgramEngine.ts`, `aiProgramDecisionEngine.ts`, `aiProgramGoalRules.ts`, `aiProgramPriorityRules.ts`, `aiProgramRecoveryRules.ts`, `aiProgramSplitRules.ts`, `aiProgramDecisionValidator.ts`, `exerciseKB.ts`, `aiProgramVolumeEngine.ts`, `aiProgramAssemblyEngine.ts`, `aiProgramProgressionEngine.ts`, `aiProgramOrchestrator.ts`, `aiProgramValidator.ts`, `aiProgramExplanation.ts`, `aiProgramSwapService.ts`, `aiProgramEditor.ts`, `aiProgramHistory.ts`, `aiProgramPlateauDetector.ts`, `aiProgramAutoregulation.ts`, `aiProgramEvidenceLayer.ts`, `aiProgramWearableAdapter.ts`, `aiProgramCoachNarrative.ts`, `aiProgramDraftStore.ts`, `aiProgramInstanceStore.ts`, `aiProgramFeedbackStore.ts`

### Monetizasyon
`subscription.ts`, `purchaseService.ts` (RevenueCat), `market.ts` (bölgesel fiyatlama), `rewardedAdService.ts`, `rewardedCreditStore.ts`, `rewardedCreditApi.ts`

### Koç / Döngü / Analytics
`personalCoach.ts`, `cycleTracking.ts`, `analyticsService.ts` (PostHog), `localization.ts`, `messages.ts` (i18n kataloğu — ~2300+ anahtar), `imageApi.ts`, `favoritesRailEvents.ts` (favoriler değişince ekranları anında güncellemek için basit pub/sub event bus)

---

## 6. Bileşen Envanteri (`src/components/`)

| Bileşen | Açıklama |
|---|---|
| `Button.tsx` | Temalı buton (primary/secondary/tertiary, loading, ikon) |
| `Checkbox.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx` | Temel form bileşenleri |
| `GlassCard.tsx` | Buzlu cam efektli veya solid panel kart |
| `ScreenHeader.tsx` | Geri butonlu ekran başlığı |
| `TopBar.tsx` | Ana sayfa üst çubuğu (selamlama + hızlı aksiyon) |
| `ProgressRing.tsx` | Dairesel ilerleme göstergesi |
| `MacroBar.tsx` | Yatay makro besin çubuğu |
| `ProgramCard.tsx` | Program listesi kartı (kalp/favori ikonu artık **sadece** `program-detail.tsx` içinde render edilir — liste görünümlerinde yok) |
| `PremiumFeatureCard.tsx`, `PremiumOfferSummary.tsx` | Premium upsell/paywall bileşenleri |
| `WorkoutSetSummary.tsx` | Set/tekrar/ağırlık özet satırı |
| `ExerciseFilterChips.tsx` | Egzersiz kataloğu filtre çipleri |
| `HydrationBottle.tsx` | Animasyonlu su şişesi görselleştirmesi |
| `AnalysisSummaryCard.tsx`, `AnalysisRegionList.tsx` | Antrenman analizi kartları |
| `AppErrorBoundary.tsx` | Global hata sınırı (retry) |

### `ai-hub/` alt klasörü
`ai-action-button.tsx`, `ai-segmented-control.tsx`, `ai-capture-guidance.tsx`, `ai-image-card.tsx`, `ai-history-card.tsx`, `food-result-card.tsx`, `physique-result-card.tsx`, `AiLimitReachedModal.tsx`

---

## 7. Tema / Tasarım Sistemi (`src/theme/`)

Token tabanlı tasarım sistemi. Styled-components yok, düz RN `StyleSheet` + `createDynamicStyles()` proxy'si (tema değişince stilleri yeniden üretir).

| Dosya | Rol |
|---|---|
| `colors.ts` | Semantik renk paleti (`AppColors`), `lightColors`/`darkColors`, `getThemeMode()`/`setThemeMode()` |
| `spacing.ts` | Adlandırılmış boşluk skalası (`xs`→`sectionGap`), **kritik:** `spacing.screenHeaderOffset` (üst boşluk standardı) ve `spacing.tabContentBottom` (alt boşluk standardı) — yeni ekran yazarken bunlar kullanılmalı, tekrar "üst boşluk fazla" şikayeti yaratılmamalı
| `typography.ts` | Platforma göre font yığınları (iOS: SF Pro Rounded, Android: Montserrat/Inter), display/headline/body/label ölçekleri |
| `radius.ts` | Border radius tokenları |
| `shadows.ts` | `shadowStyle(level)` — sm/md/lg/floating |
| `layout.ts` | Referans cihaz boyutları, maksimum içerik genişliği (430px) |
| `animations.ts` | Süre, opaklık, ölçek, elevation geçiş sabitleri |
| `theme-context.tsx` | `AppThemeProvider` + `useAppTheme()` |
| `dynamic-styles.ts` | `createDynamicStyles(factory)` |

**Önemli renk kuralı:** Projede geçmişte `colors.onSurfaceVariant` (soluk gri/siyah) çok fazla yerde kullanılmıştı ve "soluk/renksiz" görünüyordu. Su takibi, antrenman programı meta bilgileri (kaç hafta/gün/set/dk) gibi yerlerde bu daha koyu `colors.onSurface` tonuna çevrildi. **Yeni bir AI bu paterni bozmamalı** — buton/etiket metinlerinde "soluk" görünüm istenmiyor, `onSurface` tercih edilmeli, `onSurfaceVariant` sadece gerçekten ikincil/pasif bilgi için kullanılmalı.

---

## 8. AI Program Üretim Pipeline'ı

**Mimari:** Tamamen **deterministik, yerel, LLM kullanmayan** bir program üretim motoru. Gemini/LLM **sadece** AI Hub fotoğraf analizinde kullanılır, antrenman programı üretiminde kullanılmaz.

### Fazlar (kod içi yorumlarda "Faz N" olarak adlandırılmış)
```
Kullanıcı Sihirbazı (aiProgramEngine, ai-program-builder.tsx — 12 adım)
    ↓ cevaplar → AIProgramDecisionContext
Faz 3: Decision Engine (aiProgramDecisionEngine)
    → split, hacim yönü, antrenman günü sayısı (goal/priority/recovery/split kuralları)
Faz 4: Exercise KB (exerciseProgrammingMeta.ts + exerciseKB.ts)
    → egzersiz kataloğu üzerine kürasyonlu metadata katmanı
Faz 5: Volume Engine (aiProgramVolumeEngine)
    → kas grubu başına haftalık set hedefi, yorgunluk bütçesi, efor tavanı
Faz 6: Assembly Engine (aiProgramAssemblyEngine)
    → gün başına egzersiz seçimi (compound öncelikli, REDUNDANCY FİLTRESİ, ağrı/ekipman güvenliği)
Faz 7: Progression Engine (aiProgramProgressionEngine)
    → çok haftalık blok, RIR progresyonu, deload haftaları
Faz 8: Orchestrator (aiProgramOrchestrator)
    → 5-7'yi zincirler → AIProgramPlan + açıklama + doğrulama
Faz 9: Editor/Swap/History (aiProgramEditor, aiProgramSwapService, aiProgramHistory)
Faz 10: Adaptif (aiProgramPlateauDetector, aiProgramAutoregulation)
Faz 11: Evidence Layer (aiProgramEvidenceLayer) — şeffaflık/kaynak gösterimi
Faz 12: Wearable Adapter (aiProgramWearableAdapter) — opsiyonel recovery sinyali (varsayılan noop)
Faz 13: Coach Narrative (aiProgramCoachNarrative) — açıklamadan doğal dil özeti
```

### Önemli not — "aynı kas bölgesine çakışan hareket" sorunu
Daha önce bir oturumda AI programı bazen aynı kas alt bölgesine (örn. üst göğüs) hem "dumbbell press" hem "bench press" gibi çok benzer 2 hareket önerebiliyordu. Bu, `aiProgramAssemblyEngine.ts` içindeki redundancy/çeşitlilik filtresiyle **giderildi**. Yeni bir AI bu konuda tekrar şikayet gelirse önce `aiProgramAssemblyEngine.ts` ve `exerciseProgrammingMeta.ts`'deki hareket kategorileme/redundancy mantığına bakmalı.

### Veri akışı
1. `ai-program-builder.tsx` 12 adımlı sihirbazı yürütür
2. Taslak `aiProgramDraftStore`'da saklanır
3. Üretimde: `buildAIProgramDecisionContext` → `buildAIProgramDecisionBlueprint` → `orchestrateAIProgram`
4. Sonuç `aiProgramInstanceStore`'a kaydedilir; ilerleme `programProgressStore` içinde `ai:{id}` anahtarıyla takip edilir
5. Oturum oynatıcı: `program-session.tsx` planı okur, setleri `workoutStore`'a kaydeder

### Egzersiz veri katmanları
- `src/data/exercises.ts` — büyük statik katalog (`npm run build:exercises` ile üretilir)
- `src/data/exerciseProgrammingMeta.ts` — kürasyonlu programlama katmanı (pattern, ağrı, alternatif)
- `src/services/exerciseKB.ts` — metadata sorgu API'si
- `src/services/exerciseCatalog.ts` — arama/lookup

---

## 9. Antrenman (Fitness) Sekmesi — Son Yapılan Kapsamlı Yeniden Tasarım

Bu bölüm özellikle önemli çünkü **çok sayıda ardışık UX iterasyonu** geçirdi. Yeni AI, burada tekrar aynı sorunları çözmeye çalışmamalı.

### 9.1 Önceki durum (sorunlu)
`fitness.tsx` başlangıçta çok kalabalıktı: ayrı `HeaderSection`, `LatestAIProgramSection`, `MyWorkoutsSection` öne çıkan kartı, `MyProgramsSection` grid'i, `ProgramsArea` çift rayı — bilgi mimarisi dağınık, tekrar eden kartlar vardı. Ayrıca ayrı bir `app/my-workouts.tsx` route'u vardı.

### 9.2 Yapılan büyük redesign (ilk tur)
- Kalabalık çoklu bölüm yapısı → kompakt header + tek "Today Card" hero + Quick Actions satırı + koşullu kadın döngü kartı + tek Discover rayı (max 4 kart + "Tümünü gör") ile değiştirildi.
- Duplicated bölümler kaldırıldı/birleştirildi.

### 9.3 İkinci tur — favoriler ve entegrasyon
- "Favorilerim" adında yatay kaydırmalı bir bölüm eklendi (favorilenen kütüphane programları + AI/custom programlar).
- Kalp ikonu ile favorileme `ProgramCard` bileşenine eklendi, sonra **kartların üstünde yanlışlıkla dokunma riski** olduğu için kaldırıldı.
- Favoriler değişince ekranın anında güncellenmesi için `favoritesRailEvents.ts` (basit pub/sub event bus) eklendi ve `fitness.tsx` içinde `subscribeFavoritesRailChange(refreshData)` ile dinleniyor.

### 9.4 Üçüncü tur — final mimari (ŞU ANKİ DURUM)
Kullanıcı, `my-workouts.tsx` ekranının zengin tasarımını (hero, istatistikler, filtre tabları, detaylı kartlar) doğrudan `fitness.tsx`'e taşımak istedi. Yapılanlar:

- **`app/my-workouts.tsx` dosyası tamamen silindi.**
- İçeriği (`PlanHero`, `WorkoutFilterTabs`, `WorkoutCard`, `AIProgramCard`, `CardStat`, `RenameWorkoutModal`) `app/(tabs)/fitness.tsx` içine taşındı ve orada tanımlanıyor.
- Eski `HeaderSection`, `TodayCard`, `FavoritesSection` kaldırıldı; yerine bu zengin "Saved Plans Section" yapısı geldi.
- `FavoriteProgramsSection` — favorilenen kütüphane programlarını gösteren ayrı bölüm olarak kaldı.
- `/my-workouts`'a giden tüm navigasyon referansları (`program-session.tsx`, `create-workout.tsx` içinde) `/(tabs)/fitness` olarak güncellendi.
- `ProgramCard` bileşeninden kalp/favori ikonu **tamamen kaldırıldı** (`isFavorite`, `onToggleFavorite`, `favoriteAccessibilityLabel` prop'ları silindi). **Kalp ikonu artık sadece `app/program-detail.tsx` (programın içine girildiğinde, sağ üstte) gösteriliyor.** Liste/ray görünümlerinde kalp yok — yanlışlıkla favoriden çıkarma riski ortadan kalktı.
- "Favorilerden gizleme" (hide from rail) özelliği tamamen kaldırıldı: `programFavoriteStore.ts`'den `loadHiddenFavoritesRailIds`/`toggleFavoritesRailVisibility` silindi, `storageRegistry.ts`'den `favoritesRailHidden` anahtarı kaldırıldı.
- Eski "Forge Signature" / "AI Signature" kartı (antrenman sekmesinde kalabalık yapan, "kas gelişimi hibrit split" diyen kart) **tamamen kaldırıldı**.

**Sonuç:** Antrenman sekmesi artık tek bir bütünleşik ekran: üstte hero/istatistik, filtre tabları (Tümü/Custom/AI), detaylı program kartları, altta favorilenen kütüphane programları rayı. Kullanıcı AI ile oluşturduğu programı görmek için ayrı bir yere gitmiyor, hepsi aynı sekmede.

---

## 10. AI Program Detay Ekranı (`app/ai-program-detail.tsx`) — UX İyileştirmeleri

Kullanıcı bu ekranın "sıkışık ve dolu" hissettirdiğini belirtti. Yapılan değişiklikler:

- **"Antrenmanımı aç" (secondary CTA) butonu tamamen kaldırıldı** — hem burada hem eski `my-workouts.tsx`'te aynı işi yapan 2 farklı yol vardı, artık tek kaynak `fitness.tsx`.
- **"Neden bu plan" kartı katlanabilir hale getirildi** (`reasonExpanded` state, "Nedenini gör / Gizle" toggle + chevron ikonu) — varsayılan kapalı, ekranı daha az kalabalık gösteriyor.
- **Lineer ilerleme çubuğu → `ProgressRing` (dairesel) bileşenine çevrildi.**
- **`WeekTabs` bileşeni eklendi** — haftalar artık sırayla alt alta listelenmiyor, yatay kaydırmalı tab seçici ile seçiliyor. Tamamlanan haftalarda tik, deload haftalarında nokta işareti gösteriliyor.
- **`DayCard` bileşeni 3 farklı görsel duruma göre aksiyon butonu gösteriyor:**
  - Tamamlanmış → yeşil (`colors.success`) arka plan, checkmark ikonu
  - Bugünkü/sıradaki gün → mavi/primary arka plan, play ikonu, tıklanabilir
  - Kilitli/gelecek gün → gri arka plan, kilit ikonu, tıklanamaz (disabled)
- **Egzersiz önizlemesi (ilk 2 hareket listesi) gün kartlarından kaldırıldı** — artık sadece "X hareket · Y set · Z dk" meta bilgisi gösteriliyor, kart çok daha sade.
- Buton metni **"İlk günü başlat" → "Programı başlat"** olarak değiştirildi.

---

## 11. Diğer Yakın Zamanda Çözülen Sorunlar

- **Program oturumu (`program-session.tsx`) üst/alt boşluk sorunu** giderildi — ortak `spacing.screenHeaderOffset` / `spacing.tabContentBottom` standardına çekildi.
- **Set onaylama bugı:** "sonraki" butonuna basınca, onay okuna basılmadan önceki setleri otomatik onaylanmış gibi davranıyordu — düzeltildi (artık her set açıkça onaylanmalı).
- **Çıkış diyaloğu sadeleştirildi:** Eski "Tamamlananları kaydet / Kaydetmeden sil / Vazgeç" (3 kafa karıştırıcı seçenek) yerine daha net bir akış tasarlandı (kullanıcı ile birlikte alternatif metinler değerlendirildi).
- **Su takibi renk düzeltmesi:** "Suyu sıfırla" ve "-250ml" butonlarındaki soluk/renksiz görünüm, uygulamanın koyu siyah tonuna (`colors.onSurface`) çekildi.
- **"Program Kütüphanesi" ekranındaki boş kutu** (sağ üst) incelendi/temizlendi.
- **Renk tutarlılığı taraması:** `onSurfaceVariant` kullanılan tüm ekranlar (antrenman programı meta bilgileri, beslenme sekmesi dahil) taranıp gerçekten ikincil olmayan metinler `onSurface`'e çevrildi.

---

## 12. Backend / Server

### API route'ları (`app/api/`)
| Route | Metod | Açıklama |
|---|---|---|
| `ai-analyze+api.ts` | POST | Yemek (1 fotoğraf) veya fizik (2 fotoğraf, 18+ onay) analizi — Gemini üzerinden |
| `ai-rewarded-credit+api.ts` | POST/GET | Ödüllü reklam kredisi verme/senkronizasyon |

### Server modülleri (`src/server/`)
| Dosya | Amaç |
|---|---|
| `geminiServer.ts` | Gemini API çağrıları, güvenlik ayarları, JSON şema zorunluluğu |
| `aiMonetization.ts` | Sunucu tarafı AI kota mantığı (free/premium limitleri), ödüllü kredi verme, idempotency (Upstash Redis veya in-memory fallback) — **asıl otorite burası** |
| `rateLimit.ts` | IP bazlı rate limiter (Upstash Redis INCR veya in-memory) — mevcut ve test edilmiş ama şu an `ai-analyze+api.ts`'e doğrudan bağlı değil, kota `aiMonetization` ile yönetiliyor |
| `revenueCatVerification.ts` | Sunucu tarafı premium doğrulama (RevenueCat REST API, 5 dk cache) |
| `upstashRedis.ts` | Redis client yardımcı |
| `serverLogger.ts` | Server hata loglama |

### Kota limitleri (`aiMonetization.ts`)
- **Free:** pencere başına 1 yemek + 1 fizik; saatte 5, günde 10 toplam
- **Premium:** pencere başına 5 yemek + 3 fizik; saatte 20, günde 50
- Ödüllü krediler limiti bypass eder (günlük grant tavanı: 3)

---

## 13. State Management Yaklaşımı

**Zustand veya Redux yok.** Kullanılan pattern:

1. Her domain için **AsyncStorage tabanlı `*Store.ts` servis modülü** — async `load*`/`save*` fonksiyonları export eder
2. `safeStorage.ts` — versiyonlu zarf + yedek anahtar + validasyon ile birleşik persistence katmanı
3. `storageRegistry.ts` — tüm storage anahtarlarının tek doğruluk kaynağı
4. Cross-cutting UI state için **React Context**: `LocalizationProvider`, `AppThemeProvider`
5. Ekran-lokal `useState` — ekranlar `useFocusEffect` ile focus'ta veri yükler, store fonksiyonlarıyla mutasyon yapar
6. Anlık senkronizasyon gereken durumlarda basit event bus pattern (`favoritesRailEvents.ts`) kullanılıyor — yeni benzer ihtiyaç çıkarsa bu pattern'i tekrar kullan, yeni bir state kütüphanesi ekleme.

### Store pattern örneği
```typescript
// loadStoredValue({ key, fallback, validate }) → tipli veri döner
// saveStoredValue(key, value) → zarfla birlikte kaydeder
// removeStoredValue(key) → ana + yedek anahtarı temizler
```

Özel depolar: AI Hub logları SQLite (`expo-sqlite`) + dosya sistemi (`storageService.ts`); sunucu kotası Upstash Redis (prod) veya in-memory Map (dev fallback).

---

## 14. i18n (Yerelleştirme) Sistemi

- **`src/services/messages.ts`** — merkezi katalog, nokta notasyonlu anahtarlar (`"ai_hub.title"`), her girişte `{ tr: string, en: string }`
- **KURAL:** Yeni görünür metinler asla inline `{ tr, en }` yazılmamalı, katalog anahtarı olarak eklenmeli ve `t('namespace.key')` ile çağrılmalı
- `t()` (useAppLocalization) hem katalog anahtarını (string) hem eski inline nesneyi kabul eder — eski kod kırılmaz ama yeni kod katalog kullanmalı
- `npm run check:content` — `tr`/`en` dengesini ve boş çeviri olup olmadığını doğrular, CI'da otomatik çalışır
- **Dead code temizliği:** Son oturumda `fitness.*` ve `ai_program.detail_*` altında yaklaşık 45 kullanılmayan i18n anahtarı tespit edilip silindi (my-workouts entegrasyonu ve UI sadeleştirmeleri sonrası artık referans edilmiyorlardı). Yeni bir AI kod silerken/değiştirirken **kullanılmayan i18n anahtarlarını da temizlemeli.**
- `src/providers/localization-context.tsx` → `LocalizationProvider`, `useAppLocalization()` → `{ t, preferences, resolved, setLanguagePreference, setMeasurementPreference }`
- `src/services/localization.ts` → cihaz + kullanıcı tercihi birleştirme, birim dönüşümü (kg/lb, cm/in, ml/fl oz), tarih/sayı formatlama
- `repairText()` (`textUtils.ts`) — ekranda gösterilen metinlerdeki bozuk karakterleri (mojibake) onarır

---

## 15. Premium / Monetizasyon Modeli

### Abonelik (RevenueCat)
- Client: `purchaseService.ts` (`react-native-purchases` init, paket yükleme, satın alma/restore)
- Server: `revenueCatVerification.ts` — client'ın gönderdiği `premium` flag'ini kabul etmeden önce doğrular
- Profil: `profile.subscription === 'premium'` (`subscription.ts`)
- Config: `src/config/premium.ts` (env'den entitlement/offering/package ID'leri)
- Kilitli özellikler: fizik AI analizi, yemek AI analizi (arama), antrenman içgörüleri, premium kütüphane programları
- Paywall: `app/premium.tsx` (+`PremiumOfferSummary`)

### AI Kotası (Free vs Premium)
- Client gate: `aiQuotaGate.ts` (premium → free kota → ödüllü kredi sırasıyla kontrol eder)
- Server gate: `aiMonetization.ts` (otorite burası)
- Ödüllü reklam akışı: kota dolunca `AiLimitReachedModal` "reklam izle, +1 hak kazan" seçeneği sunar

### Reklamlar (AdMob)
- Config: `src/config/rewardedAds.ts` (günlük tavan: 3, kredi tipleri, test ad unit ID'leri)
- Client: `rewardedAdService.ts` (`__DEV__`'de mock)
- Krediler: `rewardedCreditStore.ts` (client) + `ai-rewarded-credit+api.ts` (server, idempotent grant)

### Analytics
PostHog (`analyticsService.ts`), olay kataloğu `src/config/analyticsEvents.ts`

---

## 16. Test Altyapısı

**Runner:** `vitest run` (Node ortamı, RN render yok — saf mantık/servis testleri)
**Konum:** `tests/*.test.ts` (24 dosya)

Kapsanan alanlar: `core`, `calculations`, `cycle-tracking`, `training-analysis`, `program-catalog`, `exercise-kb`, tüm AI program motorları (`engine`, `orchestrator`, `assembly`, `volume`, `progression`, `edit`, `swap`, `adaptive`, `coach`, `evidence`, `wearable`), `ai-hub`, `personal-coach` (+ `snapshot`), `premium-stack`, `rewarded-ads`, `rate-limit`, `i18n`.

Her kod değişikliğinden sonra ilgili testler + `npm run check:quality` çalıştırılmalı.

---

## 17. Kritik Config Dosyaları

| Dosya | Önemli ayarlar |
|---|---|
| `app.json` | Expo 54, `newArchEnabled: true`, scheme `forge`, iOS/Android bundle ID, plugin listesi (router, fonts, notifications, camera, Sentry, AdMob), web bundler `metro`/`server` |
| `app.config.js` | `EXPO_PUBLIC_ADMOB_ENABLED`'a göre koşullu AdMob plugin enjeksiyonu |
| `tsconfig.json` | `strict: true`, path alias `@/*` → `./src/*` |
| `babel.config.js` | `babel-preset-expo` + `module-resolver` (`@` → `./src`) |
| `eslint.config.js` | Flat config, `eslint-config-expo` genişletir |
| `vitest.config.ts` | Node ortamı, `@` alias `src/`'e |

---

## 18. Proje Kuralları (Her Zaman Uygulanmalı)

Bu kurallar `.cursor/rules/project.mdc` ve `AGENTS.md` dosyalarından — **her yeni AI/geliştirici bunlara uymalı**:

1. Sadece görev için gereken dosyaları oku, tüm repoyu tarama, alakasız klasörlere girme.
2. Minimum sayıda dosya değiştir, mümkün olan en küçük diff'i üret.
3. Mevcut bileşen/servisleri tekrar kullan, ikinci bir doğruluk kaynağı (duplicate state/logic) yaratma.
4. Mimariyi koru — yeni kütüphane/bağımlılık eklemeden önce sor, klasör yapısını değiştirmeden önce sor.
5. TypeScript: `any` kullanma, tipleri sıkı tut, hataları susturmadan kökten çöz.
6. Zustand yok — state merkezi ve tekilleştirilmiş kalmalı (mevcut store pattern'i kullan).
7. Premium/reklam/limit dokunulduğunda: abonelik durumu, restore akışı, free limit, günlük limit, reklam ödül istismarı, server-side doğrulama kontrol edilmeli.
8. Bug fix'lerde kök nedeni bul, sadece semptomu yamama; benzer kodda aynı hata var mı kontrol et.
9. Bitirmeden önce: kullanılmayan import/ölü kod temizle, karmaşık mantığı sadeleştir, tekrar eden kodu azalt.
10. Yeni metin eklerken `src/services/messages.ts`'e hem `tr` hem `en` ekle.
11. Yeni ekranlarda üst boşluk için `spacing.screenHeaderOffset`, alt boşluk için `spacing.tabContentBottom` kullan.
12. Kod değiştirdikten sonra `npm run check:quality` temiz geçmeli.

---

## 19. Bilinen Riskler / Dikkat Edilmesi Gerekenler

- Gerçek cihaz UX turu henüz sistematik yapılmadı (emülatör/kod incelemesiyle ilerlendi).
- RevenueCat App Store / Play Store ürünleriyle tam bağlanmadı — sadece kod altyapısı hazır, gerçek sandbox testi gerekiyor.
- `rateLimit.ts` yazılmış ve test edilmiş ama `ai-analyze+api.ts`'e doğrudan bağlı değil; kota mantığı `aiMonetization.ts` üzerinden yürütülüyor — bu ikisinin birbirini nasıl tamamladığı/tamamlamadığı gözden geçirilmeli.
- Kullanıcı verileri tamamen local-first, cloud backup yok.
- Egzersiz veri setinin ticari kullanım lisansı release öncesi tekrar teyit edilmeli.
- Bu oturumda shell/terminal aracı ortamda bazen exit code döndürmüyordu; kod değişiklikleri bu yüzden çoğunlukla **manuel dosya okuma ile doğrulandı**, otomatik `npm run check:quality` çalıştırılamadı bazı turlarda. Yeni AI ortama geçtiğinde önce `npm run check:quality`'yi çalıştırıp gerçekten temiz geçtiğini teyit etmeli.

---

## 20. Şimdiye Kadar Yapılmayan / Bundan Sonraki Öncelikli İşler

Aşağıdaki liste, `yapilacaklar.md` dosyasındaki 15 maddelik UX/onboarding planından **henüz tamamlanmamış veya kısmen tamamlanmış** kalan kısımları ve bu oturumdan çıkan yeni fikirleri birleştirir.

### 20.1 Gerçek cihaz doğrulaması (yapılmadı)
- [ ] Onboarding, AI Hub, program başlatma, program oturumu, su takibi, premium geçişleri, kişisel koç, döngü takibi akışlarını gerçek cihazda tek tek aç ve test et.
- [ ] Her ekranda kullanıcı ilk 2-3 saniyede ne yapacağını anlayabiliyor mu kontrol et.

### 20.2 Metin/dil tutarlılığı
- [ ] Bozuk Türkçe karakter taraması (mojibake) tekrar yap — özellikle AI Hub hata mesajlarında.
- [ ] Aynı anlama gelen farklı buton isimlerini birleştir.
- [ ] Fazla teknik/soğuk metinleri insani hale getir.

### 20.3 Premium akışı doğrulaması
- [ ] Paywall, restore purchase, entitlement, ilk ücretsiz analiz limiti gerçek sandbox hesabıyla test edilmeli.
- [ ] Premium olmayan kullanıcının kilitli özellik karşısında ne gördüğü tekrar gözden geçirilmeli.

### 20.4 Bildirim ve akıllı hatırlatmalar
- [ ] Hiç log girmeyen / sadece su takibi yapan / aktif spor yapan kullanıcı senaryolarına göre bildirim davranışı farklılaştırılabilir mi değerlendir (şu an sabit saatli, davranışsal değil).

### 20.5 Ana sayfa ve koç sadeleştirmesi
- [ ] Ana sayfa otomatik kart sıralamasını gerçek kullanım verisine göre ince ayarla.
- [ ] Koç kartları arasında tekrar eden bilgi varsa azalt.
- [ ] "Bugün ne yapmalıyım?" mantığını daha da netleştir.

### 20.6 Döngü (cycle) odaklı deneyim
- [ ] Döngü fazına göre tempo önerisi şu an sadece bilgi kartı seviyesinde — period/luteal fazda otomatik olarak daha hafif program davranışı (set/tekrar/hacim otomatik düşürme) değerlendirilebilir.
- [ ] Follicular fazda progresyonu öne çıkaran mantık düşünülebilir.

### 20.7 AI Hub sadeleştirmesi
- [ ] İlk ekranı bir tur daha sadeleştir.
- [ ] Sonuç ekranlarında "düzenle / kaydet / devam et" hiyerarşisini netleştir.
- [ ] AI hata mesajlarını son kullanıcı diliyle iyileştir.

### 20.8 Genel UI/UX törpüleme
- [ ] Profil sekmesini daha net grupla, gelişmiş ayarları ana akıştan ayır.
- [ ] Boş durum (empty state) ekranlarını daha motive edici hale getir.
- [ ] Her ekranda tek bir ana aksiyon mantığı olduğunu doğrula.

### 20.9 Release hazırlığı
- [ ] Development build ile AI ve premium akışlarını tekrar dene (Expo Go yerine).
- [ ] Store bağlantılarını tamamla (App Store + Play Store abonelik ürünleri, RevenueCat offering/entitlement eşleşmesi).
- [ ] Egzersiz veri seti lisans kontrolünü release öncesi tekrar teyit et.
- [ ] Son QA turunu checklist mantığıyla bitir (`docs/QA_CHECKLIST.md` mevcut, güncellenmeli).

### 20.10 Bu oturumdan çıkan ek gözlem
- [ ] `fitness.tsx` artık çok büyük tek bir dosya (my-workouts entegrasyonu sonrası ~1070 satır). İleride bileşenlere bölünmesi (örn. `PlanHero`, `WorkoutFilterTabs`, `WorkoutCard`, `AIProgramCard` ayrı dosyalara taşınabilir) maintainability açısından değerlendirilebilir — ama bu **sadece performans/bakım nedeniyle gerekirse** yapılmalı, gereksiz refactor yapılmamalı.
- [ ] Çıkış diyaloğu (exit confirmation) için nihai metin/buton kararı netleştirilip uygulanmalı (kullanıcıyla üzerinde konuşulan alternatifler var ama net karar/implementasyon henüz teyit edilmedi — bu maddeyi devralan AI, konuşma geçmişini kontrol ederek hangi seçeneğin seçildiğini teyit etmeli).

---

## 21. Hızlı Referans Tablosu

| İhtiyaç | Nereye bak |
|---|---|
| Yeni ekran ekle | `app/*.tsx` (Expo Router dosyası = route) |
| Yeni metin ekle | `src/services/messages.ts` (hem `tr` hem `en`) |
| Veri kalıcılığı | Yeni `*Store.ts` + `safeStorage` + `storageRegistry.ts`'e anahtar kaydı |
| Bileşene tema uygula | `useAppTheme()` + `createDynamicStyles()` |
| AI fotoğraf analizi | `AIHubScreen` → `geminiService` → `/api/ai-analyze` |
| AI program üretimi | `ai-program-builder` → `aiProgramOrchestrator` (LLM yok, deterministik) |
| Premium kontrolü | `isPremium(profile)` / `usePremiumAccess(feature, profile)` |
| Antrenman sekmesi | `app/(tabs)/fitness.tsx` (my-workouts içeriğini de barındırıyor) |
| AI program detay ekranı | `app/ai-program-detail.tsx` (WeekTabs, DayCard, ProgressRing) |
| Kalite kontrolü | `npm run check:quality` (PR/commit öncesi zorunlu) |
| Path alias | `@/` → `src/` |

---

*Bu doküman [proje analiz oturumu](d7197b99-e260-47e6-b734-fb39af2cd419) sonunda, projenin o anki gerçek kod durumu incelenerek hazırlanmıştır.*
