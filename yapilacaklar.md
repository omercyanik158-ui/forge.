# FORGE Yapilacaklar ve AI Calisma Brifi

Bu dosya, projeyi devralan baska bir yapay zekanin veya gelistiricinin ne yapacagini yoruma daha az acik sekilde anlamasi icin hazirlandi.

Bu dosyanin amaci sadece fikir vermek degil, dogrudan uygulama yaptirabilmektir.

## 1. Bu Projeyi Devralan AI Once Ne Okumali

Calismaya baslamadan once su dosyalari oku:

1. `AGENTS.md` icindeki proje kurallari
2. [yeniplan.md](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/yeniplan.md)
3. `docs/FORGE_AI_CONSTITUTION.md` (AI davranis anayasasi)
4. `src/services/messages.ts` (i18n katalogu)
5. `src/theme/spacing.ts` (ortak bosluk standardi)
6. `app/(tabs)/index.tsx` (ana sayfa)
7. `app/(tabs)/fitness.tsx` (antrenman + AI Program girisleri)
8. `app/personal-coach.tsx`
9. `app/cycle-tracking.tsx`
10. `src/services/personalCoach.ts`
11. `src/services/coachPreferences.ts`
12. `src/screens/AIHubScreen.tsx` (AI Hub + AI Program girisleri)
13. `app/ai-program-builder.tsx` (AI Program uretim akisi)
14. `app/ai-program-detail.tsx` (kaydedilen AI program detayi)

Denetim raporlari (gercek durumun kaynagi):

- `PRODUCTION_READINESS_AUDIT.md`
- `CODE_ARCHITECTURE_AUDIT.md`
- `FINAL_MONETIZATION_QA.md`
- `FINAL_RELEASE_AUDIT.md`
- `REWARDED_ADS_SYSTEM.md`

## 2. Degistirirken Uyulacak Kurallar

- Proje Expo SDK 54 kullaniyor. Kod yazmadan once `https://docs.expo.dev/versions/v54.0.0/` referans alinmali.
- Yeni gorunen metinler inline yazilmamali. `src/services/messages.ts` icine hem `tr` hem `en` eklenmeli.
- Yeni sayfalarda ust bosluk sorunu tekrar olusturulmamalidir.
  - Ortak ust bosluk mantigi `spacing.screenHeaderOffset`
- Tab / alt bosluk standardi korunmalidir.
  - Ortak alt bosluk mantigi `spacing.tabContentBottom`
- Kullanici tekrar tekrar "ust bosluk fazla" demek zorunda kalmamali.
- Koc tercihleri tekrar teknik ayar ekranina dondurulmemeli.
- Ana sayfadaki kart secimi tekrar manuel ayara cevrilmemeli.
- AI davranisi `docs/FORGE_AI_CONSTITUTION.md` anayasasina uymali (guvenlik > optimizasyon, belirsizlikte dusuk risk).
- Kod degisikliginden sonra kalite bariyeri temiz kalmali:
  - `npm run check:quality`

## 3. Projede Su An Zaten Yapilmis Olanlar

Bunlari yeniden yapmaya calisma:

### 3.1 Cekirdek deneyim

- Kisisel antrenman adiminda kilo girildikten sonra sonraki sete / harekete gecince otomatik onay davranisi var
- Su takibinde gosterim `2.25` formatinda ve artir / azalt `250 ml` adimiyla calisiyor
- Koyu temada kart arkasi fazla siyah etkisi azaltildi (`GlassCard`)
- Kadin kullanicilar icin Pilates / Yoga ve ev odakli yeni programlar eklendi
- Kadin profilinde dongu takibi gorunuyor, erkekte gizleniyor
- Kisisel Koc ekrani aktif; koc tercihleri sadelesti (sadece ekipman, hassas bolgeler, hatirlatma)
- Ana sayfa kartlari otomatik onceliklendiriliyor (manuel kart secimi kaldirildi)
- Yeni baslikli sayfalarda ortak ust / alt bosluk standardi uygulandi

### 3.2 AI Hub

- Beslenme analizinde toplam gramaj girisi ve sonuc duzenleme var
- Fizik analizi (front + back) ve yemek cekme akislarinda fotograf nasil cekilecegine dair gorsel yonlendirme var
- Fizik analizi ilk deneme ucretsiz mantigi + premium sinirsiz erisim mantigi var
- Sonuclar cihazda saklaniyor

### 3.3 AI Program Builder

- `app/ai-program-builder.tsx` uretim akisi (adimli kurulum, draft resume, opsiyonel adim atlama, ready-state restore)
- `app/ai-program-detail.tsx` kaydedilen program detay ekrani
- Erisim noktalari:
  - Antrenman sekmesi `app/(tabs)/fitness.tsx` (QuickActions + SavedPlansSection)
  - AI Hub `src/screens/AIHubScreen.tsx` (program karti + fizik sonucundan giris)
- Arkada zengin motor yigini: karar, assembly, progresyon, volume, autoregulation, plateau, recovery, evidence, koç anlatimi, editor, swap, gecmis, geri bildirim, wearable adapter
- Analytics olaylari ayrik: `ai_program_generation_started`, `ai_program_saved`

### 3.4 Monetizasyon

- RevenueCat env okuma + entitlement + premium kapilari + premium ekrani + restore + premium program/AI kilitleme
- Sunucu-tarafli kota otoritesi (`app/api/ai-analyze+api.ts`, `src/server/aiMonetization.ts`): istek ID, tekrar korumasi, premium dogrulama
- Rate limiting Upstash tabanli (`src/server/rateLimit.ts`); Upstash yoksa in-memory fallback
- Odullu reklam iskeleti (`src/services/rewardedAdService.ts`, `rewardedCreditStore.ts`): meal/physique ayri kredi, gunluk 3 kap, premium haric tutma, mock + native-ready AdMob, sunucu-tarafli kredi talebi
- Sanitized sunucu logger'i (`src/server/serverLogger.ts`)
- Release baraji `npm run check:release`

### 3.5 Kalite

- 24 test dosyasi / 232 test geciyor (AI Program icin 12 test dosyasi, ayrica rewarded ads, rate limit, premium stack, i18n vb.)
- `npm run check:quality` temiz: typecheck + lint + test + content + expo-doctor

## 4. Projenin Simdiki Ana Hedefi

Bu proje artik "yeni ozellik yigmak" asamasinda degil.

Ana hedef:

- urunu sadelemek
- tekrar eden bilgileri azaltmak
- gercek cihaz deneyimini iyilestirmek
- premium ve AI akislarini guvenilir hale getirmek
- release'e hazirlik yapmak (ortam degerleri + magaza kurulumu haric)

## 5. En Yuksek Oncelikli Isler

Bu sirayla ilerlemek en mantiklisi:

### 5.1 Gercek cihaz UX turu

Kontrol edilecek akislari tek tek ac:

- onboarding
- AI Hub
- AI Program Builder (kaydet + sonra tekrar ac + devam et)
- program baslatma
- program oturumu
- su takibi
- premium gecisleri + odullu reklam modalı
- kisisel koc
- dongu takibi

Beklenen sonuc:

- kullanici her ekranda ilk 2-3 saniyede ne yapacagini anlayabilmeli
- ust / alt bosluklar tutarli olmali
- butonlar, kartlar ve yonlendirmeler cakismamali

### 5.2 Metin ve dil tutarliligi

Kontrol et:

- bozuk Turkce karakterler (terminal mojibake degil, gercek runtime teyidi)
- ayni anlama gelen farkli buton isimleri
- fazla teknik veya soguk metinler
- AI Hub hata metinleri

Beklenen sonuc:

- uygulama dili daha insani, daha temiz ve daha tutarli olmali

### 5.3 Premium akislarini dogrulama

Kontrol et:

- paywall
- restore purchase
- entitlement
- ilk ucretsiz analiz limiti (gunluk 1 yemek, haftalik 1 fizik)
- premium olmayan kullanicinin gordugu durum
- odullu reklam sadece uygun durumda cikar

Beklenen sonuc:

- kullanici premium mantigini kolay anlamali
- kilitli ozellikler beklenmedik davranmamali

### 5.4 Bildirim ve akilli hatirlatmalar

Kontrol et:

- hic log girmeyen kullanici
- sadece su takibi yapan kullanici
- aktif spor yapan kullanici
- premium ve free davranis farki varsa ilgili yerler

Beklenen sonuc:

- hatirlatmalar ne sessiz ne fazla israrci olmali
- saat secimi mantikli hissettirmeli

## 6. Koc ve Ana Sayfa Icın Kalan Isler

Ilgili dosyalar:

- [app/(tabs)/index.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/(tabs)/index.tsx)
- [app/personal-coach.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/personal-coach.tsx)
- [src/services/coachPreferences.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/coachPreferences.ts)
- [src/services/personalCoach.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/personalCoach.ts)

Yapilacaklar:

- [ ] Ana sayfa otomatik kart siralamasini gercek kullanim hissine gore ince ayarla
- [ ] Koc kartlari arasinda tekrar eden bilgi varsa azalt
- [ ] "Bugun ne yapmaliyim?" mantigini daha net hale getir
- [ ] Gerekirse haftalik koc hedef ozeti ekle

Basari kriteri:

- ana sayfa kalabalik hissettirmemeli
- koc ekrani ayar paneli gibi degil, yonlendiren bir ekran gibi hissettirmeli
- manuel kart secimi geri getirilmemeli

## 7. Dongu ve Kadin Odakli Deneyim Icın Kalan Isler

Ilgili dosyalar:

- [app/cycle-tracking.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/cycle-tracking.tsx)
- [app/personal-coach.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/personal-coach.tsx)
- [src/services/personalCoach.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/personalCoach.ts)

Su anki durum:

- donguye gore tempo onerisi var
- ama programin set / tekrar / hacim davranisi otomatik degismiyor

Yapilacaklar:

- [ ] Dongu onerilerini sadece bilgi karti olmaktan cikar
- [ ] Period ve luteal fazda daha hafif plan davranisini degerlendir
- [ ] Follicular fazda progresyonu one cikaran mantik dusun
- [ ] Kadin profilde ilgili yonlendirmeleri daha gorunur hale getir

Basari kriteri:

- kullanici "bu ozellik sadece bilgi veriyor" degil, "beni gercekten yonlendiriyor" hissi almali

## 8. AI Hub Icın Kalan Isler

Ilgili dosyalar:

- [src/screens/AIHubScreen.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/screens/AIHubScreen.tsx)
- ilgili AI bilesenleri

Yapilacaklar:

- [ ] Ilk ekrani bir tur daha sadele
- [ ] Fazla aciklama varsa azalt
- [ ] Sonuc ekranlarinda "duzenle / kaydet / devam et" hiyerarsisini netlestir
- [ ] Fotograf cekim yonlendirmelerini anlasilirlik acisindan test et
- [ ] AI hata mesajlarini son kullanici diliyle iyilestir

Basari kriteri:

- ilk ekranda secim kolay olmali
- sonuc ekranlari kafa karistirmamali
- kullanici AI'nin ne yapabildigini ve ne bekledigini net anlamali

## 9. AI Program Builder Icın Kalan Isler

Ilgili dosyalar:

- [app/ai-program-builder.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/ai-program-builder.tsx)
- [app/ai-program-detail.tsx](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/ai-program-detail.tsx)
- [src/services/aiProgramInstanceStore.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiProgramInstanceStore.ts)

Su anki durum:

- Uretim + kaydet + detay ekrani erisilebilir
- Kaydedilen planlar antrenman sekmesinde ve AI Hub'da gorunur
- PRODUCTION_READINESS_AUDIT bu alani "yarim" olarak isaretlemisti; su an erisim noktalari bagli ama tuketim/yasam dongusu kullanici gozunde net olmali

Yapilacaklar:

- [ ] Kaydedilen AI planlarinin ac / kullan / devam et akisini net birinci sinif yolculuk yap
- [ ] AI Program gec faz servislerinin (feedback, history, wearable) UX'e gercekten bagli oldugunu teyit et; bagli degilse yuzeyle veya gizle
- [ ] Kullanici "kaydettim ama nerede?" sorusunu yasamamali

Basari kriteri:

- kaydedilen plan ana antrenman akisinda dogal sekilde gorunmeli
- kullanici plani baslatip biraktiktan sonra nerede devam edecegini kolay bulmali

## 10. UI / UX Tiraslama Isleri

Ilgili alanlar:

- profil
- ana sayfa
- AI Hub
- koc
- program detay ve program oturumu

Yapilacaklar:

- [ ] Profil sekmesini daha net gruplandir
- [ ] Gelismis ayarlari ana akisdan ayir
- [ ] Bos durum ekranlarini daha motive edici hale getir
- [ ] Ayni bilgiyi tekrar eden kartlari azalt
- [ ] Her ekranda tek bir ana aksiyon mantigi oldugunu kontrol et
- [ ] Kart yogunlugunu biraz daha dusur

Basari kriteri:

- kullanici her ekranda neye basacagini dusunmek zorunda kalmamali
- ekranlar "ozellik listesi" gibi degil "yonlendirilmis urun akisi" gibi hissettirmeli

## 11. Muhendislik Borcu (release sonrasi oncelikli)

Ilgili denetim: `CODE_ARCHITECTURE_AUDIT.md`.

Yapilacaklar:

- [ ] God component'leri parcala (oncelik: `app/ai-program-builder.tsx`, `app/program-session.tsx`, `src/screens/AIHubScreen.tsx`)
- [ ] `src/services/messages.ts` alan bazli dosyalara bol (ai, coach, nutrition, programs, settings)
- [ ] `src/data/exercises.ts` (540KB) yukleme mimarisini degerlendir
- [ ] Storage validator tekrarini merkezi bir yardimci katmana tasi

Basari kriteri:

- kalin dosyalar bir sorumluluk birimi haline gelmeli
- merge cakisma baskisi azalmali

## 12. Teknik ve Release Hazirligi

Yapilacaklar:

- [x] `npm run check:quality` temiz (typecheck + lint + test + content + expo-doctor)
- [ ] `.env.production` ortam degerleri (KULLANICI TARAFINDAN DOLDURULACAK): RevenueCat iOS/Android key, AI API URL, support e-posta, Gemini key, RevenueCat secret, Upstash URL+token
- [ ] AdMob uygulama + rewarded unit ID'leri (KULLANICI TARAFINDAN DOLDURULACAK)
- [ ] `EXPO_PUBLIC_PURCHASES_ENABLED=true` zaten `.env.production`'da ayarli
- [ ] Development build ile AI ve premium akislarini tekrar dene
- [ ] Store baglantilarini tamamla (RevenueCat offering/entitlement + App Store Connect + Play Console urunleri)
- [ ] Egzersiz veri seti lisans kontrolunu release oncesi tekrar teyit et
- [ ] Son QA turunu checklist mantigiyla bitir (`docs/QA_CHECKLIST.md` + `docs/MONETIZATION_DEVICE_QA.md`)

Basari kriteri:

- local'de calisiyor olmasi yetmez
- release yolunda satin alma, premium kilitleri, odullu reklam ve AI akislar dogrulanmis olmali

## 13. Opsiyonel Ama Degerli Sonraki Isler

Bunlar zorunlu degil ama guclu deger katar:

- [ ] Haftalik koc plani
- [ ] Ilerleme zaman cizelgesi
- [ ] Yeni baslayan / orta / ileri gibi hazir koc profilleri
- [ ] Evde calisan kullaniciya daha baglamsal ana sayfa

## 14. Bir Gorev Bitti Sayilmasi Icin

Bir AI veya gelistirici yaptigi isi "bitti" diye isaretlemeden once sunlari saglamali:

1. Degisiklik ilgili dosyalarda uygulanmis olmali
2. Yeni gorunen metinler `messages.ts` icinde olmali (hem tr hem en)
3. Ust / alt bosluk standardi bozulmamis olmali
4. Var olan sade koc mantigi yeniden karmasiklastirilmamis olmali
5. `npm run check:quality` temiz gecmeli
6. Sonuc kullanici diliyle kisaca aciklanmali

## 15. Onerilen Is Sirasi

1. Gercek cihaz UX turu
2. Metin ve tutarlilik temizligi
3. Premium, odullu reklam ve bildirim dogrulamasi
4. Ana sayfa ve koc sadeleme
5. AI Program Builder yasam dongusunu kullanici gozunde netlestirme
6. Donguye gore daha akilli plan davranisi (ikinci faz)
7. Son polish ve store hazirligi

## 16. Kisa Yorum

Bu projede bundan sonra en buyuk kazanc yeni buyuk ozellikten degil, su uc seyden gelecek:

- sadelik
- guven
- tutarlilik
