# Auth + Sync Device QA

Bu checklist, FORGE uygulamasinda Google login, guest -> account migration ve cihazlar arasi sync akisini dogrulamak icin kullanilir.

## Hazirlik

Sunlari dogrula:

- `.env.local` icinde `EXPO_PUBLIC_SUPABASE_URL` var
- `.env.local` icinde `EXPO_PUBLIC_SUPABASE_ANON_KEY` var
- Supabase Auth ayarlarinda `forge://auth/callback` izinli redirect olarak ekli
- Google provider Supabase tarafinda aktif

Komut:

```bash
npx expo start --clear
```

## 1. Google login basic flow

Beklenen:

- `welcome` ekrani acilir
- `Google ile devam et` secilince OAuth akisi baslar
- callback sonrasi uygulama geri acilir

Kontrol:

- yeni kullanici ise `onboarding`
- mevcut kullanici ise `tabs`
- hata olarak `Supabase is not configured` gorunmemeli

## 2. Guest -> account migration

Senaryo:

1. Guest olarak devam et
2. Uygulama icinde veri olustur:
   - profil
   - en az bir ogun veya workout
   - tercihler
3. Profil ekranindan `Hesap ekle`
4. Google ile giris yap

Beklenen:

- guest state temizlenir
- mevcut local veri kaybolmaz
- kullanici login olduktan sonra uygulama acik kalir
- sync status error vermeden tamamlanir

Ozellikle kontrol et:

- `profile`
- `meals`
- `workouts`
- `preferences`
- `rewardedCredits`
- `aiHubAccess`
- `userPrograms`

## 3. Remote hydration / second device

Senaryo:

1. Birinci cihazda hesapla giris yap
2. Veri olustur ve sync tamamlanmasini bekle
3. Ikinci cihazda veya temiz kurulumda ayni hesapla giris yap

Beklenen:

- remote snapshot local cihaza gelir
- onboarding gereksiz yere tekrar acilmaz
- profil ve kayitlar gorunur

Kontrol:

- ana ekran profil verisi
- workout / meal listeleri
- favoriler
- kullanici programlari

## 4. Merge scenario

Senaryo:

1. Hesapla sync edilmis mevcut remote veri olsun
2. Baska bir cihazda veya offline durumda yeni local veri olustur
3. Sonra ayni hesaba giris yap ve sync calissin

Beklenen:

- veri overwrite edilmeden merge olur
- string listelerde duplicate olmaz
- ID bazli listelerde ayni kayit korunur
- daha yeni kayitlar kazanir

## 5. Premium/account relation

Bu turda ana odak auth + sync olsa da su kontrol edilmeli:

- login sonrasi app bozulmadan aciliyor mu
- profil ekranindaki account/sync bilgisi tutarli mi
- signed-in durumda `Hesaptan cik` gorunuyor mu
- guest durumda `Hesap ekle` gorunuyor mu

## Basarisizlik belirtileri

Asagidakiler bug olarak not edilmeli:

- login sonrasi tekrar `welcome` ekranina donme
- session oldugu halde onboarding/tabs yerine bos veya yanlis rota
- local verinin login sonrasi kaybolmasi
- ikinci cihazda remote verinin gelmemesi
- sync durumunun surekli `error` kalmasi
- `Supabase is not configured` hatasi

## Bu checklistten sonra

Bu adimlar temiz gecerse sonraki odak:

1. RevenueCat account linking ve restore QA
2. AdMob rewarded ads device QA
3. Apple Sign-In device QA
