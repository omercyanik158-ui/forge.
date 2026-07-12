# Sekme ekranlarındaki alt boşluğu azaltma

## Hedef
Ana sekmelerin (Ana Sayfa, Antrenman, Beslenme, AI Hub, Profil) en altında, son kart
ile tab bar arasındaki aşırı boşluğu küçültmek ve 5 sekmede tek tip bir değerde
toplamak.

## Teşhis
5 ana sekmenin scroll/FlashList içeriğinde alt boşluk `paddingBottom: insets.bottom + X`
formülüyle ayarlanıyor. İçerik tab bar'ın altına taşmıyor (tab bar kendi 58px'lik
alanını ayırır), yani `+X` değeri gereksiz büyük. `X` her ekranda farklı:

| Sekme | Dosya:Satır | X (eski) | ~Toplam boşluk (notch) |
|---|---|---|---|
| Ana Sayfa | `app/(tabs)/index.tsx:79` | 88 | ~122px |
| Antrenman | `app/(tabs)/fitness.tsx:45` | 96 | ~130px |
| Beslenme | `app/(tabs)/nutrition.tsx:153` | 88 | ~122px |
| AI Hub | `src/screens/AIHubScreen.tsx:633` | 106 | ~140px |
| Profil | `app/(tabs)/profile.tsx:232` | 56 | ~90px |

Tab bar yüksekliği = 58 (`app/(tabs)/_layout.tsx:33`).

## Karar
- Tek tip değer: **`insets.bottom + 24`** (kullanıcı seçimi: "Orta").
  - Notch cihazda ~58px, Android'de ~24px alt boşluk. Profil kadar sıkı, biraz nefesli.
- Değer `spacing` kataloğunda merkezileştirilir, böylece 5 ekran tekrar dağılmaz.

## Görevler (uygulama sırasıyla)

1. **Paylaşılan sabit ekle** — `src/theme/spacing.ts`
   - Mevcut `spacing` nesnesine ekle: `tabBarClearance: 24,`
   - `SpacingKey` otomatik genişler (`as const` mevcut).

2. **Ana Sayfa** — `app/(tabs)/index.tsx`
   - Satır 79: `paddingBottom: insets.bottom + 88`
     → `paddingBottom: insets.bottom + spacing.tabBarClearance`
   - `spacing` zaten import ediliyor (satır 1). Doğrula.

3. **Antrenman** — `app/(tabs)/fitness.tsx`
   - Satır 45: `paddingBottom: insets.bottom + 96`
     → `paddingBottom: insets.bottom + spacing.tabBarClearance`
   - `spacing` zaten import ediliyor (satır 1). Doğrula.

4. **Beslenme** — `app/(tabs)/nutrition.tsx`
   - Satır 153: `paddingBottom: insets.bottom + 88`
     → `paddingBottom: insets.bottom + spacing.tabBarClearance`
   - `spacing` zaten import ediliyor (satır 1). Doğrula.

5. **AI Hub** — `src/screens/AIHubScreen.tsx`
   - Satır 633: `paddingBottom: insets.bottom + 106`
     → `paddingBottom: insets.bottom + spacing.tabBarClearance`
   - Burada FlashList kullanılıyor ama desen aynı (`contentContainerStyle.paddingBottom`).
   - `spacing` zaten import ediliyor (satır 32). Doğrula.

6. **Profil** — `app/(tabs)/profile.tsx`
   - Satır 232: `paddingBottom: insets.bottom + 56`
     → `paddingBottom: insets.bottom + spacing.tabBarClearance`
   - `spacing` zaten import ediliyor (satır 19). Doğrula.

## Değişmeyenler
- Tab bar yüksekliği (58), `safeAreaInsets={{ bottom: 0 }}`, `paddingTop` değerleri.
- Bölüm aralıkları (`gap`, `sectionGap`) ve kart iç boşlukları.
- Yalnızca `paddingBottom` formülündeki sabit küçülüyor.

## Riskler
- İçerik tab bar altına taşmadığı için bu güvenli bir küçültmedir; son kartlar okunaklı kalır.
- AI Hub FlashList kullansa da aynı `paddingBottom` deseni geçerli.
- AI Hub ekranı dinamik içerik üretiyor (header'da alt kartlar var); 24'lük boşluk yine de
  yeterli nefes sağlar.

## Doğrulama
- `npm run check:quality` (typecheck + lint + test + content + expo-doctor) temiz olmalı.
- Cihazda 5 sekme sırayla açılıp en alta scroll edildiğinde son kart ile tab bar arası
  tek tip ve dar boşluk görünmeli.

## Kapsam dışı
- Alt sekme (sub-tab) / alt sayfalar (`/programs`, `/add-meal` vb. modal/push ekranlar).
- TopBar veya `paddingTop` ile ilgili değişiklikler.
