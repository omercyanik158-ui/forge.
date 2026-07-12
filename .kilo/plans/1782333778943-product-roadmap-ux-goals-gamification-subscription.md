# FORGE Ürün Yol Haritası: UX Ayrımı, Hedefler, Oyunlaştırma, Abonelik, AI İskeleti

## Context
FORGE fitness uygulamasının profil sekmesinde 4 sorun var: (1) "Hesap Detayları" ve "Vücut Ölçüleri" aynı onboarding formuna gidiyor; (2) "Hedeflerim" bölümü çalışmıyor (hardcoded, `onPress` yok); (3) oyunlaştırma yok; (4) abonelik modeli yok (Premium rozeti sahte). Plan 3 faza bölündü, öncelik sırasına göre.

## Mevcut Durum (doğrulandı)
- `profile.tsx:55-56`: iki buton da `/onboarding?edit=1`'e gidiyor
- `profile.tsx:61-64`: "Aktif Hedefler"/"Başarımlar" hardcoded metin, `onPress` yok
- `profile.tsx:115-117`: "Premium Üye" rozeti hardcoded
- Onboarding 7 adım: `[isim, cinsiyet, yaş, boy, kilo, aktivite, ölçüler]`
- `UserProfile` tipinde goalType/targetWeight/achievement/subscription yok
- `_layout.tsx`: onboarding gate mevcut (`loadProfile` → yönlendirme)

---

## FAZ 1 — UX Ayrımı + Hedefler (acil)

### 1.1 Onboarding filtreleme — `app/onboarding.tsx`
Mevcut `?edit=1` mekanizmasını genişlet:
- `?edit=account` → sadece adımlar [0 isim, 1 cinsiyet, 2 yaş, 5 aktivite]
- `?edit=body` → sadece adımlar [3 boy, 4 kilo, 6 ölçüler]
- `?edit=1` (eski) → geriye dönük uyum için tüm adımlar (yeni onboarding davranışı)
- Filtreleme: `editMode` state'i (`'all' | 'account' | 'body'`), `STEPS_VISIBLE` array ile hangi adımların gösterileceği belirlenir. `canProceed()`, `handleFinish()` ve ilerleme çubuğu (`TOTAL_STEPS`) buna göre ayarlanır.
- Edit modunda: kullanıcı sadece görünür adımları doldurur, `handleFinish` mevcut profile'ı merge eder (eksik alanları korur).

### 1.2 Profil buton ayrımı — `app/(tabs)/profile.tsx`
- "Hesap Detayları" `onPress` → `/onboarding?edit=account`
- "Vücut Ölçüleri" `onPress` → `/onboarding?edit=body`

### 1.3 Hedef sistemi tipleri — `src/types.ts`
```ts
export type GoalType = 'gain' | 'loss' | 'maintain';
// UserProfile'a ekle:
//   goalType?: GoalType;
//   targetWeightKg?: number;
```

### 1.4 Onboarding'e hedef adımı — `app/onboarding.tsx`
- 8. adım olarak "Hedefini Seç" ekle (sadece yeni kayıt `?edit` yokken):
  - 3 `ChoiceCard`: Kas Artışı (gain), Yağ Kaybı (loss), Korumak (maintain)
  - `gain`/`loss` seçilince `NumberInput` ile hedef kilo (kg)
  - `maintain` için hedef kilo gerekmez
- `STEP_TITLES` ve `TOTAL_STEPS` güncellenir (yeni kayıtta 8, edit modunda filtreli)
- `canProceed()` yeni adım için koşul ekler
- `handleFinish` `goalType` + `targetWeightKg` kaydeder

### 1.5 Aktif Hedefler ekranı — yeni `app/goals.tsx`
- TopBar: "Aktif Hedefler" (chevron-back)
- Mevcut hedef gösterimi: tip (ikon + etiket), mevcut kilo → hedef kilo, ilerleme barı (`Math.abs(current - start) / Math.abs(target - start)`)
- Hedef yoksa: "Hedef Belirle" CTA → `/onboarding?edit=account` (hedef adımına)
- Hedef değiştirme: 3 `ChoiceCard` + hedef kilo input → `saveProfile` ile güncelle
- `profile.tsx` "Aktif Hedefler" `onPress` → `/goals`

### 1.6 StatsGrid'e hedef — `app/(tabs)/profile.tsx`
- Mevcut 4 stat'tan birini (veya 5. olarak) hedef ilerlemesi ile değiştir: `%X hedefe` (goalType varsa)

---

## FAZ 2 — Oyunlaştırma + Abonelik Altyapısı

### 2.1 Başarım tipleri — `src/types.ts`
```ts
export type SubscriptionTier = 'free' | 'premium';
export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  unlockedAt?: string;
};
// UserProfile'a ekle:
//   subscription?: SubscriptionTier;
//   streak?: { count: number; lastDate: string };
//   achievements?: string[]; // unlocked achievement IDs
```

### 2.2 Başarım servisi — yeni `src/services/achievementStore.ts`
- `ACHIEVEMENT_DEFS`: sabit rozet listesi (id, title, description, icon, koşul fonksiyonu):
  - `first_meal`: İlk öğün eklendi
  - `streak_7`: 7 gün streak
  - `streak_30`: 30 gün streak
  - `goal_reached`: Hedef kiloya ulaştı
  - `workouts_10`: 10 antrenman (ileride)
  - `meals_50`: 50 öğün
  - `macros_hit`: Günlük makro hedefine ulaştı
- `checkAchievements(profile, meals, streak)`: koşulları değerlendir, yeni açılanları döndür
- `updateStreak(profile)`: bugünün tarihini kontrol et; dün varsa +1, yoksa reset
- Tümü `UserProfile` üzerinden AsyncStorage'a kaydedilir (ayrı key yok)

### 2.3 Streak güncellemesi — meal/profile etkileşimi
- `saveMeal` sonrası veya `nutrition.tsx` `refresh` sırasında `updateStreak` çağrılır
- `checkAchievements` çağrılır, yeni rozet varsa toast/banner gösterilir

### 2.4 Başarımlar ekranı — yeni `app/achievements.tsx`
- TopBar: "Başarımlar"
- Üstte: streak sayacı (büyük sayı + alev ikonu + "Gün Serisi")
- Rozet grid (2 sütun): her rozet `GlassCard` — açıksa renkli ikon + başlık, kilitliyse gri + kilit ikonu + "???"
- Açılma tarihi altta (varsa)
- `profile.tsx` "Başarımlar" `onPress` → `/achievements`; sub metni dinamik: `"{X} Rozet Kazanıldı"`

### 2.5 Abonelik altyapısı — yeni `src/services/subscription.ts`
```ts
export function isPremium(profile?: UserProfile | null): boolean {
  return profile?.subscription === 'premium';
}
export function canAccessFoodSearch(profile): boolean { return isPremium(profile); }
export function canAccessPremiumPrograms(profile): boolean { return isPremium(profile); }
export function canAccessAiPhoto(profile): boolean { return isPremium(profile); }
```

### 2.6 Free/Premium gating
- `nutrition.tsx` "Öğün Ekle" → `add-meal.tsx`:
  - "Ara" tab: free kullanıcıda kilitli overlay ("Premium gerekli" + yükseltme CTA)
  - "Elle Gir" tab: herkes için açık
- `index.tsx` ProgramsCarousel / `programs.tsx`: free'de program kartlarında kilit rozeti, tıklayınca premium CTA
- `profile.tsx`: "Premium Üye" rozeti → `profile.subscription`'a göre dinamik ("Premium" / "Ücretsiz Plan")
- "Premium'a Yükselt" CTA kartı ekle (free kullanıcıda görünür, premium'da gizli)

---

## FAZ 3 — AI Fotoğraf İskeleti (API entegrasyonu sonra)

### 3.1 Stub servis — yeni `src/services/foodPhotoApi.ts`
```ts
export async function analyzeFoodPhoto(imageUri: string): Promise<FoodResult | null> {
  // TODO: GPT-4o Vision / Gemini API entegrasyonu
  // Şimdilik stub: null döner, UI "yakında" mesajı gösterir
  return null;
}
```
- `.env.local`'a `EXPO_PUBLIC_OPENAI_KEY` placeholder (şimdi dolu değil)
- Gerçek implementasyon: imageUri → base64 → API → JSON parse → FoodResult

### 3.2 Kamera/galeri iskeleti — `app/add-meal.tsx`
- "Ara" / "Elle Gir" tab'larına 3. olarak "Foto" tab ekle (premium-only)
- `expo-image-picker` ile kamera/galeri seçimi
- Seçilen fotoğraf → `analyzeFoodPhoto` stub → sonuç yoksa "AI analizi yakında" mesajı
- Free kullanıcıda: tab kilitli, premium CTA

---

## Out of Scope
- Gerçek IAP (RevenueCat/StoreKit) — local bayrak kullanılır, üretime yakın eklenir
- Backend / auth / kullanıcı hesabı — tüm veriler AsyncStorage local
- AI API key ve gerçek entegrasyon — Faz 3 stub ile hazır, API sonra
- Workout tracking (gerçek antrenman kaydı) — fitness sekmesi "YAKINDA" olarak kalır
- Leaderboard / sosyal özellikler

## Validation (Faz 1 için)
1. `npx tsc --noEmit` temiz
2. `?edit=account` → sadece isim/cinsiyet/yaş/aktivite adımları; `?edit=body` → sadece boy/kilo/ölçü
3. Yeni kayıtta 8. adım (hedef) görünür; hedef seçilmeden bitirilemez
4. `/goals` ekranı: hedef + ilerleme doğru; hedef değiştirme çalışır
5. Edit modunda mevcut profil verileri korunur (merge)

## Validation (Faz 2 için)
1. Rozet koşulları doğru tetiklenir (örn. ilk öğün → `first_meal` açılır)
2. Streak: ardışık günlerde +1, atlanan günde reset
3. Free kullanıcı: arama kilitli, elle giriş açık; premium'da her şey açık
4. "Premium Üye" rozeti subscription durumuna göre dinamik

## Implementasyon Notu
Her faz ayrı implementasyon oturumunda yapılmalı. Faz 1 bağımsız; Faz 2 Faz 1'in `UserProfile` değişikliklerine dayanır; Faz 3 Faz 2'nin premium gate'ine dayanır.
