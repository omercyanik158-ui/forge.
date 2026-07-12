# FORGE App Store Readiness

Bu dokuman, uygulamayi magaza yayini icin son hazirlik seviyesine getirmek icin kullanilir.

## 1. Kritik urun akislari

- Onboarding tamamlanir ve ana sayfaya gecilir
- Profil duzenleme geri donuste mevcut veriyi korur
- Ogun ekleme, manuel ogun, favori sablon ve su takibi calisir
- Egzersiz arama, filtreleme, favorileme ve plan olusturma calisir
- Kisisel plan duzenleme, yeniden adlandirma ve silme calisir
- Program veya ozel plan seansi tamamlaninca loglar dogru kayda islenir
- Bildirim izni alinir, saatler guncellenir, hatirlatmalar acilip kapanir
- Premium ekranindan satin alma, geri yukleme ve entitlement dogrulama test edilir
- AI Hub yemek ve cift poz fizik analizi; izin reddi, zaman asimi, dusuk kaliteli fotograf, kaydetme, karsilastirma ve silme senaryolariyla test edilir

## 2. Magaza oncesi icerik kontrolu

- Egzersiz isimleri ve temel hareketler manuel gozden gecirilir
- Program gunleri ve haftalari gercek antrenman mantigina gore kontrol edilir
- Bos durumlar, hata durumlari ve ilk kullanim ekranlari test edilir
- Turkce ve Ingilizce metinler karsilastirmali kontrol edilir
- Tarih, saat, para birimi ve olcu birimi farkli bolgelerde kontrol edilir

## 3. Teknik son kontrol

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run check:content`
- `npm run check:expo`
- `npm run check:release`
- Gercek cihazda iOS test turu
- Gercek cihazda Android test turu
- Ucak modu ve zayif ag senaryolari
- Buyuk yazi / erisilebilirlik testi
- AI servisi için üretim `GEMINI_API_KEY` ve `EXPO_PUBLIC_AI_API_URL` ayarları, kota sınırları ve servis hata mesajı testi
- RevenueCat sunucu doğrulaması için `REVENUECAT_SECRET_API_KEY`

## 4. Magaza oncesi gerekli harici ayarlar

- App Store Connect urunleri
- Google Play subscription urunleri
- RevenueCat project, entitlement, offering ve package ayarlari
- Destek e-postasi
- Gizlilik politikasi linki
- Magaza ekran goruntuleri

## 5. Yayin karari

Uygulama, premium sandbox testi ve cihaz turu gecmeden yayina alinmamali.
