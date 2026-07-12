# Plan: Q4 Cleanup + Quality Verification + E3 Unit Tests

Bu plan, FORGE teknik denetiminin (`.kilo/plans/1783024832016-cycle-aware-program-fixes.md`)
kalan engelsiz işlerini kapsar: ölü wrapper'ı kaldır, denetim düzeltmelerinin kalite
barajından geçtiğini doğrula, çekirdek mantık için birim test eksiğini kapat.

**Kapsam dışı (ertelendi):** E1 rate-limit kalıcı depolama (altyapı/dağıtım kararı gerekiyor),
Q3 inline metin migrasyonu (~583 metin, P2).

---

## Başlangıç durumu (doğrulandı)

Denetim düzeltmelerinin çoğu diskte zaten mevcut (spot-check ile teyit edildi):
- E2 `purchaseService.ts:110` — `Object.prototype.hasOwnProperty.call(active, entitlementId())` ✓
- Q1 `subscription.ts` — temiz 54 satır, LEGACY kaldırılmış, dublikasyon yok ✓
- Q2 `scripts/quality-check.mjs:7` — genişletilmiş `asciiTurkishMojibakePattern` ✓
- B1 `analyticsService.ts:36` — standart `await import('posthog-react-native')` ✓
- B3 `foodApi.ts:69` — `FoodApiError('FOOD_SEARCH_FAILED', ...)` kod tabanlı ✓
- R1 `weeklyBalanceAnalysis` — kaynak kodda yok (sadece plan dosyasında) ✓

`core.test.ts` calculations/cycleTracking/trainingAnalysis için ince (her biri 1 mutlu yol)
kapsama sahip; **personalCoach cycle-intensity fonksiyonları için 0 kapsama** (yeni kod).

---

## Görev 1 — Q4: Ölü `revenueCatService` wrapper'ını kaldır

**Bağlam:** `src/services/revenueCatService.ts` (47 satır), `purchaseService.ts`'in her
fonksiyonunu 1:1 saran ince bir katman. Repo geneli grep ile doğrulandı: kod içi 0 çağrı.
Yalnızca `docs/INTEGRATION_STACK.md:7` ve bu plan referans ediyor.

1. `src/services/revenueCatService.ts` dosyasını sil.
2. `docs/INTEGRATION_STACK.md` "## 1. RevenueCat" bölümünü güncelle (satır 5–21):
   - Satır 7 `Client facade: src/services/revenueCatService.ts` satırını kaldır.
   - Satır 8 `Purchase flow: src/services/purchaseService.ts` tek istemci katmanı olarak kalsın
     (gerekirse "Client + purchase flow: src/services/purchaseService.ts" olarak birleştir).
3. Silme sonrası `rg "revenueCatService"` ile kalan referans olmadığını teyit et
   (yalnızca plan/doc referansları kaldıysa kabul).

**Karar:** Kod tarafında değişiklik yok — import bulunmuyor, çağrı noktası güncellemesi gerekmez.

---

## Görev 2 — Doğrulama: Denetim düzeltmelerinin kalite barajından geçtiğini teyit et

1. `npm run check:quality` çalıştır (package.json:18:
   `typecheck && lint && test && check:content && check:expo`).
2. **Mojibake riski:** Genişletilen `asciiTurkishMojibakePattern` (quality-check.mjs:7,
   kelimeler: Haftalik, fotograf, Sinirsiz, bolge, kutuphane, icgoru, akis, degisim, ozeti,
   degerlendirme, gorunur, cekis, itis, gorme, gordum, yukluyor) daha önce yakalanmamış
   mojibake'leri yeni işaretleyebilir.
   - İşaretlenen her dosyayı incele: gerçek mojibake ise düzelt (ASCII → doğru Türkçe karakter).
   - **False-positive riski:** kelime slug/tanımlayıcı/transliterasyon olarak meşru ASCII
     kullanıyorsa düzeltme. Gerçek false-positive teyit edilirse yalnızca o durumu `allowedMojibakeFile`
     benzeri allow-list ile çöz (pattern'i zayıflatma).
3. Typecheck/lint regresyonu varsa düzelt (özellikle subscription.ts yeniden yazımı ve
   analyticsService.ts import değişikliği sonrası).
4. Temiz geçene kadar tekrar çalıştır.

---

## Görev 3 — E3: Çekirdek mantık için birim test kapsamını genişlet

Mevcut konvensiyon: Vitest, `@/` alias, `environment: node`, Türkçe `describe`/`it` etiketleri.
Testler `tests/` altında düz (alt klasör yok). `npm test` (`vitest run`) çalıştırılabilir.

### 3a. YENİ `tests/personal-coach.test.ts` (en yüksek öncelik — 0 kapsama, yeni cycle kodu)

Kaynak: `src/services/personalCoach.ts:14-34` (`computeCycleIntensity`, `applyCycleIntensity`).

- `computeCycleIntensity`:
  - `null`/`undefined` → `'normal'`
  - `phase: 'period'` → `'lighter'`
  - `phase: 'luteal'` → `'lighter'`
  - `phase: 'follicular'` → `'strong'`
  - `phase: 'fertile'` → `'strong'`
  - `phase: 'ovulation'` → `'strong'`
  - bilinmeyen phase → `'normal'`
- `applyCycleIntensity`:
  - `'lighter'`: sets 3→2; sets 2→2 (floor 2); rir 2→3; rir 4→4 (cap 4); restSeconds 60→72 (×1.2)
  - `'lighter'` + restSeconds undefined → undefined kalır
  - `'strong'`: rir 3→2; rir 1→1 (floor 1); sets/rir değişmez
  - `'normal'`: nesne değişmeden döner (referans/yapı koruması)

### 3b. Genişlet `tests/calculations.test.ts` (mevcut core.test.ts'i tamamlayacak yeni dosya)

Kaynak: `src/services/calculations.ts`. `core.test.ts` yalnızca `calorieGoal` loss/gain ve
`navyBodyFat` invalid yolunu kapsıyor. Eksik:
- `bmr`: erkek `base+5`, kadın `base-161`
- `tdee`: `bmr * ACTIVITY_FACTOR` (ör. moderate 1.55)
- `macroGoals`: maintain protein `weightKg*1.6`, diğer hedefler `*1.8`
- `macroGoalsFromCalories`: 30/40/30 dağılımı
- `goalProgress`: maintain/`targetWeightKg==null` → null; loss yönde ilerleme; hedefe ulaşınca pct=100; total=0 → pct 100
- `mealTotals`: boş dizi → tümü 0; çoklu öğün toplamı
- `calorieGoal` clamp: kadın minimum 1200, erkek 1500, üst 5000
- `navyBodyFat`: kadın yolu (hipCm gerekli), clamp aralığı [2,60]

### 3c. Genişlet `tests/cycle-tracking.test.ts`

Kaynak: `src/services/cycleTracking.ts:120` `summarizeTracking`. `core.test.ts` tek mutlu yol.
Eksik:
- `lastPeriodStartDate: null` → null döner
- phase sınırları: cycleDay ≤ periodLength → `'period'`; follicular → fertile → ovulation → luteal geçişleri
- cycle rollover: elapsedDays > cycleLengthDays → yeni `currentCycleStartDate`
- uzunluk clamp: cycleLengthDays 21–40 dışı, periodLengthDays 2–10 dışı default'a çekilir
- `daysUntilNextPeriod` ≥ 0 clamp

### 3d. Genişlet `tests/training-analysis.test.ts`

Kaynak: `src/services/trainingAnalysis.ts:295` `analyzeWeeklyTraining`. `core.test.ts` tek test.
Eksik:
- sufficiency sınırı: 0 log → `'empty'`; 1–2 log → `'limited'`; ≥ `MIN_LOGS_FOR_ANALYSIS` (3) → `'sufficient'`
- pplBalance eşikleri: `itis_fazla`, `cekis_fazla`, `bacak_dusuk`, `dengeli`
- region status eşikleri: eksik/dusuk/dengeli/yeterli/yogun (6/12/18 set sınırı)
- hafta dışı log'lar hariç tutulur (tamamlanma tarihi weekStart'tan önce)
- fallback yolu: `muscleGroups` ile `exerciseIds` olmadan (katalog bağımlılığı olmadan bölge sınıflandırma testi)

**Not:** `regionFromMuscleLabel`/`classifyPpl` dışa aktarılmıyor — `analyzeWeeklyTraining`
üzerinden dolaylı test edilir. Kataloga bağlı `getExerciseById` çağrısından kaçınmak için
fallback (`muscleGroups`) yolu tercih edilir; katalog gerektiren testler mevcut gerçek
egzersiz ID'leri kullanır (core.test.ts'teki gibi).

---

## Doğrulama

- `npm test` — yeni + mevcut tüm testler yeşil.
- `npm run check:quality` — typecheck + lint + test + content + expo-doctor temiz.
- Mojibake false-positive çıkmadığından emin ol.

## Riskler

1. **Genişletilen mojibake pattern'i false-positive üretebilir** — slug/tanımlayıcıdaki
   meşru ASCII Türkçe kelimeler. Her işareti gerçek mojibake mi yoksa meşru kullanım mı diye incele.
2. **trainingAnalysis testleri katalog ID'lerine bağlı** — egzersiz veri kümesi değişirse kırılır.
   Riski azaltmak için fallback `muscleGroups` yolu kullan.
3. **personalCoach `loadCoachSnapshot` test edilmiyor** — çok sayıda store bağımlılığı var,
   mock ağırlıklı olur; bu plan yalnızca saf `compute/applyCycleIntensity` fonksiyonlarını kapsar
   (yüksek değer, düşük kompleksite).

## Açık sorular

- Yok (kapsam ve kararlar netleştirildi). E1 ve Q3 açıkça kapsam dışı bırakıldı.
