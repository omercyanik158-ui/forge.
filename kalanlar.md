# FORGE Kalanlar

Bu dosya, projede şu ana kadar tamamlanan işleri ve bundan sonra kalan adımları tek yerde toplar.

## Mevcut Durum Özeti

Tamamlanan ana işler:

- Expo SDK yükseltmesi `54 -> 55 -> 56 -> 57` tamamlandı.
- Expo, React Native ve ilgili native bağımlılıklar hedef SDK ile hizalandı.
- Auth altyapısı eklendi:
  - Supabase client
  - session provider
  - Google ile giriş
  - Apple ile giriş
  - guest/local-only devam etme
- Yeni `welcome` giriş ekranı eklendi ve görsel olarak rafine edildi.
- Uygulama akışı güncellendi:
  - session yoksa `welcome`
  - session var ama profil/onboarding eksikse `onboarding`
  - session ve profil varsa uygulama sekmeleri
- Full sync altyapısı eklendi:
  - local snapshot export/import
  - Supabase `user_profiles`
  - Supabase `user_snapshots`
  - Supabase `subscription_state`
- RevenueCat kimliği authenticated kullanıcı ile ilişkilendirilecek şekilde güncellendi.
- Profil ekranı sadeleştirildi:
  - tekrar eden `Account and sync` satırı kaldırıldı
  - signed-in kullanıcı için `Hesaptan çık`
  - guest kullanıcı için `Hesap ekle`
- Reset profile işlemi profil ekranı altından alınarak gizlilik ekranına taşındı.
- Welcome ekranının dikey boşluk ve görsel dengesi iyileştirildi.
- `npm run typecheck` geçiyor.
- `npm run lint` geçiyor.

## Kod Tarafında Yapılan Dosya Bazlı Büyük Değişiklikler

Yeni eklenen başlıca dosyalar:

- `app/welcome.tsx`
- `src/providers/auth-context.tsx`
- `src/services/accountIdentity.ts`
- `src/services/authStorage.ts`
- `src/services/cloudSync.ts`
- `src/services/supabase.ts`
- `src/types/auth.ts`

Güncellenen başlıca dosyalar:

- `app/_layout.tsx`
- `app/(tabs)/profile.tsx`
- `app/settings-privacy.tsx`
- `src/services/purchaseService.ts`
- `src/services/profileStore.ts`
- `src/screens/AIHubScreen.tsx`
- `src/services/messages.ts`
- `src/types.ts`
- `src/theme/shadows.ts`
- `app.json`
- `package.json`
- `package-lock.json`

Ek olarak commitlenmemiş performans/temizlik işleri de mevcut:

- `app/create-workout.tsx`
- `src/services/aiQuotaGate.ts`
- `src/services/exerciseCatalog.ts`
- `docs/RELEASE_PERFORMANCE_CLEANUP_REPORT.md`

## Ortam ve Konfigürasyon Notları

Supabase public env değerleri local geliştirme için `.env.local` içine alındı:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Önemli:

- Expo dev server açıkken env değişikliği algılanmayabilir.
- Bu nedenle auth testlerinden önce uygulama şu komutla temiz başlatılmalı:

```bash
npx expo start --clear
```

## Şu Anda Kalanlar

Kod yazımı açısından ana sistem büyük ölçüde tamamlandı. Kalan işler daha çok doğrulama, entegrasyon testi ve üretime hazırlık tarafında.

### 1. Expo restart ve env doğrulaması

Yapılacak:

- mevcut Expo sürecini kapat
- `npx expo start --clear` çalıştır
- uygulamanın yeniden ayağa kalktığını doğrula

Başarı kriteri:

- Google login başlatılırken artık `Supabase is not configured` hatası görülmemeli

### 2. Supabase auth redirect doğrulaması

Kontrol edilecek:

- Supabase Auth provider ayarlarında `forge://auth/callback` izinli redirect olarak kayıtlı mı

Başarı kriteri:

- Google veya Apple login sonrası uygulama callback ile geri açılmalı

### 3. Google login gerçek akış testi

Test senaryosu:

- `welcome` ekranına git
- `Continue with Google` ile giriş yap
- yeni kullanıcı ise onboarding’e düş
- geri dönen kullanıcı ise doğrudan uygulamaya gir

Başarı kriteri:

- session oluşmalı
- uygulama route guard doğru çalışmalı
- hata ekranı çıkmamalı

### 4. Apple login gerçek akış testi

Test senaryosu:

- iOS dev build üzerinde `Continue with Apple`

Başarı kriteri:

- session oluşmalı
- onboarding veya uygulama sekmelerine doğru yönlenmeli

Not:

- Bu test Expo Go yerine dev build ile daha güvenilir olur

### 5. Guest -> account migration testi

Test senaryosu:

- guest olarak uygulamayı kullan
- local veri oluştur
- sonra hesap ekleyerek giriş yap

Beklenen:

- local veriler kaybolmamalı
- ilk sync sırasında uygun şekilde cloud’a taşınmalı

### 6. İkinci cihaz / yeniden kurulum testi

Test senaryosu:

- aynı hesapla başka cihazda veya temiz kurulumda giriş yap

Beklenen:

- remote snapshot local cihaza hydrate edilmeli
- profil ve kullanıcı verileri geri gelmeli

### 7. RevenueCat hesap bağlama testi

Test senaryosu:

- guest kullanıcıda premium/entitlement varsa
- sonra authenticated hesaba geç

Beklenen:

- RevenueCat identity authenticated kullanıcıya bağlanmalı
- restore purchases / entitlement durumu korunmalı

### 8. Sync doğruluğu testi

Kontrol edilecek veri alanları:

- `profile`
- `meals`
- `water`
- `workouts`
- `programProgress`
- `customWorkouts`
- `notifications`
- `exerciseFavorites`
- `programFavorites`
- `mealTemplates`
- `mealTemplateFavorites`
- `dismissedMealTemplates`
- `waterPreferences`
- `activeWorkoutSession`
- `preferences`
- `aiHubAccess`
- `rewardedCredits`
- `cycleTracking`
- `coachPreferences`
- `aiProgramPhysiqueSeed`
- `aiProgramInstances`
- `aiProgramFeedback`
- `userPrograms`

Beklenen:

- boş remote + dolu local ise upload
- dolu remote + boş local ise hydrate
- ikisi de doluysa deterministic merge

### 9. Son kalite ve sağlık kontrolleri

Çalıştırılacak:

```bash
npx expo-doctor@latest
npm run typecheck
npm run lint
npm run test
npm run check:quality
```

Not:

- `npm run test` veya bazı entegrasyon testleri ortam bağımlıysa ayrıca değerlendirilmeli
- test edilmeyen bir şey test edildi kabul edilmemeli

### 10. Uygulama açılış doğrulaması

Çalıştırılacak:

```bash
npx expo start --clear
```

Kontrol edilecek:

- Metro düzgün açılıyor mu
- route çözümlemesi düzgün mü
- `welcome`, `onboarding`, `(tabs)` geçişleri sorunsuz mu

### 11. Commit düzenleme

Repo üzerinde şu an commitlenmemiş değişiklikler var. Bunlar mantıklı gruplara ayrılmalı.

Önerilen commit grupları:

1. `Add Supabase auth and full sync`
2. `Refine welcome and account UX`
3. `Improve performance and startup behavior`

## Kod Mu Kaldı, Bağlantı Mı Kaldı?

Kısa cevap:

- büyük feature geliştirmesi büyük ölçüde tamam
- ana kalanlar entegrasyon doğrulaması
- bazı küçük düzeltmeler test sırasında çıkabilir

Yani:

- büyük yeni ekran veya büyük mimari parça zorunlu görünmüyor
- esas risk artık bağlantılar, provider ayarları, gerçek cihaz auth callback’leri ve sync edge case’leri

## Öncelik Sırası

En doğru ilerleme sırası:

1. Expo’yu temiz başlat
2. Google login’i doğrula
3. Apple login’i doğrula
4. Guest -> account migration test et
5. İkinci cihaz sync test et
6. RevenueCat link/restore test et
7. Son kalite komutlarını çalıştır
8. Commit’leri düzenle

## Son Not

Şu an proje “özellik geliştirme” aşamasından büyük ölçüde “entegrasyon sertleştirme ve release hazırlığı” aşamasına geçmiş durumda.
