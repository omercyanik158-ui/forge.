# Tur 6: Onboarding Text/Sıralama + Scroll Boşluk + Bounce

Kapsam: onboarding alt başlık temizliği, boy→kilo sıralaması, scroll alt boşluğu ve bounce. Bug'lar ("Bitir" hatası, "Devam/Geri" donması) KAPSAM DIŞI (ertelendi, kök neden teyidi gerekir). Profil sekmesi içeriği dokunulmaz. Yeni bağımlılık yok.

## 1. Onboarding text temizliği — `app/onboarding.tsx`
Kullanıcının 7 maddelik listesi, tüm alt başlıklara (`STEP_SUBS`) denk geliyor. Hepsini tek seferde kaldır:
- `<Text style={styles.stepSub}>{STEP_SUBS[step]}</Text>` satırını sil (≈:154).
- `STEP_SUBS` dizisini sil (≈:262-270).
- `stepSub` stilini sil (≈:358-362).
- **Korur:** `stepTitle` (adım başlıkları), NumberInput `unit` sonekleri ("kg"/"cm"/"yaş"), step 6 `hint` ("Yağ oranın ABD Deniz Kuvvetleri (Navy) formülüyle hesaplanır.").

## 2. Boy → Kilo sıralaması — `app/onboarding.tsx`
Şu an: yaş(2)→kilo(3)→boy(4). Olacak: yaş(2)→boy(3)→kilo(4). Koordineli değişiklik (yalnızca render swap yetmez, validasyon yanlış adıma bağlanır):
- Render blokları swap:
  - `{step === 3 && ...}` → heightCm: `<NumberInput value={heightCm} onChange={setHeightCm} placeholder="örn. 180" unit="cm" />`
  - `{step === 4 && ...}` → weightKg: `<NumberInput value={weightKg} onChange={setWeightKg} placeholder="örn. 74.5" unit="kg" />`
- `STEP_TITLES` swap: index 3 → `'Boyun'`, index 4 → `'Kilon'`.
- `canProceed()` swap: case 3 → `Number(heightCm) > 0`; case 4 → `Number(weightKg) > 0`.
- age(2), activity(5), measurements(6) case'leri ve render'ları dokunulmaz.

## 3. Scroll alt boşluğu — 8 ekran
- **Stack ekranlar (tab bar YOK, asıl israf):** `onboarding.tsx:148`, `add-meal.tsx:130`, `workouts.tsx:44`, `programs.tsx:36` → `paddingBottom: 120` → `40`.
- **Tab ekranlar (yüzen tab bar'ı temizler):** `index.tsx:49`, `fitness.tsx:50`, `profile.tsx:79`, `nutrition.tsx:63` → `paddingBottom: 120` → `insets.bottom + 88` (64 bar + 24 marj). Son kart tab bar arkasına gizlenmez, israf azalır.
- `nutrition.tsx` paddingTop:96 diğerlerinden (80) farklı — bu turda dokunma (başka konu).

## 4. Bounce / rubber-band
- Tüm ScrollViews'a `alwaysBounceVertical` ekle (iOS; kısa içerikte de zıplatır). iOS `bounces` zaten varsayılan açık.
- Boşluk kısalınca overscroll "boş alanda" değil gerçek içerik sonunda zıplar → daha doğal his.
- **Android:** RN ScrollView native bounce desteklemez. Bu turda KAPSAM DIŞI (3. parti kütüphane gerekir, Expo Go riski).

## Doğrulama
- `npx tsc --noEmit`.
- Manuel:
  - Onboarding'de alt başlık metni yok; adım başlıkları duruyor; birim sonekleri ("kg"/"cm") ve Navy ipucu duruyor.
  - Sıra: isim→cinsiyet→yaş→boy→kilo→aktivite→ölçüler; her adımda boş geçilince "Devam" disabled, dolu olunca aktif.
  - Stack ekranlarda (onboarding/programs/workouts/add-meal) alta inince aşırı boşluk yok.
  - Tab ekranlarda son kart tab bar arkasında değil, alt boşluk makul.
  - iOS'ta overscroll'ta doğal rubber-band.

## Kapsam dışı
- "Bitir" hatası ve "Devam/Geri" donması (ayrı tur; `router.replace('/(tabs)')` hipotezi + handleFinish try/finally teyit gerektirir).
- Android bounce (kütüphane gerekir).
- nutrition paddingTop tutarsızlığı (96 vs 80).
