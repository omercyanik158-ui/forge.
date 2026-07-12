# FORGE Devralma ve Yol Haritasi

Bu dosya, projeyi baska bir yapay zekaya, yeni gelistiriciye veya yeni bir ekibe bastan sona devretmek icin hazirlandi. Amac, projeyi acan kisinin neyin yapildigini, neyin yari kaldigini, hangi teknolojilerin kullanildigini, hangi dosyalarin kritik oldugunu ve bundan sonra nasil ilerlenmesi gerektigini tek dosyada anlayabilmesidir.

## 1. Proje Ozeti

- Urun adi: `FORGE`
- Proje klasoru: `C:\Users\omercanyanik\Desktop\yenispor - Kopya`
- Uygulama tipi: Expo Router tabanli React Native fitness / nutrition / AI destekli spor uygulamasi
- Hedef platformlar: iOS, Android, web
- Dil destegi: Turkce ve Ingilizce
- Varsayilan davranis: Turkiye cihazlarinda Turkce, diger bolgelerde Ingilizce; kullanici ayarlardan degistirebilir
- Tema destegi: Acik ve koyu tema
- Premium modeli: hazir altyapi var, RevenueCat entegrasyonu baglanabilir
- AI Hub: fizik analizi ve premium yemek analizi

## 2. Su Anki Gercek Durum

Bu dosya guncellenirken dogrulanan durum:

- `npm run typecheck`: gecti
- `npm run lint`: gecti
- `npm test`: gecti
- `npm run check:content`: gecti
- `npm run check:expo`: gecti
- `expo-doctor`: `18/18` temiz

Bu, projenin su an statik kalite kontrolu acisindan temiz oldugu anlamina gelir. Gercek cihaz testi yine ayrica gereklidir.

## 3. Teknik Yigin

### Cekirdek

- Expo SDK: `~54.0.35`
- React: `19.1.0`
- React Native: `0.81.5`
- Expo Router: `~6.0.24`
- TypeScript: `~5.9.3`

### UI / UX

- `@expo/vector-icons`
- `expo-image`
- `expo-blur`
- `react-native-svg`
- `@shopify/flash-list`
- `react-native-safe-area-context`
- `react-native-gesture-handler`
- `react-native-reanimated`

### Yerel cihaz servisleri

- `expo-localization`
- `expo-notifications`
- `expo-image-picker`
- `expo-image-manipulator`
- `expo-file-system`
- `expo-sqlite`
- `expo-system-ui`
- `expo-constants`

### Satin alma / premium

- `react-native-purchases`
- `react-native-purchases-ui`

### Fontlar

- `@expo-google-fonts/inter`
- `@expo-google-fonts/montserrat`

## 4. Calistirma ve Komutlar

`package.json` icindeki temel komutlar:

- `npm run start`
- `npm run start:tunnel`
- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run build:exercises`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run check:content`
- `npm run check:expo`
- `npm run check:quality`

## 5. Ortam Degiskenleri

`.env.example` icerigine gore kullanilan ana degiskenler:

- `EXPO_PUBLIC_PEXELS_KEY`
- `EXPO_PUBLIC_PURCHASES_ENABLED`
- `EXPO_PUBLIC_RC_IOS_API_KEY`
- `EXPO_PUBLIC_RC_ANDROID_API_KEY`
- `EXPO_PUBLIC_RC_ENTITLEMENT_ID`
- `EXPO_PUBLIC_RC_OFFERING_ID`
- `EXPO_PUBLIC_AI_API_URL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

Notlar:

- `GEMINI_API_KEY` gizli kalmali, client tarafina gomulmemeli
- `EXPO_PUBLIC_` ile baslayanlar build-time'da client bundle'a gider
- AI route web/server katmanindan cagriliyor
- RevenueCat ayarlari henuz magaza hesaplariyla tam baglanmis kabul edilmemeli

## 6. Uygulama Mimarisi

### Root seviyesi

- [app/_layout.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/_layout.tsx)
  - Fontlari yukluyor
  - Splash yonetiyor
  - Bildirim hazirligini yapiyor
  - Purchases init calistiriyor
  - Profil varsa onboarding yerine uygulamayi aciyor
  - Tema ve localization provider'larini sariyor

- [app/(tabs)/_layout.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/(tabs)/_layout.tsx)
  - Alt sekmeleri tanimliyor
  - Sekmeler: Ana Sayfa, Antrenman, Beslenme, AI Hub, Profil

### Rota yapisi

Ana ekran dosyalari:

- `app/(tabs)/index.tsx` -> Ana sayfa
- `app/(tabs)/fitness.tsx` -> Antrenman sekmesi
- `app/(tabs)/nutrition.tsx` -> Beslenme sekmesi
- `app/(tabs)/ai.tsx` -> AI Hub sekmesi
- `app/(tabs)/profile.tsx` -> Profil sekmesi

Ikincil ekranlar:

- `app/onboarding.tsx`
- `app/premium.tsx`
- `app/personal-coach.tsx`
- `app/cycle-tracking.tsx`
- `app/programs.tsx`
- `app/program-detail.tsx`
- `app/program-session.tsx`
- `app/create-workout.tsx`
- `app/my-workouts.tsx`
- `app/workout-progress.tsx`
- `app/workout-log-detail.tsx`
- `app/strength-progress.tsx`
- `app/add-meal.tsx`
- `app/calorie-insights.tsx`
- `app/water-tracking.tsx`
- `app/goals.tsx`
- `app/achievements.tsx`
- `app/settings-appearance.tsx`
- `app/settings-language.tsx`
- `app/settings-notifications.tsx`
- `app/settings-privacy.tsx`

API route:

- `app/api/ai-analyze+api.ts`

## 7. Tema ve Tasarim Sistemi

Tema sistemi dosyalari:

- `src/theme/colors.ts`
- `src/theme/spacing.ts`
- `src/theme/typography.ts`
- `src/theme/radius.ts`
- `src/theme/dynamic-styles.ts`
- `src/theme/theme-context.tsx`
- `src/theme/use-theme.ts`

Genel UI yonu:

- Premium hissi veren ama asiri koyu olmayan modern fitness dili
- Acik tema ana tema
- Koyu tema destekleniyor
- Kart bazli bilgi mimarisi
- Montserrat + Inter kombinasyonu
- Baslikli yeni sayfalarda ust bosluk ortak standartla yonetiliyor
- Tum ana sekmelerde alt bosluklar ortak standarda baglandi

## 8. Veri Saklama Mimarisi

Yerel veri anahtarlari:

- `@forge/profile`
- `@forge/meals`
- `@forge/water`
- `@forge/workouts`
- `@forge/program-progress`
- `@forge/custom-workouts`
- `@forge/notification-preferences`
- `@forge/exercise-favorites`
- `@forge/meal-templates`
- `@forge/meal-template-favorites`
- `@forge/dismissed-meal-templates`
- `@forge/water-preferences`
- `@forge/active-workout-session`
- `@forge/preferences`
- `@forge/ai-hub-access`
- `@forge/cycle-tracking`
- `@forge/coach-preferences`

Ilgili dosyalar:

- [src/services/storageRegistry.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/storageRegistry.ts)
- `src/services/safeStorage.ts`
- `src/services/dataHealth.ts`

Not:

- `dataHealth` tarafinda `aiHubAccess`, `cycleTracking` ve `coachPreferences` kayitlari icin dogrulama akisi bulunuyor.

## 9. Ana Servisler

Profil / onboarding:

- `src/services/profileStore.ts`
- `src/services/calculations.ts`
- `src/services/appPreferencesStore.ts`

Beslenme:

- `src/services/mealStore.ts`
- `src/services/mealTemplateStore.ts`
- `src/services/mealInsights.ts`
- `src/services/foodApi.ts`
- `src/services/imageApi.ts`

Su takibi:

- `src/services/waterStore.ts`

Antrenman:

- `src/services/customWorkoutStore.ts`
- `src/services/workoutStore.ts`
- `src/services/workoutSessionDraftStore.ts`
- `src/services/programCatalog.ts`
- `src/services/programProgressStore.ts`
- `src/services/workoutInsights.ts`
- `src/services/trainingAnalysis.ts`
- `src/services/strengthProgress.ts`

Kisisel koc / dongu:

- `src/services/coachPreferences.ts`
- `src/services/personalCoach.ts`
- `src/services/cycleTracking.ts`

Premium:

- `src/services/subscription.ts`
- `src/services/purchaseService.ts`
- `src/services/market.ts`

AI Hub:

- `src/services/geminiService.ts`
- `src/server/geminiServer.ts`
- `src/services/aiImageService.ts`
- `src/services/aiHubAccess.ts`
- `src/services/aiHubComparison.ts`
- `src/services/aiHubValidation.ts`
- `src/services/storageService.ts`
- `src/services/storageService.web.ts`

Dil / tarih / bolge:

- `src/providers/localization-context.tsx`
- `src/services/localization.ts`
- `src/services/dateUtils.ts`
- `src/services/textUtils.ts`
- `src/services/messages.ts`

Bildirim:

- `src/services/notificationStore.ts`

## 10. AI Hub Durumu

AI Hub tarafinda su yapi var:

- Sekmeli ekran: Beslenme / Fizik analizi
- Fizik analizi:
  - front + back fotograf akis
  - ilk fizik analizi ucretsiz mantigi
  - premium sonrasi sinirsiz erisim mantigi
  - sonuclar cihazda saklaniyor
  - fotografi nasil cekmesi gerektigini anlatan gorsel uyari mevcut
- Yemek analizi:
  - premium kapisinin arkasinda
  - fotografa gore makro / kalori tahmini
  - toplam gramaj girisi mevcut
  - duzenlenebilir sonuc
  - ogun gunlugune kaydetme
  - fotograf cekimi icin gorsel yonlendirme mevcut

AI cagri akisi:

1. Kullanici gorsel secer
2. `geminiService` uygulama icinden API route'a gider
3. `app/api/ai-analyze+api.ts` istek dogrular
4. `src/server/geminiServer.ts` Gemini'ye gider
5. JSON semali sonuc parse edilir
6. Sonuc cihazda log olarak saklanabilir

Onemli not:

- Gemini'nin yerlesik guvenlik filtresi tamamen bypass edilemez
- AI route rate limit mantigi aktif: free ve premium icin ayri limitler var

## 11. Premium ve Gelir Modeli

Kod seviyesi hazir parcalar:

- RevenueCat env okuma
- entitlement okuma
- premium kapilar
- premium ekrani
- premium program kilitleri
- AI Hub premium feature gating

Dokumantasyon:

- [docs/REVENUECAT_SETUP.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/REVENUECAT_SETUP.md)

Magaza tarafinda hala baglanmasi gerekenler:

- App Store subscription urunleri
- Play Store subscription urunleri
- RevenueCat project / entitlement / offering eslesmesi
- gercek sandbox test kullanicilari

## 12. Hazir Dokumantasyonlar

Projede zaten bulunan onemli belge dosyalari:

- [docs/APP_STORE_METADATA.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/APP_STORE_METADATA.md)
- [docs/APP_STORE_READINESS.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/APP_STORE_READINESS.md)
- [docs/BRAND_DECISION.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/BRAND_DECISION.md)
- [docs/DATA_INVENTORY.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/DATA_INVENTORY.md)
- [docs/PRIVACY_POLICY_TR.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/PRIVACY_POLICY_TR.md)
- [docs/QA_CHECKLIST.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/QA_CHECKLIST.md)
- [docs/REVENUECAT_SETUP.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/REVENUECAT_SETUP.md)

## 13. Testler

Mevcut test dosyalari:

- `tests/core.test.ts`
- `tests/ai-hub.test.ts`
- `tests/coach-preferences.test.ts`
- `tests/cycle-tracking.test.ts`
- `tests/personal-coach.test.ts`

Su an gecen test sayisi:

- `5` test dosyasi
- `27` test

## 14. Son Turlarda Yapilanlar

Bu oturumlarda yapilan net isler:

- Kisisel antrenman akisinda kilo girildikten sonra sonraki sete / harekete gecince otomatik onay davranisi eklendi
- Su takibinde gosterim `2.25` formatina cekildi ve artir / azalt sadece `250 ml` adimiyla sadeletirildi
- Koyu temada kartlarin arkasindaki fazla siyah vurgu azaltildi
- AI Hub beslenme analizinde toplam gramaj girisi ve sonuc duzenleme akisi eklendi
- AI Hub fizik analizi ve yemek cekme akislarina fotograf nasil cekilecegine dair gorsel yonlendirme eklendi
- Kadinlara ozel Pilates ve Yoga programlari eklendi
- Evde ekipmanli ve aletsiz yeni antrenman programlari katalogta genisletildi
- Kadin profil secildiginde dongu takibi gorunur, erkekte gizli olacak sekilde profil akisi baglandi
- Kadin profilinde ilgili programlarin basta gorunmesi saglandi
- `Kisisel Koc` sistemi eklendi:
  - haftalik skor
  - sonraki aksiyon onerisi
  - agirlik onerisi
  - hedefe uygun ogun onerisi
  - donguye gore tempo onerisi
- `Koc tercihleri` sadeletirildi:
  - sadece ekipman, hassas bolgeler ve hatirlatma tercihi birakildi
  - teknik kart secimleri kullanicidan gizlendi
  - ana sayfa kartlari otomatik onceliklendirme mantigina tasindi
- Ana sayfa kartlari artik kullanicinin kayit davranisina gore otomatik one cikariliyor
- Program oturumunda ekipman ve hassas bolge tercihleri hareket degistirme mantigina baglandi
- Ust ve alt bosluk standardi yeni sayfalara yayildi
- Kapali durumdaki `Switch` gorunurluk problemi cozuldu

## 15. Hala Dikkat Edilmesi Gerekenler

Tam bitmis sayilmamasi gereken alanlar:

1. Gercek cihaz UX turu yapilmali
2. AI Hub icindeki kalan bazi eski transliterasyon metinleri tekrar gozden gecirilmeli
3. App Store / Play Store satin alma akislar gercek sandbox ile test edilmeli
4. Expo Go yerine development build ile AI ve satin alma tarafi ayrica denenmeli
5. Premium ekrani, restore purchase ve entitlement senaryolari gercek magaza hesabiyla dogrulanmali
6. Egzersiz veri seti ticari kullanim lisansi release oncesi tekrar teyit edilmeli
7. Ana sayfa otomatik kart siralamasi gercek kullanici davranisiyla UX turunda dogrulanmali
8. Donguye gore tempo onerisi su an rehber seviyesinde; istenirse gelecek turda otomatik hafif plan / deload davranisina genisletilebilir

## 16. Bilinen Riskler

- Expo Go bazen LAN timeout verebiliyor
- `expo start --tunnel` tarafinda ngrok kaynakli ara sira hata gorulebiliyor
- AI analizinde saglayici bloklari yuzde yuz kaldirilamaz
- Kullanici verileri su an local-first, cloud backup yok
- RevenueCat tam baglanmadan premium sadece local/state seviyesi hazir kabul edilmeli

## 17. Sonraki Oncelik Onerisi

En mantikli ilerleme sirasi:

1. AI Hub ekranindaki kalan eski Turkce metinleri tam tarama ile temizlemek
2. Gercek cihazda antrenman, beslenme, AI ve premium akislarini turdan gecirmek
3. RevenueCat + store urun baglantisini tamamlamak
4. Magaza gorselleri, aciklama ve destek e-postasini finalize etmek
5. Release build alip TestFlight / internal test turu yapmak
6. Ana sayfa otomatik kart mantigini gercek kullanim verisine gore ince ayarlamak
7. Dongu odakli kocu program yogunluguna daha derin baglamak isteniyorsa bunu ikinci faz olarak planlamak

## 18. Baska Bir Yapay Zekaya Verilecek Kisa Talimat

Eger bu projeyi baska bir yapay zekaya vereceksen su cerceveyi kullan:

- Proje Expo SDK 54 kullaniyor, surum dokumanlarina sadik kal
- Kod tabani TypeScript ve Expo Router tabanli
- Tasarim dili premium fitness uygulamasi hissi vermeli
- Turkce ve Ingilizce localization korunmali
- Yeni UI metinleri `src/services/messages.ts` kataloguna eklenmeli
- Veriler local-first saklaniyor
- Premium tarafi RevenueCat uzerinden tasarlanmis
- AI Hub Gemini tabanli, fizik analizi ve premium yemek analizi iceriyor
- Kod degistirirken `npm run check:quality` temiz kalmali
- `yeniplan.md`, `docs/` klasoru ve `package.json` ilk okunacak dosyalar olmali

## 19. Kritik Dosya Kisayolu

Ilk okunmasi gereken dosyalar:

- [package.json](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/package.json)
- [app.json](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app.json)
- [app/_layout.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/_layout.tsx)
- [app/(tabs)/_layout.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/(tabs)/_layout.tsx)
- [app/(tabs)/index.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/(tabs)/index.tsx)
- [app/(tabs)/fitness.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/(tabs)/fitness.tsx)
- [app/personal-coach.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/personal-coach.tsx)
- [app/cycle-tracking.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/cycle-tracking.tsx)
- [src/screens/AIHubScreen.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/screens/AIHubScreen.tsx)
- [src/server/geminiServer.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/server/geminiServer.ts)
- [src/services/geminiService.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/geminiService.ts)
- [src/services/storageRegistry.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/storageRegistry.ts)
- [src/services/personalCoach.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/personalCoach.ts)
- [src/services/coachPreferences.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/coachPreferences.ts)
- [src/services/cycleTracking.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/cycleTracking.ts)
- [src/services/messages.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/messages.ts)
- [docs/APP_STORE_READINESS.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/APP_STORE_READINESS.md)
- [docs/DATA_INVENTORY.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/DATA_INVENTORY.md)
- [docs/REVENUECAT_SETUP.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/REVENUECAT_SETUP.md)

## 20. Son Not

Bu proje su anda urunlesmeye cok yakin, local-first, premium fitness uygulamasi seviyesinde. Kod sagligi iyi durumda. En buyuk kalan is magaza baglantilari, gercek cihaz UX turu ve release oncesi son icerik / premium / AI ince ayaridir.
