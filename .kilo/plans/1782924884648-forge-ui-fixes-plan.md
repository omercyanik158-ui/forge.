# FORGE — UI/UX Düzeltmeleri Planı

## Bağlam

Kullanıcı 6 UI/UX sorununu bildirdi. Kod incelemesi yapıldı, çelişkiler netleştirildi.
Uygulama Expo SDK 54 / Expo Router, `src/services/messages.ts` merkezi i18n kataloğu
(inline `{tr,en}` ve `t('key')` her ikisi de çalışır), `check:quality` kalite barajı.

## Kararlar (netleştirildi)

1. **Su sıfırlama (beslenme)** — `water-tracking.tsx` ekranında zaten var (`resetWater`).
   Kullanıcı asıl istedi: **beslenme sekmesindeki su kartında** (`nutrition.tsx` → `WaterCard`)
   de "suyu sıfırla" olsun. `water-tracking.tsx`'e DOKUNMA.
2. **Öğün ekle** — anasayfa + beslenme ikisi de `/add-meal`'e gidiyordu. Karar: anasayfadaki
   beslenme sekmesine yönlendirsin.
3. **AI hub default** — `'physique'` → `'food'`.
4. **Profil Türkçe karakterler** — `profile.tsx` ~40 ASCII'ye düşmüş harf; düzeltilip
   `messages.ts` kataloğuna taşınacak.
5. **Para birimi / dil** — DEĞİŞİKLİK YOK. Mevcut pazar bazlı (`localization.ts:147`
   TR→TRY, EU→EUR, UK→GBP, US/global→USD) + `resolveLanguage` auto (TR dışı en) +
   dil tercihi zaten `settings-language.tsx`'te mevcut. Sadece doğrulandı.
6. **Üst boşluk** — tüm tab ekranları anasayfa referansı `insets.top + 80`.

## Görev Listesi (sıralı)

### Görev 1 — Beslenme su kartına sıfırlama (`app/(tabs)/nutrition.tsx`)
- `WaterCard` component prop listesine `onReset: () => void` ekle (line ~433).
- Parent `NutritionScreen`'de `handleResetWater` ekle: `await resetWater(selectedDate)`,
  sonra `setWaterMl(0)` (mevcut `handleAddWater` pattern'ini izle, line ~120-133).
- Import: `resetWater` zaten `@/services/waterStore`'dan import edilebilir (`addWater` orada).
- `SummaryGrid` (line ~325) → `WaterCard` (line ~425) çağrısına `onReset={handleResetWater}` geçir.
- `WaterCard` içinde su butonları satırına (line ~485-493) "suyu sıfırla" butonu ekle;
  `waterMl === 0` ise devre dışı (`opacity` pattern'i mevcut butonlardan).
- Metinler: `t({ tr: 'Suyu sıfırla', en: 'Reset water' })`. `water-tracking.tsx:70`'teki
  onay Alert pattern'ini uygula (opsiyonel: küçük onay). Kullanıcı beslenme kartında hızlı
  sıfırlama istedi → ayrı Alert yerine doğrudan sıfırlama da kabul; mevcut `resetWater`
  tek gunluk `ml`'yi 0 yapar, `goalMl` korunur.

### Görev 2 — Anasayfa öğün ekle → beslenme (`app/(tabs)/index.tsx`)
- Line 92: `onAddMeal={() => router.push('/add-meal')}` → beslenme sekmesine yönlendir.
- Expo Router tab switch: `router.push('/nutrition')` ((tabs) layout içinde route).
- `index.tsx` importlarındaki `useRouter` kullanımda kalır.

### Görev 3 — AI hub default = beslenme (`src/screens/AIHubScreen.tsx`)
- Line 59: `useState<AIHubMode>('physique')` → `useState<AIHubMode>('food')`.
- Risk notu: premium olmayan kullanıcı AI Hub açınca premium-gated beslenme (food) ekranını
  görür. Mevcut `PremiumFeatureCard` premium'a yönlendirir — kabul edilebilir.

### Görev 4 — Profil Türkçe karakter düzeltme + katalog (`app/(tabs)/profile.tsx`)
- `src/services/messages.ts`'e `profile.*` namespace ekle (mevcut `ai_hub.*`/`premium.*`
  pattern'ini izle). Her anahtar hem `tr` hem `en` dolu OLMALI (`check:content` doğrular).
- `profile.tsx` içindeki TÜM `t({ tr: '...', en: '...' })` inline objeleri → `t('profile.xxx')`.
- Düzeltilecek ASCII hataları (örnek — tümünü tara):
  - `sifirla` → `sıfırla`, `kayitli` → `kayıtlı`, `tum gunluk` → `tüm günlük`
  - `Yag orani` → `Yağ oranı`, `Kas kutlesi artisi` → `Kas kütlesi artışı`
  - `Yag kaybi` → `Yağ kaybı`, `Kiloyu koruma` → (düz)
  - `Kisisel bilgiler` → `Kişisel bilgiler`, `detaylari` → `detayları`
  - `Vucut olculeri` → `Vücut ölçüleri`, `yag orani` → `yağ oranı`
  - `Basarimlar` → `Başarımlar`, `gun seri` → `gün seri`
  - `Gorunum` → `Görünüm`, `Acik veya koyu` → `Açık veya koyu`
  - `Bolge ve fiyatlandirma` → `Bölge ve fiyatlandırma`
  - `gelismis besin` → `gelişmiş besin`, `akici` → `akıcı`
  - `Ayrintilari gor` → `Ayrıntıları gör`, `Ucretsiz plan` → `Ücretsiz plan`
  - `Hesap detaylari` → `Hesap detayları`, `Aktivite` → (düz)
- Alt component'ler de `useAppLocalization`/`t` kullanıyor (`WeeklySnapshotCard`,
  `UpgradeCard`) — onlardaki inline objeleri de kataloğa taşı.
- Sabit metinler de düzelt: `ProfileHeader`'da `'Sporcu'` fallback (düz), grup başlıkları.

### Görev 5 — Üst boşluk eşitleme (`insets.top + 80`)
Tüm tab ekranlarında scroll `contentContainerStyle` `paddingTop`:
- `app/(tabs)/nutrition.tsx:140` — `insets.top + 96` → `insets.top + 80`
- `app/(tabs)/fitness.tsx:44` — `insets.top + 96` → `insets.top + 80`
- `app/(tabs)/profile.tsx:238` — `insets.top + 96` → `insets.top + 80`
- `app/(tabs)/index.tsx:79` — zaten `insets.top + 80` ✓ (referans, dokunma)
- `src/screens/AIHubScreen.tsx:593` (FlashList `contentContainerStyle`) — `insets.top + 2`
  → `insets.top + 80`. AI hub'da `TopBar` yok; padding artışı hero'yu status bar'dan
  ayırır, diğer sekmelerle tutarlı olur.

## Doğrulama
- `npm run check:quality` (typecheck + lint --max-warnings=0 + vitest + check:content +
  expo-doctor 18/18) temiz olmalı.
- `check:content` özellikle `profile.*` katalog bütünlüğünü (tr/en dengesi) doğrular.
- Manuel: beslenmede su sıfırlama, anasayfadan beslenmeye geçiş, AI hub'da beslenme sekmesi
  seçili, profil ekranı Türkçe karakterler, tüm sekmelerde aynı üst boşluk.

## Riskler / Açık Noktalar
- AI hub default food → premium-gated; free kullanıcı premium yönlendirmesi görür (kabul).
- `nutrition.tsx` `WaterCard`'a sıfırlama eklemek layout'u sıkıştırabilir; buton satırı
  `flexWrap` veya ikon-only buton gerekebilir — implementation'da görsel dene.
- Üst boşluk değişimi AI hub'da görsel kayma yapabilir; cihazda doğrula.
