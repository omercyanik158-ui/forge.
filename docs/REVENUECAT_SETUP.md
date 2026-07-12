# RevenueCat Setup

Bu proje, Expo SDK 54 ve `react-native-purchases` ile RevenueCat entegrasyonuna hazir hale getirildi.

## Gerekli ortam degiskenleri

`.env.local` veya CI secret alanina su degiskenleri eklenmelidir:

- `EXPO_PUBLIC_PURCHASES_ENABLED=true`
- `EXPO_PUBLIC_RC_IOS_API_KEY=...`
- `EXPO_PUBLIC_RC_ANDROID_API_KEY=...`
- `EXPO_PUBLIC_RC_ENTITLEMENT_ID=premium`
- `EXPO_PUBLIC_RC_OFFERING_ID=default`
- `REVENUECAT_SECRET_API_KEY=...` (yalnızca sunucu/EAS Hosting secret alanında)

`REVENUECAT_SECRET_API_KEY` değerini hiçbir zaman `EXPO_PUBLIC_` önekiyle tanımlama. Bu anahtar uygulama paketine girmemeli.

## RevenueCat panelinde

1. Bir proje olustur
2. iOS ve Android uygulamalarini ekle
3. Entitlement olustur: `premium`
4. Offering olustur: `default`
5. Bu offering icine aylik ve yillik package bagla

## App Store ve Play Store tarafinda

1. Aylik ve yillik subscription urunleri ac
2. Product ID'leri RevenueCat product catalog tarafina bagla
3. Sandbox test kullanicilari olustur
4. Android lisans test hesaplarini ekle

## Uygulama tarafinda ne hazir

- Satin alma servisi RevenueCat API anahtarlarini okur
- Uygulama acilisinda store konfiguru edilir
- Entitlement varsa premium tier otomatik senkronize edilir
- Satin alma ve geri yukleme butonlari gercek sonuca baglanir
- AI API kotası, istemcinin gönderdiği premium bilgisine tek başına güvenmez; entitlement durumunu RevenueCat sunucu API'sinden doğrular

## Yayın doğrulaması

Gerekli mağaza, AI, yasal belge ve destek değişkenlerini tek seferde kontrol etmek için:

`npm run check:release`

## Son test

- iOS sandbox satin alma
- iOS restore purchases
- Android test purchase
- Android restore purchases
- Premium ekrani, program kilidi ve premium ozellik kapilari kontrolu
