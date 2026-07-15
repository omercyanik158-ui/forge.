# FORGE Master Product Audit

Bu doküman `/Users/omercyanik/Desktop/forgevolution-main` kod tabanının incelenmesiyle hazırlanmıştır. Amaç, projeyi hiç görmemiş başka bir yapay zekânın ürünün gerçek durumunu, mimarisini, ekranlarını, akışlarını ve eksiklerini anlayabilmesidir.

Temel ilke:

- Kodda doğrulanmayan hiçbir özellik kesin varmış gibi yazılmadı.
- Belirsiz kalan noktalarda `Belirsiz` veya `Kodda doğrulanamadı` ifadesi kullanıldı.
- Yarım, mock, placeholder veya riskli parçalar özellikle işaretlendi.

## İnceleme Kapsamı

- Expo Router tabanlı React Native / Expo uygulaması
- Ana route dosyaları `app/*`
- Sağlayıcılar (providers), servisler, AI endpoint’leri, storage, auth, premium, analytics, notifications
- Kodda mevcut ama route’a bağlanmamış veya yarım kalan davranışlar

---

# 1. Yönetici Özeti

## FORGE tam olarak nedir?

FORGE; antrenman takibi, program keşfi, kişisel antrenman oluşturma, beslenme kaydı, su takibi, AI destekli yemek/fizik analizi ve premium monetization katmanlarını birleştiren bir fitness uygulamasıdır.

## Hangi problemi çözüyor?

Kodun gösterdiği ana problem, kullanıcının fitness sürecini tek bir yerde yönetememesi:

- Hangi programı uygulayacağını seçme
- Egzersizleri seans bazında takip etme
- Beslenme ve su tüketimini kaydetme
- İlerlemesini görme
- AI’den hızlı yorum alma

FORGE bu parçaları tek uygulamada toplamaya çalışıyor.

## Kimler için yapılmış?

Birincil olarak düzenli spor yapmak isteyen genel fitness kullanıcıları için yapılmış görünüyor. Kodda hem başlangıç hem orta seviye kullanıcılar, hem salon hem ev ortamı, hem erkek hem kadın kullanıcılar düşünülmüş. Kadın kullanıcılar için adet döngüsü takibi ve koç önerilerine döngü etkisi de eklenmiş.

## Kullanıcı uygulamada ne yapıyor?

Kullanıcı:

- onboarding ile profil oluşturuyor
- guest veya auth ile uygulamaya giriyor
- hazır program seçiyor veya kendi workout’unu oluşturuyor
- AI program builder ile yerel olarak üretilen kişiselleştirilmiş program alabiliyor
- workout session içinde set, tekrar, kilo giriyor
- draft/autosave ile yarım seansı saklayabiliyor
- beslenme kayıtları ve su takibi yapıyor
- AI Hub’da yemek fotoğrafı ve fizik analizi alıyor
- profile/settings ekranlarından tema, dil, bildirim, gizlilik ayarlarını yönetiyor
- premium satın alabiliyor veya rewarded ad ile AI kredisi kazanabiliyor

## Uygulamanın ana değer önerisi nedir?

Kodun desteklediği en güçlü değer önerisi şu:

“Antrenman, beslenme, ilerleme ve sınırlı ama faydalı AI geri bildirimi tek uygulamada birleşiyor.”

## Benzer fitness uygulamalarından farkı nedir?

Koddaki gerçek farklar:

- AI Hub’ın iki ayrı görsel analizi var: yemek ve fizik
- fizik analizi AI program üretiminde “soft signal” olarak kullanılabiliyor
- AI program builder büyük ölçüde cihaz içi karar motorlarıyla çalışıyor; klasik chat tabanlı program üretimi gibi görünmüyor
- rewarded ad ile AI hakkı açma sistemi düşünülmüş
- local-first storage + opsiyonel Supabase sync yaklaşımı var

Kodda görülmeyen veya doğrulanamayan farklar:

- gerçek zamanlı koçluk
- form analizi
- sosyal özellikler
- gelişmiş cloud-native multi-device deneyim kalitesi

## Ürünün şu anki olgunluk seviyesi nedir?

En doğru tanım: **ileri prototip / beta adayı**.

Gerekçe:

- çok sayıda ekran üretim kalitesine yakın
- storage, backup, sync, analytics, error reporting, premium, AI quota gibi ciddi katmanlar var
- ancak auth callback route eksikliği gibi kritik bütünlük riskleri mevcut
- bazı önemli özellikler ürün anlatısında var ama route/endpoint seviyesinde tam karşılığı yok
- AI özellikleri sınırlı ve sadece iki ana analiz tipi doğrulandı

## Uygulama yayınlanmaya ne kadar yakın?

Tam “production ready” görünmüyor. Kod bazında yayın öncesi kalan ana riskler:

- auth redirect akışında eksik route riski (`/auth/callback` dosyası yok)
- bazı premium / rewarded / backend akışlarının gerçek ortam yapılandırmasına bağımlılığı
- form analysis gibi beklenti yaratabilecek ama doğrulanmayan alanlar
- çok geniş yüzey alanı için kapsamlı test görünmemesi

Tahmini değerlendirme:

- teknik demolar ve internal beta için yakın
- geniş kullanıcı yayını için birkaç kritik entegrasyon ve kalite turu daha gerekiyor

---

# 2. Ürün Konumlandırması

## Birincil hedef kullanıcı

- Düzenli spor yapmak isteyen, program uygulayan veya program arayan genel fitness kullanıcıları
- Gym veya home training yapan kullanıcılar
- Verisini elle girmekten kaçınmayan, tracking odaklı kullanıcı

## İkincil hedef kullanıcı

- Beslenme kaydı ve su takibini de aynı uygulamada tutmak isteyen kullanıcı
- Fizik analizi ve AI destekli özet yorumlardan motive olan kullanıcı
- Kadın kullanıcılar için cycle-aware öneri isteyen segment

## Kullanıcının temel motivasyonu

- Daha düzenli antrenman yapmak
- Hazır program ile başlamak veya kişiselleştirilmiş plan almak
- Gelişimini görünür kılmak
- Beslenme ve su alışkanlığını takip etmek
- AI ile hızlı yönlendirme almak

## Kullanıcının yaşadığı ana problemler

- hangi programı uygulayacağını bilememe
- antrenmanda set/tekrar/kilo takibini aksatma
- beslenme kaydını sürdürememe
- fiziksel ilerlemeyi yorumlayamama
- tek uygulamada bütünlük kuramama

## FORGE’un sunduğu ana çözüm

Local-first çalışan, fitness tracking + nutrition logging + AI insight + monetization birleşimi.

## Ürünün tek cümlelik mevcut değer önerisi

FORGE, kullanıcının antrenmanını, beslenmesini, su takibini ve sınırlı AI destekli geri bildirimlerini tek mobil deneyimde toplar.

## Ürünün gerçekte sunduğu şey ile pazarlama mesajı arasındaki uyumsuzluklar

- “AI Hub” güçlü pazarlama vaadi taşıyor, fakat kodda doğrulanan AI kapsamı sadece yemek analizi ve fizik analizi.
- “AI program oluşturma” adı cloud LLM tabanlı zannedilebilir; kodda ana orkestrasyon yerel karar motorları ve rule engine’lerle yapılıyor.
- Auth destekli hesap sistemi var, ama auth callback route eksik olduğu için gerçek giriş deneyimi kırılabilir.
- Premium katmanı kapsamlı görünüyor, fakat gerçek satın alma kullanılabilirliği env ve store yapılandırmasına çok bağlı.
- Form analysis kullanıcı beklentisi yaratabilecek bir başlık, fakat route/endpoint olarak doğrulanamadı.

## Uygulamanın en güçlü üç tarafı

- Local-first veri modeli güçlü: AsyncStorage wrapper, backup recovery, AI loglar için SQLite, geniş storage envanteri
- Workout session deneyimi detaylı: autosave, draft recovery, swap seçenekleri, progress logging
- AI program builder yalnız “ekran” değil; karar motoru, hacim, progression ve validation katmanlarıyla ciddi tasarlanmış

## Uygulamanın en zayıf üç tarafı

- Çok geniş ürün yüzeyi var; entegrasyon bütünlüğü bazı noktalarda kırılgan
- Auth / premium / rewarded / AI backend zinciri gerçek ortamda kolay bozulabilir
- Özellik seti ürün anlatısından daha geniş ama hepsi aynı olgunlukta değil

## Kullanıcının “vay be” diyebileceği anlar

- Fizik analizi sonucunu AI program builder’a taşıyabilmesi
- Workout session’ın yarım kaldığı yerden draft olarak dönmesi
- AI program’ın yerel olarak açıklama ve progression mantığıyla üretilmesi
- Rewarded ad ile yeni AI hakkı açma akışı

## Güçlü bir wow moment var mı?

Kısmen var. En belirgin aday:

- “Fizik analizi yaptır, sonra bunu AI program oluşturma sürecine bağla.”

Ancak bu deneyim ürünün merkezi wow moment’i olacak kadar sade ve kusursuz mu, koddan kesin söylemek zor. Bu yüzden en güvenli ifade: **Potansiyelli bir wow moment var, ama henüz tam kristalize olmuş görünmüyor.**

---

# 3. Tüm Ekranlar

Not:

- Expo Router route’ları dosya yolundan türetildi.
- `app/_layout.tsx` içindeki gate mantığı nedeniyle bazı ekranlara doğrudan URL ile gidilse bile auth/profile kontrolü devreye girebilir.
- “Kullanılan servisler” bölümünde sadece ana servisler listelendi.

## Root Layout / App Shell

- Dosya yolu: `app/_layout.tsx`
- Route: layout
- Ekranın amacı: uygulama bootstrap, tema/font/localization/auth provider kurulumu, onboarding ve welcome gate’i
- Kullanıcı bu ekrana nasıl gelir?: uygulama açılışında otomatik
- Ekranda bulunan ana bileşenler: `AppThemeProvider`, `LocalizationProvider`, `AuthProvider`, `Stack`
- Kullanıcının yapabildiği işlemler: doğrudan işlem yok
- Kullanılan state: `status`, `initialThemeMode`, `splashHidden`, `localProfileReady`
- Kullanılan servisler: `profileStore`, `themeStore`, `notificationStore`, `purchaseService`, `errorReporting`, `analyticsService`
- Kullanılan backend/API: Supabase auth dolaylı, RevenueCat dolaylı
- Premium kontrolü var mı?: dolaylı
- Loading durumu: splash + bootstrap
- Empty state: yok
- Error state: boot fail olursa safe mode benzeri fallback ile `ready`
- Başarılı işlem sonrası davranış: route redirect
- Navigasyon hedefleri: `/welcome`, `/onboarding`, `/(tabs)`
- Eksikler: `/auth/callback` route dosyası görünmüyor
- Potansiyel UX problemleri: bootstrap timeout sonrası güvenli açılış gerçek sorunları gizleyebilir
- Yarım veya çalışmayan bölümler: auth redirect callback zinciri riskli

## Welcome

- Dosya yolu: `app/welcome.tsx`
- Route: `/welcome`
- Ekranın amacı: Google/Apple sign in veya guest devam
- Kullanıcı bu ekrana nasıl gelir?: auth yoksa root gate ile
- Ekranda bulunan ana bileşenler: hero, giriş butonları, guest action
- Kullanıcının yapabildiği işlemler: Google login, Apple login, guest access
- Kullanılan state: animasyon state’leri, auth session refreshing
- Kullanılan servisler: `useAuth`, `loadProfile`
- Kullanılan backend/API: Supabase OAuth / Apple auth
- Premium kontrolü var mı?: hayır
- Loading durumu: session refreshing
- Empty state: yok
- Error state: Alert ile auth error
- Başarılı işlem sonrası davranış: profil varsa `/(tabs)`, yoksa `/onboarding`
- Navigasyon hedefleri: `/(tabs)`, `/onboarding`
- Eksikler: auth callback route eksikliği yüzünden giriş zinciri bozulabilir
- Potansiyel UX problemleri: guest ve auth state yarış koşulları olabilir
- Yarım veya çalışmayan bölümler: OAuth callback tarafı kodda eksik

## Onboarding

- Dosya yolu: `app/onboarding.tsx`
- Route: `/onboarding`
- Ekranın amacı: profil, ölçü, hedef ve aktivite bilgilerini toplamak
- Kullanıcı bu ekrana nasıl gelir?: ilk kurulum, profile reset, profil düzenleme
- Ekranda bulunan ana bileşenler: çok adımlı form
- Kullanıcının yapabildiği işlemler: isim, cinsiyet, yaş, boy, kilo, aktivite, ölçüler, hedef kaydetme
- Kullanılan state: tüm form alanları, `stepIdx`, `saving`
- Kullanılan servisler: `profileStore`, `localization`, `achievementStore`, `mealStore`, `calculations`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: edit modunda mevcut profil yükleniyor
- Empty state: yok
- Error state: Alert
- Başarılı işlem sonrası davranış: profil kaydedilir, `/(tabs)` yönlendirmesi
- Navigasyon hedefleri: `/(tabs)`; back fallback
- Eksikler: hesap oluşturma değil, sadece local profile onboarding
- Potansiyel UX problemleri: çok uzun onboarding
- Yarım veya çalışmayan bölümler: görünür yarım bölüm yok

## Tabs Layout

- Dosya yolu: `app/(tabs)/_layout.tsx`
- Route: `/(tabs)`
- Ekranın amacı: alt sekmeli ana kabuk
- Kullanıcı bu ekrana nasıl gelir?: onboarding veya welcome sonrası
- Ekranda bulunan ana bileşenler: Home, Training, Nutrition, AI, Profile tab’leri
- Kullanıcının yapabildiği işlemler: tab switch
- Kullanılan state: yok
- Kullanılan servisler: localization/theme
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: yok
- Empty state: yok
- Error state: yok
- Başarılı işlem sonrası davranış: ilgili taba geçiş
- Navigasyon hedefleri: tab route’ları
- Eksikler: yok
- Potansiyel UX problemleri: yok
- Yarım veya çalışmayan bölümler: yok

## Home Dashboard

- Dosya yolu: `app/(tabs)/index.tsx`
- Route: `/(tabs)`
- Ekranın amacı: günlük özet, enerji/makro, haftalık antrenman, koç kartları
- Kullanıcı bu ekrana nasıl gelir?: tab üzerinden
- Ekranda bulunan ana bileşenler: `TopBar`, calorie card, coach card, weekly pulse, analysis card, premium upsell
- Kullanıcının yapabildiği işlemler: nutrition, fitness, coach, workout-progress, goals, premium ekranlarına gitmek
- Kullanılan state: `profile`, `meals`, `summary`, `analysis`, `weeklyTraining`, `homeCards`, `isRefreshing`, `loadError`
- Kullanılan servisler: `mealStore`, `mealInsights`, `trainingAnalysis`, `workoutStore`, `coachPreferences`, `profileStore`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: training insights erişimi için dolaylı
- Loading durumu: initial spinner
- Empty state: veri yoksa kartlar default/fallback ile doluyor
- Error state: partial load error banner
- Başarılı işlem sonrası davranış: diğer ekranlara yönlendirme
- Navigasyon hedefleri: `/nutrition`, `/(tabs)/fitness`, `/personal-coach`, `/workout-progress`, `/goals`, `/calorie-insights`, `/premium`
- Eksikler: gerçek server dashboard yok
- Potansiyel UX problemleri: çok yoğun kart yapısı
- Yarım veya çalışmayan bölümler: yok

## Training / Fitness Tab

- Dosya yolu: `app/(tabs)/fitness.tsx`
- Route: `/(tabs)/fitness`
- Ekranın amacı: favori programlar, custom workout’lar, AI programlar ve program keşfi
- Kullanıcı bu ekrana nasıl gelir?: tab üzerinden
- Ekranda bulunan ana bileşenler: create hero, favorite programs, women cycle card, discover section, management sheet
- Kullanıcının yapabildiği işlemler: custom workout oluşturma, AI program builder açma, hazır program detayına gitme, custom/AI program başlatma, rename/delete
- Kullanılan state: `customWorkouts`, `aiPrograms`, `progressMap`, `profile`, `favoriteProgramIds`, `cycleState`, sheet state’leri
- Kullanılan servisler: `customWorkoutStore`, `aiProgramInstanceStore`, `programCatalog`, `programProgressStore`, `programFavoriteStore`, `profileStore`, `cycleTracking`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: premium program keşfi için var
- Loading durumu: explicit spinner yok; focus refresh
- Empty state: section bazlı
- Error state: belirgin global error state yok
- Başarılı işlem sonrası davranış: route veya local list refresh
- Navigasyon hedefleri: `/create-workout`, `/ai-program-builder`, `/programs`, `/program-detail`, `/program-session`, `/ai-program-detail`, `/cycle-tracking`
- Eksikler: explicit error UX zayıf
- Potansiyel UX problemleri: çok fazla entry point
- Yarım veya çalışmayan bölümler: yok

## Programs Catalog

- Dosya yolu: `app/programs.tsx`
- Route: `/programs`
- Ekranın amacı: hazır program kataloğu filtreleme ve keşif
- Kullanıcı bu ekrana nasıl gelir?: fitness tab içinden
- Ekranda bulunan ana bileşenler: filtre strip, free/premium sections
- Kullanıcının yapabildiği işlemler: filtreleme, program detay açma, premium sayfasına gitme
- Kullanılan state: `profile`, filtre state’leri
- Kullanılan servisler: `programCatalog`, `program-localization`, `profileStore`, `market`, `subscription`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: premium program kartları kilitli
- Loading durumu: hafif, profil yükleme
- Empty state: var
- Error state: belirgin yok
- Başarılı işlem sonrası davranış: detail veya premium
- Navigasyon hedefleri: `/program-detail`, `/premium`
- Eksikler: cloud-based catalog yok
- Potansiyel UX problemleri: premium/free ayrımı bazı kullanıcılar için karmaşık olabilir
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Program Detail

- Dosya yolu: `app/program-detail.tsx`
- Route: `/program-detail?id=...`
- Ekranın amacı: hazır program haftalarını, günlerini ve ilerlemeyi göstermek
- Kullanıcı bu ekrana nasıl gelir?: programs veya fitness ekranından
- Ekranda bulunan ana bileşenler: meta pills, week tabs, start CTA, premium upsell
- Kullanıcının yapabildiği işlemler: favori ekleme/çıkarma, programı userPrograms’a ekleme, session başlatma
- Kullanılan state: `profile`, `progress`, `favoriteIds`, `activeWeek`
- Kullanılan servisler: `programCatalog`, `programFavoriteStore`, `programProgressStore`, `userProgramsStore`, `profileStore`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: evet
- Loading durumu: focus refresh
- Empty state: program bulunamazsa var
- Error state: belirgin global error yok
- Başarılı işlem sonrası davranış: `/program-session` veya `/premium`
- Navigasyon hedefleri: `/program-session`, `/premium`
- Eksikler: explicit error UX zayıf
- Potansiyel UX problemleri: premium kilidi detail içinde geç fark edilebilir
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Program Session / Workout Session

- Dosya yolu: `app/program-session.tsx`
- Route: `/program-session` params: `programId`, `weekId`, `dayId`, `customWorkoutId`, `aiProgramId`, `aiDayId`
- Ekranın amacı: canlı antrenman seansı yönetmek
- Kullanıcı bu ekrana nasıl gelir?: hazır program, custom workout veya AI program başlatınca
- Ekranda bulunan ana bileşenler: exercise cards, set inputs, warmup, draft indicator, exit sheet, swap sheet, exercise image modal
- Kullanıcının yapabildiği işlemler: set/reps/kg girmek, set tamamlamak, egzersiz değiştirmek, seansı kısmi veya tam kaydetmek, draft bırakmak
- Kullanılan state: `sets`, `activeIndex`, `loading`, `exitSheetVisible`, `swapSheetVisible`, `draftStatus` ve çok sayıda session state
- Kullanılan servisler: `programCatalog`, `customWorkoutStore`, `aiProgramInstanceStore`, `programProgressStore`, `workoutStore`, `workoutSessionDraftStore`, `coachPreferences`, `cycleTracking`, `achievementStore`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: premium program için route başında var
- Loading durumu: `prepare()` sırasında loading
- Empty state: session yüklenemezse empty card
- Error state: input error, Alert, save fail Alert
- Başarılı işlem sonrası davranış: log kaydı, progress update, session route’dan çıkış
- Navigasyon hedefleri: `/program-detail`, `/ai-program-detail`, `/(tabs)/fitness`
- Eksikler: network sync yok; tamamen local log
- Potansiyel UX problemleri: ekran çok yoğun, hata/exit akışı kompleks
- Yarım veya çalışmayan bölümler: swap candidate mantığında aday 0 olsa da sheet açılabilir gibi bir risk görülebilir

## Create Workout

- Dosya yolu: `app/create-workout.tsx`
- Route: `/create-workout` veya `/create-workout?id=...`
- Ekranın amacı: kullanıcının özel workout oluşturması veya düzenlemesi
- Kullanıcı bu ekrana nasıl gelir?: fitness tab hero veya management sheet
- Ekranda bulunan ana bileşenler: search, filter chips, exercise picker, config rows, isim modalı, image modal
- Kullanıcının yapabildiği işlemler: egzersiz arama, favori, seçme, set/reps/rest düzenleme, workout kaydetme
- Kullanılan state: seçili egzersizler, arama, filtre, modal state, `saving`, `loading`
- Kullanılan servisler: `exerciseCatalog`, `exerciseFavorites`, `customWorkoutStore`, `profileStore`, `mealStore`, `achievementStore`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: var
- Empty state: arama sonucu yok / henüz egzersiz seçilmedi state’leri
- Error state: Alert
- Başarılı işlem sonrası davranış: fitness tab’a `replace`
- Navigasyon hedefleri: `/(tabs)/fitness`
- Eksikler: cloud sync yalnız genel snapshot üzerinden dolaylı
- Potansiyel UX problemleri: çok sayıda konfigürasyon alanı
- Yarım veya çalışmayan bölümler: görünür değil

## Workout Progress

- Dosya yolu: `app/workout-progress.tsx`
- Route: `/workout-progress`
- Ekranın amacı: antrenman geçmişinden insight, analysis ve strength progress girişleri sunmak
- Kullanıcı bu ekrana nasıl gelir?: home dashboard veya başka CTA’lar
- Ekranda bulunan ana bileşenler: training analysis cards, analysis region list, premium upsell
- Kullanıcının yapabildiği işlemler: detay log açma, strength progress açma, premium’a gitme
- Kullanılan state: profile, insights, analysis, workout logs
- Kullanılan servisler: `trainingAnalysis`, `workoutInsights`, `workoutStore`, `profileStore`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: training insights için evet
- Loading durumu: var
- Empty state: workout yoksa var
- Error state: sınırlı
- Başarılı işlem sonrası davranış: detail route
- Navigasyon hedefleri: `/strength-progress`, `/premium`, `/workout-log-detail`
- Eksikler: gelişmiş analytics backend görünmüyor
- Potansiyel UX problemleri: premium ve non-premium deneyimi bölünebilir
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Workout Log Detail

- Dosya yolu: `app/workout-log-detail.tsx`
- Route: `/workout-log-detail?id=...`
- Ekranın amacı: tek workout log detayını göstermek
- Kullanıcı bu ekrana nasıl gelir?: workout-progress veya strength-progress içinden
- Ekranda bulunan ana bileşenler: set summary ve log detail bileşenleri
- Kullanıcının yapabildiği işlemler: log inceleme
- Kullanılan state: seçili log
- Kullanılan servisler: `workoutStore`, localization/text helpers
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: log yüklenirken dolaylı
- Empty state: log bulunmazsa
- Error state: belirgin değil
- Başarılı işlem sonrası davranış: back
- Navigasyon hedefleri: geri dönüş
- Eksikler: log edit/delete route’dan doğrulanmadı
- Potansiyel UX problemleri: yalnız read-only olabilir
- Yarım veya çalışmayan bölümler: doğrulanmadı

## AI Hub

- Dosya yolu: `src/screens/AIHubScreen.tsx` ve route export `app/(tabs)/ai.tsx`
- Route: `/(tabs)/ai`
- Ekranın amacı: AI destekli yemek fotoğrafı analizi ve fizik analizi
- Kullanıcı bu ekrana nasıl gelir?: AI tab veya parametreli yönlendirme
- Ekranda bulunan ana bileşenler: segmented control, image cards, capture guidance, result cards, history cards, limit modal
- Kullanıcının yapabildiği işlemler: fotoğraf çekme/seçme, analiz başlatma, sonucu kaydetme, AI program builder’a seed taşıma, rewarded ad ile kredi alma
- Kullanılan state: `mode`, `profile`, `logs`, `accessState`, `rewardedState`, image state’leri, result state’leri, consent state’leri
- Kullanılan servisler: `aiImageService`, `geminiService`, `storageService`, `aiHubAccess`, `aiQuotaGate`, `rewardedAdService`, `rewardedCreditApi`, `rewardedCreditStore`, `aiProgramSeedStore`
- Kullanılan backend/API: `/api/ai-analyze`, `/api/ai-rewarded-credit`, Gemini, RevenueCat verification, Upstash Redis monetization
- Premium kontrolü var mı?: evet
- Loading durumu: history loading, analyzing, saving, rewarded loading
- Empty state: geçmiş yoksa / görsel yoksa
- Error state: `AIHubApiError` -> Alert
- Başarılı işlem sonrası davranış: sonuç state’e düşer, kayıt yapılabilir, AI program’a geçilebilir
- Navigasyon hedefleri: `/premium`, `/ai-program-detail`, `/ai-program-builder`
- Eksikler: form analysis yok; sadece food ve physique doğrulandı
- Potansiyel UX problemleri: quota/premium/rewarded mantığı kullanıcıya karmaşık gelebilir
- Yarım veya çalışmayan bölümler: text-based comparison referansları var ama route düzeyinde ayrı ekran görünmüyor

## AI Program Builder

- Dosya yolu: `app/ai-program-builder.tsx`
- Route: `/ai-program-builder`
- Ekranın amacı: kullanıcı cevaplarından kişiselleştirilmiş AI workout plan oluşturmak
- Kullanıcı bu ekrana nasıl gelir?: fitness tab, AI Hub, AI program regenerate
- Ekranda bulunan ana bileşenler: çok adımlı anket, processing UI, exercise picker, exit sheet
- Kullanıcının yapabildiği işlemler: hedef, gün sayısı, ekipman, deneyim, öncelik kaslar, limitasyonlar, recovery bilgileri girip program oluşturma
- Kullanılan state: `draft`, `generatedPlan`, `processingIndex`, picker state’leri, `savingPlan`
- Kullanılan servisler: `aiProgramEngine`, `aiProgramDecisionEngine`, `aiProgramOrchestrator`, `aiProgramSeedStore`, `aiProgramInstanceStore`, `coachPreferences`, `cycleTracking`, `profileStore`, `storageService`
- Kullanılan backend/API: yok; ana üretim local rule engine ile
- Premium kontrolü var mı?: kodda açık premium gate doğrulanmadı
- Loading durumu: var
- Empty state: giriş akışına göre değişir
- Error state: Alert
- Başarılı işlem sonrası davranış: plan kaydedilir ve `/ai-program-detail`
- Navigasyon hedefleri: `/ai-program-detail`
- Eksikler: gerçek LLM ile program generation doğrulanmadı
- Potansiyel UX problemleri: çok uzun funnel
- Yarım veya çalışmayan bölümler: yok gibi

## AI Program Detail

- Dosya yolu: `app/ai-program-detail.tsx`
- Route: `/ai-program-detail?id=...`
- Ekranın amacı: oluşturulan AI planı ve haftalarını göstermek
- Kullanıcı bu ekrana nasıl gelir?: builder sonrası veya fitness tabdan
- Ekranda bulunan ana bileşenler: hero, progress ring, why-this-plan section, week tabs, week section
- Kullanıcının yapabildiği işlemler: sonraki günü başlatma
- Kullanılan state: `plan`, `completedDayIds`, `reasonExpanded`, `activeWeekIndex`
- Kullanılan servisler: `aiProgramInstanceStore`, `programProgressStore`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: görünür değil
- Loading durumu: focus refresh
- Empty state: plan yoksa
- Error state: belirgin değil
- Başarılı işlem sonrası davranış: `/program-session`
- Navigasyon hedefleri: `/program-session`, `/ai-program-builder`
- Eksikler: plan düzenleme UI’sı görünmedi
- Potansiyel UX problemleri: çok açıklamalı olabilir
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Nutrition Tab

- Dosya yolu: `app/(tabs)/nutrition.tsx`
- Route: `/(tabs)/nutrition`
- Ekranın amacı: günlük öğünler, su takibi, özet ve nutrition giriş noktaları
- Kullanıcı bu ekrana nasıl gelir?: tab üzerinden
- Ekranda bulunan ana bileşenler: date picker, summary grid, meals panel, grouped meals, water summary
- Kullanıcının yapabildiği işlemler: gün seçme, meal silme, su ekleme/sıfırlama, add-meal açma, calorie insights ve water tracking açma
- Kullanılan state: `selectedDate`, `meals`, `profile`, `waterMl`, `weeklyMealCount`, `loading`
- Kullanılan servisler: `mealStore`, `mealInsights`, `waterStore`, `profileStore`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: doğrudan yok
- Loading durumu: var
- Empty state: öğün yoksa var
- Error state: delete/reset/add water Alert’leri
- Başarılı işlem sonrası davranış: local refresh
- Navigasyon hedefleri: `/add-meal`, `/calorie-insights`, `/water-tracking`
- Eksikler: gerçek nutrition cloud db yok
- Potansiyel UX problemleri: manuel veri girişi ağırlıklı
- Yarım veya çalışmayan bölümler: yok

## Add Meal

- Dosya yolu: `app/add-meal.tsx`
- Route: `/add-meal`
- Ekranın amacı: manuel veya arama/barcode ile öğün eklemek
- Kullanıcı bu ekrana nasıl gelir?: nutrition tab
- Ekranda bulunan ana bileşenler: arama, barcode CTA, manual fields, result card, meal type modal, favorite template toggle
- Kullanıcının yapabildiği işlemler: text search, barcode scanner açma, manuel öğün kaydetme, API sonucu kaydetme
- Kullanılan state: query/input alanları, `loading`, `saving`, `error`, `mealTypeModal`, `saveAsFavorite`
- Kullanılan servisler: `foodApi`, `imageApi`, `mealStore`, `profileStore`, `mealTemplateStore` dolaylı, `subscription`
- Kullanılan backend/API: food search API (env’e bağlı), image search API (opsiyonel)
- Premium kontrolü var mı?: food search premium gate var
- Loading durumu: arama yükleme
- Empty state: sonuç yoksa
- Error state: `error` text + Alert save fail
- Başarılı işlem sonrası davranış: meal save ve geri dönüş/refresh
- Navigasyon hedefleri: `/barcode-scanner`, `/premium`
- Eksikler: meal photo analysis burada değil, AI Hub’da
- Potansiyel UX problemleri: manuel ve API akışlarının birleşimi karmaşık olabilir
- Yarım veya çalışmayan bölümler: external food API env yoksa arama değeri düşer

## Barcode Scanner

- Dosya yolu: `app/barcode-scanner.tsx`
- Route: `/barcode-scanner`
- Ekranın amacı: barkod okutup add-meal ekranına veri taşımak
- Kullanıcı bu ekrana nasıl gelir?: add-meal içinden
- Ekranda bulunan ana bileşenler: `CameraView`, overlay, izin state
- Kullanıcının yapabildiği işlemler: kamera izni verme, barkod okutma
- Kullanılan state: permission, `locked`
- Kullanılan servisler: `safeGoBack`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: permission load
- Empty state: yok
- Error state: permission denied state
- Başarılı işlem sonrası davranış: `/add-meal` replace
- Navigasyon hedefleri: `/add-meal`
- Eksikler: yalnız belirli barkod tipleri
- Potansiyel UX problemleri: food database coverage’a bağlı
- Yarım veya çalışmayan bölümler: barkod çözümü API’ye bağlı

## Calorie Insights

- Dosya yolu: `app/calorie-insights.tsx`
- Route: `/calorie-insights`
- Ekranın amacı: nutrition trend ve summary göstermek
- Kullanıcı bu ekrana nasıl gelir?: nutrition tab
- Ekranda bulunan ana bileşenler: period cards, trend cards, macro stat
- Kullanıcının yapabildiği işlemler: inceleme
- Kullanılan state: `profile`, `summary`
- Kullanılan servisler: `mealInsights`, `profileStore`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: refresh sırasında dolaylı
- Empty state: veri azsa summary zayıf olabilir
- Error state: belirgin değil
- Başarılı işlem sonrası davranış: yok
- Navigasyon hedefleri: back
- Eksikler: ileri seviye analytics yok
- Potansiyel UX problemleri: veri azsa anlamsız olabilir
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Water Tracking

- Dosya yolu: `app/water-tracking.tsx`
- Route: `/water-tracking`
- Ekranın amacı: detaylı su takibi ve hedef yönetimi
- Kullanıcı bu ekrana nasıl gelir?: nutrition tab
- Ekranda bulunan ana bileşenler: hydration bottle, macro bar, history
- Kullanıcının yapabildiği işlemler: su ekleme/çıkarma, hedef değiştirme, recommended goal kullanma, reset
- Kullanılan state: `today`, `history`, `loading`
- Kullanılan servisler: `waterStore`, `profileStore`, localization
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: var
- Empty state: dolaylı
- Error state: Alert
- Başarılı işlem sonrası davranış: local history refresh
- Navigasyon hedefleri: back
- Eksikler: device health integration yok
- Potansiyel UX problemleri: manuel su takibi sürdürmesi zor olabilir
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Personal Coach

- Dosya yolu: `app/personal-coach.tsx`
- Route: `/personal-coach`
- Ekranın amacı: koç snapshot, alışkanlık puanları ve tercihler
- Kullanıcı bu ekrana nasıl gelir?: home veya profile
- Ekranda bulunan ana bileşenler: stat cards, habit cards, preference toggles
- Kullanıcının yapabildiği işlemler: coach preferences güncelleme, physique analysis girişine gitme
- Kullanılan state: `profile`, `preferences`, `snapshot`
- Kullanılan servisler: `coachPreferences`, `personalCoach`, `cycleTracking`, `profileStore`, `subscription`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: training insights erişimi dolaylı
- Loading durumu: refresh
- Empty state: veri azsa koç snapshot sınırlı olabilir
- Error state: belirgin değil
- Başarılı işlem sonrası davranış: local save
- Navigasyon hedefleri: `/(tabs)/ai?mode=physique`
- Eksikler: gerçek conversational AI coach yok
- Potansiyel UX problemleri: “coach” beklentisi yüksek, gerçekte snapshot tabanlı
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Goals

- Dosya yolu: `app/goals.tsx`
- Route: `/goals`
- Ekranın amacı: hedef tipi, hedef kilo ve aktivite düzeyi yönetimi
- Kullanıcı bu ekrana nasıl gelir?: profile/home
- Ekranda bulunan ana bileşenler: goal cards, input alanları, progress display
- Kullanıcının yapabildiği işlemler: goal save
- Kullanılan state: `profile`, `goalType`, `targetWeight`, `activityLevel`
- Kullanılan servisler: `profileStore`, `achievementStore`, `mealStore`, `calculations`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: refresh
- Empty state: profile yoksa zayıf
- Error state: Alert
- Başarılı işlem sonrası davranış: local profile update
- Navigasyon hedefleri: back
- Eksikler: advanced goal planning yok
- Potansiyel UX problemleri: kullanıcı hedefine rağmen program auto-adjust kısıtlı olabilir
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Strength Progress

- Dosya yolu: `app/strength-progress.tsx`
- Route: `/strength-progress`
- Ekranın amacı: exercise bazlı strength trendlerini göstermek ve paylaşmak
- Kullanıcı bu ekrana nasıl gelir?: workout-progress
- Ekranda bulunan ana bileşenler: summary cards, trend cards, share action
- Kullanıcının yapabildiği işlemler: egzersiz seçmek, paylaşmak, workout log detail’e gitmek
- Kullanılan state: `snapshot`, `selectedExerciseId`
- Kullanılan servisler: `strengthProgress`, `react-native-view-shot`, `expo-sharing`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: görünmüyor
- Loading durumu: var
- Empty state: workout yoksa var
- Error state: share error Alert
- Başarılı işlem sonrası davranış: paylaşım sheet
- Navigasyon hedefleri: `/workout-log-detail`, `/(tabs)/fitness`
- Eksikler: cloud chart export yok
- Potansiyel UX problemleri: veri azsa değer sınırlı
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Cycle Tracking

- Dosya yolu: `app/cycle-tracking.tsx`
- Route: `/cycle-tracking`
- Ekranın amacı: adet döngüsü verisini kaydetmek ve koç/personalization için kullanmak
- Kullanıcı bu ekrana nasıl gelir?: profile/fitness
- Ekranda bulunan ana bileşenler: summary, date picker, phase adjustments
- Kullanıcının yapabildiği işlemler: cycle verisini kaydetme
- Kullanılan state: `profile`, `tracking`, picker state
- Kullanılan servisler: `cycleTracking`, `profileStore`, localization
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: refresh
- Empty state: cycle data yoksa empty card
- Error state: Alert
- Başarılı işlem sonrası davranış: local save + success
- Navigasyon hedefleri: back
- Eksikler: health app sync yok
- Potansiyel UX problemleri: sadece kadın kullanıcı segmentinde görünür, ama enforcement UI düzeyinde
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Achievements

- Dosya yolu: `app/achievements.tsx`
- Route: `/achievements`
- Ekranın amacı: rozetler ve achievement progress göstermek
- Kullanıcı bu ekrana nasıl gelir?: profile
- Ekranda bulunan ana bileşenler: hero stats, badge grid/list
- Kullanıcının yapabildiği işlemler: inceleme
- Kullanılan state: `profile`, `progress`
- Kullanılan servisler: `achievementStore`, `profileStore`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: refresh
- Empty state: profile yoksa sınırlı
- Error state: belirgin değil
- Başarılı işlem sonrası davranış: yok
- Navigasyon hedefleri: back
- Eksikler: sosyal paylaşım yok
- Potansiyel UX problemleri: achievement sistemi motivasyon için hafif kalabilir
- Yarım veya çalışmayan bölümler: doğrulanmadı

## Premium

- Dosya yolu: `app/premium.tsx`
- Route: `/premium`
- Ekranın amacı: premium değer önerisi, package seçimi, satın alma ve restore
- Kullanıcı bu ekrana nasıl gelir?: farklı kilitli alanlardan modal olarak
- Ekranda bulunan ana bileşenler: premium feature cards, offer summary, package options
- Kullanıcının yapabildiği işlemler: paket seçme, satın alma, restore
- Kullanılan state: package list, busy state, profile
- Kullanılan servisler: `purchaseService`, `subscription`, `market`, `profileStore`
- Kullanılan backend/API: RevenueCat
- Premium kontrolü var mı?: ekranın kendisi premium katmanı
- Loading durumu: packages yüklenirken
- Empty state: packages yoksa fallback copy
- Error state: purchase fail/cancel durumları
- Başarılı işlem sonrası davranış: tier sync ve kapanış
- Navigasyon hedefleri: modal close/back
- Eksikler: store config yoksa gerçek satın alma pasif olabilir
- Potansiyel UX problemleri: env/config’e bağımlı availability
- Yarım veya çalışmayan bölümler: store kurulumu tamamlanmadığında “unavailable” davranışı

## Profile

- Dosya yolu: `app/(tabs)/profile.tsx`
- Route: `/(tabs)/profile`
- Ekranın amacı: profil özeti, haftalık snapshot, settings entry point’leri, auth/sync yönetimi
- Kullanıcı bu ekrana nasıl gelir?: tab üzerinden
- Ekranda bulunan ana bileşenler: stat cards, setting groups, auth card, upgrade card
- Kullanıcının yapabildiği işlemler: onboarding edit, cycle, goals, achievements, settings, premium, sign out, sync now
- Kullanılan state: `profile`, `snapshot`
- Kullanılan servisler: `useAuth`, `profileStore`, `mealInsights`, `workoutStore`, `market`, `purchaseService`
- Kullanılan backend/API: Supabase sync dolaylı
- Premium kontrolü var mı?: evet
- Loading durumu: focus refresh
- Empty state: profil yoksa gate ile dışarı çıkmalı
- Error state: limited
- Başarılı işlem sonrası davranış: route navigation veya auth state change
- Navigasyon hedefleri: çoklu settings ve feature route’ları
- Eksikler: account deletion/export görünmüyor
- Potansiyel UX problemleri: çok fazla ayar tek ekranda
- Yarım veya çalışmayan bölümler: auth/sync deneyimi backend yapılandırmasına bağlı

## Settings Appearance

- Dosya yolu: `app/settings-appearance.tsx`
- Route: `/settings-appearance`
- Ekranın amacı: tema modu seçmek
- Kullanıcı bu ekrana nasıl gelir?: profile
- Ekranda bulunan ana bileşenler: theme option cards
- Kullanıcının yapabildiği işlemler: light/dark/system benzeri mod seçimi
- Kullanılan state: theme context
- Kullanılan servisler: `theme`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: yok
- Empty state: yok
- Error state: yok
- Başarılı işlem sonrası davranış: tema anında değişir
- Navigasyon hedefleri: back
- Eksikler: yok
- Potansiyel UX problemleri: doğrulanmadı
- Yarım veya çalışmayan bölümler: görünmüyor

## Settings Language

- Dosya yolu: `app/settings-language.tsx`
- Route: `/settings-language`
- Ekranın amacı: dil, birim ve region/pricing bilgilerini yönetmek
- Kullanıcı bu ekrana nasıl gelir?: profile
- Ekranda bulunan ana bileşenler: preference chips, info rows
- Kullanıcının yapabildiği işlemler: language/unit preference değiştirme
- Kullanılan state: localization context
- Kullanılan servisler: `localization`, `market`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: yok
- Empty state: yok
- Error state: yok
- Başarılı işlem sonrası davranış: locale güncellenir
- Navigasyon hedefleri: back
- Eksikler: tam çeviri kapsaması koddan ölçülemedi
- Potansiyel UX problemleri: fiyat bölgesi ile dil tercihi karışabilir
- Yarım veya çalışmayan bölümler: görünmedi

## Settings Notifications

- Dosya yolu: `app/settings-notifications.tsx`
- Route: `/settings-notifications`
- Ekranın amacı: local reminder izinleri ve saatlerini yönetmek
- Kullanıcı bu ekrana nasıl gelir?: profile veya top bar action
- Ekranda bulunan ana bileşenler: permission status pills, reminder cards, time pickers
- Kullanıcının yapabildiği işlemler: izin isteme, reminder enable/disable, saat ayarlama
- Kullanılan state: `preferences`, permission state
- Kullanılan servisler: `notificationStore`, localization
- Kullanılan backend/API: yok; native notification API
- Premium kontrolü var mı?: hayır
- Loading durumu: refresh
- Empty state: yok
- Error state: Alert
- Başarılı işlem sonrası davranış: local schedule sync
- Navigasyon hedefleri: back
- Eksikler: remote push notification yok
- Potansiyel UX problemleri: Expo Go / web’de farklı davranış
- Yarım veya çalışmayan bölümler: native build dışı sınırlı olabilir

## Settings Privacy

- Dosya yolu: `app/settings-privacy.tsx`
- Route: `/settings-privacy`
- Ekranın amacı: veri sağlığı, support mail, reset all app data
- Kullanıcı bu ekrana nasıl gelir?: profile
- Ekranda bulunan ana bileşenler: data health list, support card, reset card
- Kullanıcının yapabildiği işlemler: rescan, support mail, tüm veriyi sıfırlama
- Kullanılan state: `items`, `healthyCount`, `recoveredCount`
- Kullanılan servisler: `dataHealth`, `appReset`, `analyticsService`, `errorReporting`
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: focus refresh
- Empty state: support email env yoksa support kartı yok
- Error state: reset fail Alert
- Başarılı işlem sonrası davranış: app reset -> `/onboarding`
- Navigasyon hedefleri: `/onboarding`
- Eksikler: data export/account deletion görünmüyor
- Potansiyel UX problemleri: reset çok güçlü aksiyon
- Yarım veya çalışmayan bölümler: account deletion yok

## Not Found

- Dosya yolu: `app/+not-found.tsx`
- Route: unmatched
- Ekranın amacı: bulunamayan route fallback
- Kullanıcı bu ekrana nasıl gelir?: geçersiz route
- Ekranda bulunan ana bileşenler: fallback card
- Kullanıcının yapabildiği işlemler: home’a dönmek
- Kullanılan state: yok
- Kullanılan servisler: localization
- Kullanılan backend/API: yok
- Premium kontrolü var mı?: hayır
- Loading durumu: yok
- Empty state: yok
- Error state: route not found
- Başarılı işlem sonrası davranış: `/`
- Navigasyon hedefleri: `/`
- Eksikler: yok
- Potansiyel UX problemleri: home route gate nedeniyle başka yere redirect olabilir
- Yarım veya çalışmayan bölümler: yok

## Gizli veya Doğrudan Route ile Açılabilen Ekranlar

- `/program-session` parametrelerle doğrudan açılabilir
- `/ai-program-detail?id=...`
- `/program-detail?id=...`
- `/workout-log-detail?id=...`
- `/barcode-scanner`
- `/premium`

Not:

- Root gate auth/profile durumuna göre bazı route’ları yeniden yönlendirir.

## Kodda Doğrulanamayan veya Eksik Görünen Ekranlar

- Authentication callback route: `/auth/callback` referans ediliyor ama `app/auth/callback.tsx` yok
- Form analysis ekranı: route olarak yok
- Legal pages: repo içinde markdown dokümanlar var (`docs/PRIVACY_POLICY_TR.md`, `docs/TERMS_OF_USE.md`) ama bunları uygulama içinde açan bir route doğrulanmadı
- Notifications geçmiş ekranı yok; sadece ayarlar var

---

# 4. Kullanıcı Akışları

Her akış için mümkün olduğunca koddan izlenen gerçek zincir özetlenmiştir.

## 1. İlk kez uygulamayı açma

1. Kullanıcının gördüğü ekran: splash / görünmez bootstrap
2. Kullanıcının yaptığı işlem: uygulamayı açar
3. Çalışan fonksiyon: `runBootstrap()`
4. Güncellenen state: `status`, `initialThemeMode`
5. Kaydedilen veri: yok
6. Backend çağrısı: analytics/error reporting setup dolaylı, store init daha sonra
7. Olası hata: bootstrap timeout/failure
8. Sonraki ekran: profil yoksa `/onboarding`, auth yoksa `/welcome`, hazırsa `/(tabs)`

## 2. Onboarding tamamlama

1. Ekran: `/onboarding`
2. İşlem: form adımlarını doldurur
3. Fonksiyon: `handleFinish`
4. State: form state -> `saving`
5. Veri: `saveProfile(profile)`
6. Backend: yok
7. Hata: validasyon veya save fail
8. Sonraki ekran: `/(tabs)`

## 3. Kullanıcı adı veya profil oluşturma

1. Ekran: `/onboarding`
2. İşlem: isim, yaş, cinsiyet, ölçüler
3. Fonksiyon: `saveProfile`
4. State: local profile oluşur
5. Veri: AsyncStorage `@forge/profile`
6. Backend: yok
7. Hata: cihaz içi save fail
8. Sonraki ekran: `/(tabs)`

## 4. Hesap oluşturma

- Kodda ayrı “email/password sign up” akışı doğrulanamadı.
- Google/Apple OAuth ile auth session alınması var.
- Bu yüzden “hesap oluşturma” aslında OAuth tabanlı ilk giriş olarak okunmalı.
- Belirsiz: Supabase üzerinde first-time user creation server-side olur, ama UI’da ayrı signup ekranı yok.

## 5. Giriş yapma

1. Ekran: `/welcome`
2. İşlem: Google veya Apple ile giriş
3. Fonksiyon: `signInWithGoogle` / `signInWithApple`
4. State: `sessionRefreshing`, `session`, `user`
5. Veri: Supabase session storage, guest temizlenir
6. Backend: Supabase OAuth, Apple auth, daha sonra sync/purchases link
7. Hata: callback code eksik, auth cancel, Supabase config eksik
8. Sonraki ekran: profil varsa `/(tabs)`, yoksa `/onboarding`

## 6. Misafir kullanım varsa misafir akışı

1. Ekran: `/welcome`
2. İşlem: continue as guest
3. Fonksiyon: `continueAsGuest`
4. State: `guestAccess = true`
5. Veri: `@forge/auth-guest-access`
6. Backend: yok
7. Hata: storage fail
8. Sonraki ekran: profil varsa `/(tabs)`, yoksa `/onboarding`

## 7. Program seçme

1. Ekran: `/(tabs)/fitness` veya `/programs`
2. İşlem: program kartına tıklar
3. Fonksiyon: router push
4. State: yok
5. Veri: yok
6. Backend: yok
7. Hata: premium kilidi
8. Sonraki ekran: `/program-detail`

## 8. Hazır program başlatma

1. Ekran: `/program-detail`
2. İşlem: start CTA
3. Fonksiyon: router push `/program-session`
4. State: session prepare
5. Veri: henüz yok
6. Backend: yok
7. Hata: premium access denied
8. Sonraki ekran: `/program-session` veya `/premium`

## 9. AI program oluşturma

1. Ekran: `/ai-program-builder`
2. İşlem: soruları doldurur
3. Fonksiyon: `buildAIProgramDecisionBlueprint` + `orchestrateAIProgram`
4. State: `draft`, `generatedPlan`, processing step’leri
5. Veri: son aşamada `saveAIProgramInstance`
6. Backend: yok
7. Hata: validation block, save fail
8. Sonraki ekran: `/ai-program-detail`

## 10. Antrenman başlatma

1. Ekran: `/program-session`
2. İşlem: session açılır
3. Fonksiyon: `prepare()`
4. State: `sets`, `activeIndex`, `loading`
5. Veri: mevcut draft yüklenebilir
6. Backend: yok
7. Hata: program bulunamaz, premium gate
8. Sonraki ekran: aynı ekran

## 11. Set, tekrar ve ağırlık kaydetme

1. Ekran: `/program-session`
2. İşlem: input alanlarını doldurur, done işaretler
3. Fonksiyon: set update handlers
4. State: `sets`
5. Veri: draft autosave
6. Backend: yok
7. Hata: input validation error
8. Sonraki ekran: aynı ekran

## 12. Antrenmanı arka plana atma

1. Ekran: `/program-session`
2. İşlem: çıkış isteği
3. Fonksiyon: exit sheet -> `keepDraftAndExit`
4. State: exit modal
5. Veri: `saveWorkoutSessionDraft`
6. Backend: yok
7. Hata: save draft fail
8. Sonraki ekran: önceki ekran

## 13. Taslak antrenmanı geri yükleme

1. Ekran: `/program-session`
2. İşlem: aynı session key ile yeniden girer
3. Fonksiyon: `loadWorkoutSessionDraft`
4. State: `sets`, `activeIndex`, `draftStatus = saved`
5. Veri: stored draft okunur
6. Backend: yok
7. Hata: draft süresi dolmuşsa temizlenir
8. Sonraki ekran: aynı ekran, restore edilmiş seans

## 14. Antrenmanı tamamlama

1. Ekran: `/program-session`
2. İşlem: finish session
3. Fonksiyon: `finishSession` -> `persistSession(false)`
4. State: loading/busy
5. Veri: `saveWorkoutLog`, progress update, draft clear
6. Backend: yok
7. Hata: save fail Alert
8. Sonraki ekran: detail/fallback

## 15. Antrenman geçmişini görüntüleme

1. Ekran: `/workout-progress`
2. İşlem: geçmiş kartlarına bakar
3. Fonksiyon: `loadWorkoutLogs`, analysis loaders
4. State: snapshot state
5. Veri: local logs okunur
6. Backend: yok
7. Hata: veri azlığı, insight unavailable
8. Sonraki ekran: `/workout-log-detail`

## 16. Yemek fotoğrafı analizi

1. Ekran: `/(tabs)/ai`, mode `food`
2. İşlem: foto seçer/çeker, analiz başlatır
3. Fonksiyon: `pickAIImage` -> `analyzeFood`
4. State: `foodImage`, `foodResult`, quota state
5. Veri: başarı sonrası access/rewarded state tüketimi, istenirse SQLite log
6. Backend: `/api/ai-analyze` -> Gemini
7. Hata: quota blocked, image invalid, timeout, content blocked
8. Sonraki ekran: aynı ekran, sonuç kartı

## 17. Fizik analizi

1. Ekran: `/(tabs)/ai`, mode `physique`
2. İşlem: ön ve arka foto yükler, yetişkin onayıyla analiz başlatır
3. Fonksiyon: `pickAIImage` -> `analyzePhysique`
4. State: `frontImage`, `backImage`, `physiqueResult`, `adultConsent`
5. Veri: quota tüketimi, SQLite log, opsiyonel AI program seed
6. Backend: `/api/ai-analyze` -> Gemini
7. Hata: adult only, same image, content blocked
8. Sonraki ekran: aynı ekran, sonuç kartı

## 18. Form analizi

- Kodda route veya API endpoint olarak doğrulanamadı.
- Sonuç: **Bu akış kod tabanında mevcut değil veya bu repo sürümünde erişilebilir değil.**

## 19. Ücretsiz limit dolması

1. Ekran: AI Hub
2. İşlem: free quota tükendikten sonra yeniden analiz ister
3. Fonksiyon: `getAIQuotaDecision`
4. State: `limitModalType`
5. Veri: access timestamps
6. Backend: server quota authorization analiz sırasında
7. Hata: blocked
8. Sonraki ekran: limit modal / premium / rewarded ad

## 20. Rewarded ad ile hak kazanma

1. Ekran: AI limit modal
2. İşlem: ad izler
3. Fonksiyon: `showRewardedAd` -> `claimRewardedCredit`
4. State: rewarded loading/feedback
5. Veri: local rewarded state + server rewarded snapshot
6. Backend: `/api/ai-rewarded-credit`
7. Hata: ad unavailable, daily cap reached
8. Sonraki ekran: AI Hub’a dönüp yeniden analiz deneyebilir

## 21. Premium satın alma

1. Ekran: `/premium`
2. İşlem: paket seçer
3. Fonksiyon: `purchaseService` purchase flow
4. State: busy state, subscription tier
5. Veri: profile subscription update, RevenueCat state
6. Backend: RevenueCat / store
7. Hata: unavailable, cancelled, error
8. Sonraki ekran: aynı ekran veya geri dönüş

## 22. Satın alımı geri yükleme

1. Ekran: `/premium` veya profile
2. İşlem: restore
3. Fonksiyon: `restorePremiumPurchases`
4. State: subscription
5. Veri: tier sync
6. Backend: RevenueCat
7. Hata: restore fail
8. Sonraki ekran: aynı ekran

## 23. Hesap değiştirme

- Doğrudan “switch account” UI doğrulanmadı.
- En yakın karşılık: sign out sonrası tekrar giriş.

## 24. Çıkış yapma

1. Ekran: profile
2. İşlem: sign out
3. Fonksiyon: `signOut`
4. State: session/user temizlenir
5. Veri: guest/session state update
6. Backend: Supabase sign out
7. Hata: doğrulanmadı
8. Sonraki ekran: `/welcome`

## 25. Hesap verilerini senkronize etme

1. Ekran: profile veya auth effect
2. İşlem: login sonrası otomatik, profile’da manuel `syncNow`
3. Fonksiyon: `syncUserData`
4. State: `sync.status`
5. Veri: local snapshot export/import, sync metadata
6. Backend: Supabase tables / snapshot storage
7. Hata: sync error state
8. Sonraki ekran: aynı ekran

## 26. Bildirim izni verme

1. Ekran: `/settings-notifications`
2. İşlem: izin ister
3. Fonksiyon: notification permission handlers
4. State: permission state
5. Veri: reminder preferences
6. Backend: yok
7. Hata: denied
8. Sonraki ekran: aynı ekran

## 27. Hata oluşması ve hata raporlama

1. Ekran: herhangi biri
2. İşlem: runtime error veya handled catch
3. Fonksiyon: `captureError`, global handler, `AppErrorBoundary`
4. State: yok
5. Veri: error reporting context
6. Backend: error reporting provider env’e bağlı
7. Hata: reporting init fail olabilir
8. Sonraki ekran: boundary veya warning fallback

---

# 5. Özellik Envanteri

| Özellik | Durum | Ekran | Ana Dosyalar | Local mi Cloud mu | Premium mu | Çalışıyor mu | Eksik |
| ------- | ----- | ----- | ------------ | ----------------- | ---------- | ------------ | ----- |
| Hazır program kataloğu | Tamamlandı | `/programs`, `/program-detail` | `app/programs.tsx`, `app/program-detail.tsx`, `src/services/programCatalog.ts` | Local | Kısmen | Evet | Cloud katalog yok |
| AI program oluşturma | Kısmen tamamlandı | `/ai-program-builder`, `/ai-program-detail` | `app/ai-program-builder.tsx`, `src/services/aiProgramOrchestrator.ts` | Local | Kodda net gate yok | Evet | Gerçek LLM üretimi yok |
| Workout tracking | Tamamlandı | `/program-session` | `app/program-session.tsx`, `src/services/workoutStore.ts` | Local | Hayır | Evet | Sync yalnız genel snapshot ile |
| Set ve tekrar yönetimi | Tamamlandı | `/program-session` | `app/program-session.tsx` | Local | Hayır | Evet | - |
| Autosave | Tamamlandı | `/program-session` | `src/services/workoutSessionDraftStore.ts` | Local | Hayır | Evet | 24 saat sonra draft siliniyor |
| Draft recovery | Tamamlandı | `/program-session` | `src/services/workoutSessionDraftStore.ts` | Local | Hayır | Evet | Yalnız session key eşleşirse |
| Exercise replacement | Kısmen tamamlandı | `/program-session` | `app/program-session.tsx`, `src/services/aiProgramSwapService.ts` | Local | Hayır | Evet | UX karmaşık |
| Progression | Tamamlandı | AI Program | `src/services/aiProgramProgressionEngine.ts` | Local | Belirsiz | Evet | Sadece AI plan tarafında belirgin |
| Personal record | Kısmen tamamlandı | `/strength-progress` | `src/services/strengthProgress.ts` | Local | Hayır | Evet | Ayrı PR UI’sı sınırlı |
| Workout history | Tamamlandı | `/workout-progress`, `/workout-log-detail` | `src/services/workoutStore.ts` | Local | Hayır | Evet | - |
| Statistics | Kısmen tamamlandı | home, workout-progress, calorie-insights | `trainingAnalysis`, `mealInsights`, `strengthProgress` | Local | Kısmen | Evet | İleri analytics sınırlı |
| Nutrition tracking | Tamamlandı | `/(tabs)/nutrition` | `app/(tabs)/nutrition.tsx`, `src/services/mealStore.ts` | Local | Hayır | Evet | Manuel yoğun |
| Meal photo analysis | Tamamlandı | AI Hub | `src/screens/AIHubScreen.tsx`, `app/api/ai-analyze+api.ts` | Cloud + Local log | Evet sonrası sınırsız | Evet | Free limit çok düşük |
| Physique analysis | Tamamlandı | AI Hub | Aynı | Cloud + Local log | Evet sonrası sınırsız | Evet | Adult-only, 1 free |
| Form analysis | Planlanmış ancak yok | - | - | - | - | Hayır | Route/API doğrulanmadı |
| AI Hub | Kısmen tamamlandı | `/(tabs)/ai` | `src/screens/AIHubScreen.tsx` | Hybrid | Evet | Evet | Kapsam sadece 2 analiz türü |
| AI analiz limitleri | Tamamlandı | AI Hub | `aiHubAccess`, `aiQuotaGate`, `aiMonetization` | Hybrid | Evet | Evet | Karmaşık |
| Rewarded ads | Kısmen tamamlandı | AI limit modal | `rewardedAdService`, `ai-rewarded-credit+api.ts` | Hybrid | Free users | Evet | Native config bağımlı |
| Premium | Kısmen tamamlandı | `/premium` | `purchaseService`, `subscription`, `market` | Cloud + Local tier | Evet | Kısmen | Store config gerek |
| RevenueCat | Kısmen tamamlandı | premium/auth | `purchaseService.ts` | Cloud | Evet | Kısmen | Env/store bağımlı |
| Authentication | Kısmen tamamlandı | `/welcome` | `auth-context.tsx`, `supabase.ts` | Cloud | Hayır | Riskli | `auth/callback` route yok |
| Supabase | Kısmen tamamlandı | auth/sync | `supabase.ts`, `cloudSync.ts` | Cloud | Hayır | Kısmen | Env bağımlı |
| Cloud sync | Kısmen tamamlandı | profile/auth effect | `cloudSync.ts` | Cloud + Local | Hayır | Evet gibi | Çatışma çözümü basit |
| Local storage | Tamamlandı | tüm uygulama | `safeStorage.ts`, `storageRegistry.ts` | Local | Hayır | Evet | - |
| Profile | Tamamlandı | onboarding, profile | `profileStore.ts` | Local | Hayır | Evet | - |
| Theme | Tamamlandı | settings-appearance | `themeStore.ts`, `theme/*` | Local | Hayır | Evet | - |
| Localization | Tamamlandı | settings-language, tüm app | `localization.ts`, `messages.ts` | Local | Hayır | Evet | Çeviri kapsaması tam ölçülmedi |
| Notifications | Kısmen tamamlandı | settings-notifications | `notificationStore.ts` | Local native | Hayır | Evet | Remote push yok |
| Analytics | Kısmen tamamlandı | app-wide | `analyticsService.ts` | Cloud | Hayır | Kısmen | Env/provider bağımlı |
| Error reporting | Kısmen tamamlandı | app-wide | `errorReporting.ts` | Cloud | Hayır | Kısmen | Provider config bağımlı |
| Sentry | Planlanmış ancak yok | - | `errorReporting.ts` incelenmediğinde doğrudan Sentry adı doğrulanmadı | Cloud | - | Belirsiz | Kodda isim bazlı teyit yok |
| Privacy | Kısmen tamamlandı | settings-privacy | `app/settings-privacy.tsx` | Local | Hayır | Evet | Export/delete yok |
| Terms | Kısmen tamamlandı | repo docs | `docs/TERMS_OF_USE.md` | Static | Hayır | Uygulama içi Belirsiz | Route yok |
| Support | Kısmen tamamlandı | settings-privacy | `mailTo support email` | External | Hayır | Env varsa | Support email env bağımlı |
| Account deletion | Planlanmış ancak yok | - | - | - | - | Hayır | UI yok |
| Data export | Planlanmış ancak yok | - | - | - | - | Hayır | UI yok |
| Offline usage | Kısmen tamamlandı | çoğu ekran | local stores | Local-first | Hayır | Büyük ölçüde | AI/auth/premium cloud bağımlı |

---

# 6. AI Özellikleri

Kodda doğrulanan AI özellikleri:

1. Yemek fotoğrafı analizi
2. Fizik analizi
3. Fizik analizinden seed alan AI program oluşturma
4. Yerel karar motorlu AI program üretimi

Kodda doğrulanmayan AI özellikleri:

- Form analizi
- Serbest chat koç
- Video analizi kullanıcıya açık route olarak

## 6.1 Yemek Fotoğrafı Analizi (Meal Photo Analysis)

- Kullanıcı girdisi: tek yemek görseli
- Gönderilen veri: base64 JPEG, dil, premium flag, `appUserId`, `requestId`
- Fotoğraf işleme akışı:
  - `expo-image-picker`
  - `expo-image-manipulator`
  - max edge küçültme
  - JPEG olarak base64 üretimi
- API endpoint: `/api/ai-analyze`
- Prompt veya sistem mesajı: `src/services/ai/promptRegistry.ts` içindeki `food` prompt’u
- Kullanılan model: varsayılan `gemini-2.5-flash` (`GEMINI_MODEL` env ile override edilebilir)
- Model seçimi dinamik mi?: env ile yarı dinamik
- Dönen cevap formatı: JSON
- JSON schema varsa schema:
  - `yemekAdi`
  - `porsiyon`
  - `kalori`
  - `protein`
  - `karbonhidrat`
  - `yag`
  - `guvenPuani`
  - `aciklama`
- Cevap doğrulaması: `parseFoodAnalysisResult`
- Hata yönetimi:
  - invalid image
  - timeout
  - network
  - content blocked
  - provider error
  - quota blocked
- Premium/limit: free kullanıcı için günlük 1 analiz, sonra rewarded veya premium
- Kayıt: premium kullanıcı geçmişi SQLite log olarak saklayabiliyor; media retention opsiyonel

## 6.2 Fizik Analizi (Physique Analysis)

- Kullanıcı girdisi: aynı yetişkin kullanıcıya ait ön ve arka poz fotoğrafı
- Gönderilen veri: iki base64 JPEG, `confirmedAdultConsent`, yaş, premium flag, `appUserId`, `requestId`
- Fotoğraf işleme akışı:
  - aynı picker/manipulation pipeline
  - iki görsel farklı olmalı
- API endpoint: `/api/ai-analyze`
- Prompt veya sistem mesajı: `promptRegistry.ts` içindeki `physique` prompt’u
- Kullanılan model: varsayılan `gemini-2.5-flash`
- Model seçimi dinamik mi?: env ile override
- Dönen cevap formatı:
  - `generalDurum`
  - `eksikBolgeler`
  - `odaklanmasiGerekenHareketler`
  - `tahminiYagOrani`
  - `kasKutlesiYorumu`
  - `guvenPuani`
  - `pozKalitesiYorumu`
- JSON schema varsa schema: `PHYSIQUE_SCHEMA`
- Cevap doğrulaması: `parsePhysiqueAnalysisResult`
- Hata yönetimi:
  - adult consent required
  - under 18 blocked
  - same image blocked
  - content blocked
  - quota blocked
- Premium/limit: free kullanıcı için haftalık 1 analiz, sonra rewarded veya premium
- Ek kullanım:
  - sonuç AI program builder’da seed olarak kullanılabiliyor
  - local SQLite history’de saklanabiliyor

## 6.3 AI Program Builder

Önemli nokta:

- Bu özellik isim olarak “AI program” olsa da kodda doğrudan LLM tabanlı plan üretimi görünmüyor.
- Ana üretim rule engine / orchestration / validation katmanlarıyla yapılıyor.

- Kullanıcı girdisi:
  - hedef
  - gün sayısı
  - seans süresi
  - salon/ev
  - ekipman
  - deneyim
  - öncelikli kas grupları
  - ağrı/limitasyonlar
  - exercise preference
  - recovery / sleep / stress
  - opsiyonel physique seed
- Gönderilen veri: local context object
- Fotoğraf işleme akışı: doğrudan builder’da yok; physique sonucu üzerinden dolaylı
- API endpoint: yok
- Prompt veya sistem mesajı: yok
- Kullanılan model: yok
- Model seçimi dinamik mi?: hayır
- Dönen cevap formatı: `AIProgramPlan`
- JSON schema varsa schema: TypeScript type seviyesinde
- Cevap doğrulaması: `validateAIProgramPlan`
- Hata yönetimi: validation codes, blocking/caution flags, Alert save errors
- Not: ürün dili “AI” olsa da bu modülün büyük kısmı **deterministic local program synthesis**.

## 6.4 Rewarded Credit / AI Monetization

- Kullanıcı girdisi: rewarded ad izleme isteği
- Gönderilen veri: `creditType`, `appUserId`, `deviceId`, `premium`, `idempotencyKey`
- API endpoint: `/api/ai-rewarded-credit`
- Model: yok
- Cevap formatı: granted/creditId/snapshot
- Doğrulama: request alanları kontrol ediliyor
- Hata yönetimi:
  - premium users blocked
  - daily cap reached
  - invalid rewarded request

## 6.5 Kodda Bulunmayan veya Belirsiz AI Alanları

- Form analysis: route/API yok
- Metin tabanlı sürekli sohbet koçu: görünmüyor
- Video analysis: repo içinde video-analysis doc’ları var ama kullanıcıya açık ürün akışı olarak doğrulanmadı

---

# 7. Mimari ve Veri Modeli Özeti

## Genel Mimari

- Framework: Expo + React Native + Expo Router
- Dil: TypeScript
- Storage yaklaşımı: local-first
- Auth: Supabase OAuth
- Premium: RevenueCat
- AI provider: Gemini
- AI log storage: SQLite + file system
- Genel app storage: AsyncStorage + backup envelope

## State Yaklaşımı

Global state library görünmüyor. Büyük ölçüde:

- ekran içi `useState`
- context (`auth`, `localization`, theme)
- servis katmanında AsyncStorage/SQLite read-write

## Persistence Katmanları

### AsyncStorage

Ana veri:

- profile
- meals
- water
- workouts
- program progress
- custom workouts
- notifications
- AI access state
- rewarded credits
- cycle tracking
- AI program instances
- daha fazlası

### Backup / Recovery

`safeStorage.ts`:

- primary + backup anahtar
- envelope `{ version, savedAt, value }`
- primary bozulursa backup’tan recovery
- meta tutuluyor (`lastSavedAt`, `lastRecoveredAt`)

### SQLite

`storageService.ts`:

- `ai_hub_logs` tablosu
- type: `food` veya `physique`
- sonuç JSON’u saklanıyor
- media retention seçilirse görseller document dir’de kopyalanıyor

## Cloud Sync

`cloudSync.ts` üzerinden:

- local snapshot export/import
- Supabase `remote_snapshot` benzeri payload yaklaşımı
- basit merge stratejileri
- obje/array birleşiminde timestamp veya union mantığı

Bu sync katmanı güçlü ama tam enterprise conflict resolution düzeyinde değil.

---

# 8. Auth, Premium, Backend ve Storage Notları

## Auth

Doğrulananlar:

- Google OAuth
- Apple sign in
- guest access
- Supabase session persistence

Risk:

- `Linking.createURL('/auth/callback')` kullanılıyor
- fakat repo içinde bu route karşılığı görünmüyor
- bu, gerçek auth dönüşünde kırık akış riski demek

## Premium

Doğrulananlar:

- RevenueCat package yükleme
- purchase
- restore
- entitlement -> local subscription tier sync

Risk:

- `EXPO_PUBLIC_PURCHASES_ENABLED`
- platform API key’leri
- native store build gereksinimleri

## AI Backend

Doğrulananlar:

- endpoint’ler Expo Router API routes ile aynı projede
- server tarafında Gemini çağrısı yapılıyor
- monetization ve premium verification katmanı var

## Storage Gücü

Bu repo’nun en olgun alanlarından biri storage:

- çok kapsamlı registry
- backup/recovery
- AI için ayrı SQLite
- sync’e uygun snapshot modeli

---

# 9. Kullanılmayan, Yarım, Mock veya Riskli Alanlar

## Açık riskler

- `/auth/callback` route eksik
- form analysis yok
- legal docs uygulama içi route olarak doğrulanmadı
- account deletion yok
- data export yok

## Mock / fallback alanlar

- rewarded ads development mock provider destekliyor
- purchase service store unavailable fallback message içeriyor
- analytics/error reporting başlatılamasa da app çalışmaya devam ediyor

## Riskli ürün-mesaj uyumsuzlukları

- “AI Hub” beklentisi mevcut kapsamdan daha büyük algılanabilir
- “personal coach” conversational AI gibi sanılabilir; gerçekte snapshot/preference katmanı

---

# 10. Ürünün Mevcut Olgunluk Değerlendirmesi

## Teknik Güçlü Yönler

- Local-first tasarım
- Workout session detay seviyesi
- AI program motorunun ciddi mimarisi
- Monetization ve quota düşünülmüş

## Teknik Riskler

- auth bütünlüğü
- env bağımlılıkları
- büyük yüzey alanına göre test görünürlüğünün düşük olması
- çok sayıda yarı-bağımsız modülün gerçek cihaz davranış riski

## Yayına Yakınlık

En dürüst özet:

- **İyi tasarlanmış bir beta adayı**
- **tam üretim güveni için henüz birkaç kritik entegrasyon turu gerekiyor**

---

# 11. Başka Bir Yapay Zekâ İçin Kısa Operasyonel Özet

FORGE, Expo Router tabanlı bir React Native fitness uygulamasıdır. Ürünün gerçek omurgası şunlardır:

- local-first profil / meal / water / workout tracking
- hazır program kataloğu
- custom workout builder
- güçlü workout session + autosave/draft recovery
- AI Hub içinde yemek fotoğrafı ve fizik analizi
- fizik analizini AI program builder’a seed olarak bağlama
- local rule-engine tabanlı AI workout program synthesis
- RevenueCat premium + rewarded ad ile AI quota monetization
- Supabase auth + opsiyonel snapshot sync

Başlıca dikkat edilmesi gereken açıklar:

- `/auth/callback` route görünmüyor
- form analysis yok
- account deletion / data export yok
- legal docs uygulama içi route olarak doğrulanmadı

Eğer başka bir yapay zekâ bu projede görev alacaksa, önce şu dosyalardan başlaması en verimli olacaktır:

1. `app/_layout.tsx`
2. `src/providers/auth-context.tsx`
3. `app/(tabs)/fitness.tsx`
4. `app/program-session.tsx`
5. `src/screens/AIHubScreen.tsx`
6. `app/ai-program-builder.tsx`
7. `src/services/cloudSync.ts`
8. `src/services/purchaseService.ts`
9. `src/services/storageRegistry.ts`
10. `src/services/safeStorage.ts`

