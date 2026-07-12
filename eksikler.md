# Eksikler ve Temizlik Raporu

Tarih: 2026-07-10
Kapsam: Expo / React Native uygulamasında route'lar, son UI akışları, kalite komutları, kullanılmayan adaylar, metin tutarlılığı, güvenlik/sır yönetimi ve yayın hazırlığı tarandı.

## Genel Durum

- `npm run typecheck` temiz geçti.
- `npm run lint` temiz geçti (`--max-warnings=0`).
- `npm run check:content` temiz geçti. Bu komut (`scripts/quality-check.mjs`) şunları doğrular: `app/` + `src/` içinde mojibake/ASCII-Türkçe düşüşü, `app.json` (bundleIdentifier, package, version, scheme), `programCatalog.ts` reçeteli egzersiz ID'leri (≥20), 7 ücretsiz + 5 premium program sayısı, `messages.ts` tr/en çeviri dengesi ve boş değer yokluğu.
- `npm run check:expo` temiz geçti: Expo Doctor 18/18.
- `npm run test` çıktısı: **48 test dosyası, 466 test** (tümü geçti).
  - ⚠️ **Doğrulama notu (önemli):** Bu sayılar iki katına çıktı çünkü vitest, `.kilo/worktrees/holistic-sting/tests/` Agent Manager çalışma ağacını da taradı. Gerçek tekil test takımı **24 dosya / ~233 test**'tir. Kök neden: `vitest.config.ts` içinde `exclude` tanımı yok; varsayılan glob `.kilo/**` altındaki worktree'leri de topluyor.
  - Önerilen düzeltme: `vitest.config.ts` içine `test: { exclude: ['**/node_modules/**', '**/.kilo/**', '**/dist/**'] }` ekle (bkz. Yüksek Öncelik #3).
- `npm run check:release` geçmedi; ayrıntılar Yüksek Öncelik #1'de.

## Yüksek Öncelik

### 1. Yayın ortam değişkenleri ve `check:release` denetim yüzeyi

`scripts/release-check.mjs` yalnızca "eksik değer" aramaz; aşağıdaki tüm kapılarda geçer. Her kapının mevcut durumu:

| Kapı | Gereksinim | Durum |
|---|---|---|
| `EXPO_PUBLIC_RC_IOS_API_KEY` | Dolu | ❌ Eksik |
| `EXPO_PUBLIC_RC_ANDROID_API_KEY` | Dolu | ❌ Eksik |
| `EXPO_PUBLIC_AI_API_URL` | Dolu + HTTPS | ❌ Eksik |
| `EXPO_PUBLIC_PRIVACY_URL` | Dolu + HTTPS | ⚠️ Dolu (GitHub raw) ama yayın erişilebilirliği doğrulanmalı |
| `EXPO_PUBLIC_TERMS_URL` | Dolu + HTTPS | ⚠️ Dolu (GitHub raw) ama yayın erişilebilirliği doğrulanmalı |
| `EXPO_PUBLIC_SUPPORT_EMAIL` | Dolu + geçerli e-posta | ❌ Eksik |
| `GEMINI_API_KEY` | Dolu | ❌ Eksik (production env) |
| `REVENUECAT_SECRET_API_KEY` | Dolu | ❌ Eksik |
| `UPSTASH_REDIS_REST_URL` | Dolu | ❌ Eksik (production env) |
| `UPSTASH_REDIS_REST_TOKEN` | Dolu | ❌ Eksik (production env) |
| `EXPO_PUBLIC_PURCHASES_ENABLED` | `true` | ✅ Hazır (`.env.production`) |
| AdMob test mode | Etkinken `ADMOB_TEST_MODE=false` + 6 ad-unit | ✅ Atlandı (`ADMOB_ENABLED=false`) |
| Yasak desenler | `app/`+`src/` içinde TODO/FIXME, yer tutucu, `localhost` yok | ✅ Temiz (doğrulandı) |
| `docs/APP_STORE_METADATA.md` | Support/Privacy placeholder ve GitHub blob URL yok | ✅ Temiz (doğrulandı) |

Not: `PRIVACY_URL` ve `TERMS_URL`, `omercanyik158-ui/forge` GitHub raw kaynağına işaret ediyor. `release-check.mjs` yalnızca `github.com/.../blob/...` biçimini reddeder, raw URL'leri geçer; ancak bu sayfaların gerçekten yayınlandığı/erişilebilir olduğu elle teyit edilmeli.

Etkisi: App Store / Play Store veya production release öncesi bloklayıcıdır. Lokal geliştirmede uygulama çalışabilir ama AI, premium doğrulama, destek ve rate-limit tarafları production'da güvenilir olmaz.

### 2. `Planlarım` kaldırıldı ama bazı çeviri anahtarları kaldı

`app/my-plans.tsx` kaldırılmış ve `/my-plans` route referansı kalmamış. Ancak `src/services/messages.ts` içinde eski `my_plans.*` anahtarlarının çoğu duruyor.

Hâlâ kullanılanlar (doğrulandı — `app/(tabs)/fitness.tsx` satır 398, 401, 412):

- `my_plans.shortcut_empty_title`
- `my_plans.shortcut_empty_body`
- `my_plans.empty_cta_ai`

Kullanılmıyor gibi görünen eski yönetim anahtarları (ana blok, satır 581–611):

- `my_plans.screen_title`
- `my_plans.continue_*`
- `my_plans.shortcut_title`
- `my_plans.manage`
- `my_plans.shortcut_view_all`
- `my_plans.shortcut_count*`
- `my_plans.stat_days`
- `my_plans.stat_weeks`
- `my_plans.stat_first_week`
- `my_plans.next_day_label`
- `my_plans.last_activity_label`
- `my_plans.completed_all_days`

⚠️ **Ek (önceki raporda eksikti):** Aşağıdaki iki anahtar da tanımlı ama hiç referans almıyor ve ~1.800 satır uzakta (satır 608 ve 2426) durduğu için temizlikte kolayca gözden kaçar:

- `my_plans.empty_cta_custom` (satır 608)
- `my_plans.stat_progress` (satır 2426)

Öneri: Boş durum metinleri `fitness.*` altına taşınsın; tüm kullanılmayan `my_plans.*` anahtarları (yukarıdaki ikisi dahil) silinsin.

### 3. Test çift sayımı — `vitest.config.ts` worktree tarıyor

`npm test` çıktısındaki 48/466 sayıları, `.kilo/worktrees/holistic-sting/tests/` içindeki 24 kopya dosyanın da çalıştırılmasından kaynaklanıyor. Bu durum hem bildirilen kapsamayı şişirir hem de worktree'deki farklı kod test edilirse yanıltıcı sonuçlara yol açar.

Öneri: `vitest.config.ts`'e `test.exclude` eklenip `.kilo/**` ve `node_modules/**` hariç tutulsun. Sonra gerçek tekil sayı raporlansın (beklenen: 24 dosya).

## Orta Öncelik

### 4. AI split metinlerinde `Üst Gövde / Alt Gövde` kalmış (tam liste)

`src/services/aiProgramSplitRules.ts` içinde kullanıcıya sızabilecek 10 yer var:

- Satır 18: `label: 'Üst Gövde / Alt Gövde'`
- Satır 20: `label: 'Üst Gövde / Alt Gövde Denge'`
- Satır 38: `'… üst gövde öncelikli tam vücut'`
- Satır 39: `'… alt gövde öncelikli tam vücut'`
- Satır 40: `'… tam vücut …'`
- Satır 44: `['1. gün: üst gövde', '2. gün: alt gövde', '3. gün: tam vücut köprüsü']`
- Satır 57: `['1. gün: tam vücut', '2. gün: öncelik vurgulu tam vücut']`
- Satır 58: `['1. gün: tam vücut', '2. gün: üst gövde vurgusu', '3. gün: alt gövde vurgusu']`
- Satır 59: `['1. gün: üst gövde A', … 'alt gövde veya tam vücut köprüsü']`
- Satır 62: `'… minimalist ev tam vücut akışı …'`

Hedef dil: `Üst Vücut / Alt Vücut` ve `Tüm vücut`. `textUtils` render sırasında bazılarını normalize ediyor ama motor metinleri doğrudan başka bir yüzeye düşerse tutarsızlık oluşabilir.

Öneri: Kaynak metinler de normalize edilsin; sadece render katmanına güvenilmesin. Yukarıdaki 10 satır tek tek düzeltilip testlerle teyit edilmeli.

### 5. Program katalogunda `Full Body` ve `kadin-*` izleri (tam liste)

Bulunanlar (`src/services/programCatalog.ts`):

- Satır 38: `PROGRAM_STYLE_OPTIONS` hâlâ `'Full Body'` içeriyor.
- Satır 218 / 226 / 234: **Gün başlıkları** `'Full Body A'`, `'Full Body B'`, `'Full Body C'` — bu başlıklar kart/oturum yüzeyinde kullanıcıya görünebilir ve doğrudan terminoloji tutarlılık hedefiyle çelişir.
- Satır 456: program ID `forge-start-full-body`, `trainingStyle: 'Full Body'`.
- Satır 466: program başlığı `'Atlas Full Body Pro'`, `trainingStyle: 'Full Body'`.
- Bazı program ID'leri teknik olarak `kadin-pilates-akisi`, `kadin-yoga-flow` (satır 459, 460).
- Search terms içinde `kadın`, `women` korunuyor (satır 459, 460).

Not: ID ve search term tarafı geriye dönük uyumluluk / bulunabilirlik için bilinçli bırakılmış olabilir. Ancak kullanıcı yüzünde `Full Body` (özellikle gün başlıkları A/B/C) veya cinsiyetli ifade görünmemesi garanti edilmeli.

Öneri: Görünen filtre etiketleri, gün başlıkları ve kart metinleri `Tüm Vücut` gösterim mapping'iyle kontrol edilsin; teknik ID'ler migration konusu olarak şimdilik kalabilir.

### 6. Antrenman sekmesinde cinsiyete bağlı kart isimleri teknik olarak `WomenCycleCard`

Kodda `WomenCycleCard`, `fitness.women_title`, `fitness.women_body` isimleri duruyor. Eğer metin kullanıcıya nötr görünüyorsa teknik isim tek başına sorun değil; ama önceki geri bildirimlerde cinsiyetli ifade istenmemişti.

İlgili route `app/cycle-tracking.tsx` mevcut ve erişilebilir; bu ekranın başlık/gövde metinlerinin nötr olduğu da doğrulanmalı (bkz. Route Envanteri).

Öneri: Kullanıcı metni nötr kalmalı. İleride refactor yapılırsa bileşen adı `CycleTrackingCard` gibi nötrleştirilebilir.

## Kullanılmayan veya Doğrulanması Gereken Kod Adayları

⚠️ **Metodoloji notu:** Aşağıdaki ilk analiz yalnızca `app/` + `src/` import grafiğine dayanıyordu ve **`tests/` dizinini taramadı**. Bu nedenle AI ileri seviye modüllerinin çoğu yanlış-pozitif çıktı (testler tarafından import ediliyorlar). Aşağıdaki liste `tests/` dahil yeniden doğrulanmıştır.

### Gerçekten kullanılmayan (doğrulandı — sıfır import eden)

UI/form bileşenleri:

- `src/components/Button.tsx`
- `src/components/Checkbox.tsx`
- `src/components/Input.tsx`
- `src/components/Select.tsx`
- `src/components/Textarea.tsx`

Premium/feature:

- `src/features/premium/paywallCopy.ts`
- `src/features/premium/usePremiumAccess.ts`

AI program (tek gerçek aday):

- `src/services/aiProgramFeedbackStore.ts`

### Yanlış-pozitif (testler tarafından kullanılıyor — silinmemeli)

Aşağıdaki modüller ilk raporda "kullanılmıyor" sanılıyordu ama `tests/` altındaki test dosyaları tarafından import ediliyor:

| Modül | Import Eden Test |
|---|---|
| `src/services/aiProgramCoachNarrative.ts` | `tests/ai-program-coach.test.ts` |
| `src/services/aiProgramWearableAdapter.ts` | `tests/ai-program-wearable.test.ts` |
| `src/services/aiProgramEvidenceLayer.ts` | `tests/ai-program-evidence.test.ts` |
| `src/services/aiProgramPlateauDetector.ts` | `tests/ai-program-adaptive.test.ts` |
| `src/services/aiProgramAutoregulation.ts` | `tests/ai-program-adaptive.test.ts` |
| `src/services/aiProgramEditor.ts` | `tests/ai-program-edit.test.ts` |
| `src/services/aiProgramHistory.ts` | `tests/ai-program-edit.test.ts` |

### Doğrulandı: kullanılıyor (listede değildi, teyit)

- `src/components/WorkoutSetSummary.tsx` → `app/workout-log-detail.tsx:26` içinde kullanılıyor. Silinmemeli.

### Muhtemel false-positive / dikkatli yaklaşılmalı

- `src/services/storageService.web.ts` platform özel olabilir.
- `src/server/rateLimit.ts` API route/server katmanı tarafından dolaylı kullanılabilir.
- `src/theme/index.ts` alias barrel olduğu için analizde false-positive görünebilir.
- `src/types.ts` birçok tip alias/import şekli nedeniyle false-positive olabilir.
- `src/theme/accessibility-defaults.ts` doğrudan `app/_layout.tsx` içinde side-effect import ediliyor; kullanılmıyor sanılmamalı.

Öneri: Gerçek adaylar (Button/Checkbox/Input/Select/Textarea, paywallCopy/usePremiumAccess, aiProgramFeedbackStore) tek tek kullanım amacı açısından değerlendirilsin; gerçekten kullanılmıyorsa kaldırılsın veya yeni formlarda standartlaştırılsın.

## Route Envanteri ve Boşta Kalan Durum

### Kaldırılan / boşta

- `app/my-plans.tsx` kaldırıldı; `/my-plans` route referansı bulunmadı.
- Antrenman sekmesindeki AI program kartı artık detay/gün seçimi ekranına gidiyor; direkt seans açma sadece menüdeki hızlı `Başlat` aksiyonunda kalıyor.

### Mevcut route grafiği (denetlenmesi gereken)

24 ekran route'u + 5 sekme mevcut. Bu raporda yalnızca `my-plans` kaldırılması denetlendi; aşağıdaki örtüşme/erişilebilirlik konuları açıkça doğrulanmalı:

- AI yüzeyleri örtüşmesi: `personal-coach.tsx` ↔ `(tabs)/ai.tsx` ↔ `ai-program-builder.tsx` ↔ `ai-program-detail.tsx` — giriş noktaları ve niyet ayrımı netleştirilmeli.
- Program zinciri: `programs.tsx` ↔ `program-detail.tsx` ↔ `program-session.tsx` bütünlüğü.
- `cycle-tracking.tsx`: `WomenCycleCard` cinsiyet endişesi (Madde 6) ile birlikte ekran metinleri nötr mü, doğrulanmalı.

Tüm route'lar: `+not-found`, `achievements`, `add-meal`, `ai-program-builder`, `ai-program-detail`, `barcode-scanner`, `calorie-insights`, `create-workout`, `cycle-tracking`, `goals`, `onboarding`, `personal-coach`, `premium`, `program-detail`, `program-session`, `programs`, `settings-appearance`, `settings-language`, `settings-notifications`, `settings-privacy`, `strength-progress`, `water-tracking`, `workout-log-detail`, `workout-progress`.

Sekmeler: `(tabs)/ai`, `(tabs)/fitness`, `(tabs)/index`, `(tabs)/nutrition`, `(tabs)/profile`.

Öneri: Her route için "giriş noktası → durum" tablosu çıkarılıp hiçbir route yetim kalmadığı teyit edilsin.

## Betik ve Çeviri Varlıkları

`scripts/` dizinindeki dosyaların rolü ve kullanımı:

- `convert-free-exercise-db.mjs` → `npm run build:exercises` ile çalışır; egzersiz veri kümesini üretir.
- `quality-check.mjs` → `npm run check:content` (bkz. Genel Durum).
- `release-check.mjs` → `npm run check:release` (bkz. Madde 1).
- `count-inline.mjs` → ⚠️ Rapor kapsamında kullanımı/purpose'u doğrulanmadı; bir kalite ölçümü gibi görünüyor ama hangi komutla çağrıldığı netleştirilmeli.
- `exercise-instruction-translations.json`, `exercise-name-translations.json` → büyük çeviri varlıkları. `build:exercises` çıktısına bağlanıp bağlanmadıkları (yetim mi yoksa build hattında mı) doğrulanmalı.

Öneri: `count-inline.mjs` ve iki çeviri JSON'u için kullanım zinciri belgelensin; yetimse kaldırılsın ya da `package.json` scriptlerine bağlansın.

## Güvenlik / Sır Yönetimi

Bu bölüm `AGENTS.md`'deki "Never expose secrets" zorunluluğu gereği eklendi.

- `.env.local` gerçek sırlar içeriyor: `EXPO_PUBLIC_PEXELS_KEY`, `GEMINI_API_KEY`, `UPSTASH_REDIS_REST_TOKEN`.
- `.gitignore` yalnızca `.env` ve `.env*.local` kalıplarını yok sayıyor. Dolayısıyla:
  - `.env.local` gitignore'lu ✅ — gerçek sırlar commit'e girmiyor (doğrulandı).
  - ⚠️ `.env.production` **takip ediliyor** (commit'leniyor). Şu an yalnızca yer tutucu/boş değerler içeriyor, ama hiçbir mekanizma gerçek bir sırın içine yazılmasını engellemiyor.
- `.env.example` tüm anahtarları yer tutucu olarak listeliyor; referans olarak doğru.

Öneri:
1. `.env.production`'nun yalnızca yer tutucu kalacağı bir `git secrets` / pre-commit hook ile garantilensin (RC/RevenueCat/Gemini/Upstosh değerleri boş kalacak).
2. Eğer production sırları gerçekten dosyada tutulacaksa `.env.production` `.gitignore`'a alınıp CI ortam değişkenlerinden beslensin.
3. Mevcut `.env.local` sırlarının kişisel/test amaçlı olduğu ve asla commit edilmediği teyit edilsin.

## Çalışma Ağacı Notları

`git status` şu değişiklikleri gösteriyor:

- Değişmiş dosyalar:
  - `app/(tabs)/fitness.tsx`
  - `app/(tabs)/index.tsx`
  - `app/ai-program-builder.tsx`
  - `src/components/ProgramCard.tsx`
  - `src/components/TopBar.tsx`
  - `src/screens/AIHubScreen.tsx`
- Silinen dosya:
  - `app/my-plans.tsx`
- Untracked doküman/çıktılar:
  - `docs/app-video-analysis-2026-07-10.md`
  - `docs/video-analysis-frames-browser/`
  - `docs/video-analysis-frames/`

Ek: `.kilo/worktrees/holistic-sting/` bir Agent Manager çalışma ağacı olarak fiziksel olarak proje kökünde duruyor ve test komutunu etkiliyor (bkz. Yüksek Öncelik #3).

Öneriler:
1. Commit öncesi untracked video analiz çıktılarının repo'ya girip girmeyeceğine karar verilsin (büyük ikili/medya varlıkları genelde `.gitignore`'a alınmalı).
2. `.kilo/` zaten `.gitignore`'da ise worktree'lerin repo'ya girmemesi teyit edilsin.

## Kod Kalitesi / Bug Riski Özeti

- Derleme, lint, test ve Expo Doctor temiz olduğu için şu an açık TypeScript/lint/test kırığı yok. (Not: test sayısı worktree nedeniyle iki katlı; bkz. #3.)
- Production release için env eksikleri bloklayıcı (bkz. #1).
- En belirgin teknik borç: kaldırılan `Planlarım` ekranından kalan çeviri anahtarları (`empty_cta_custom` ve `stat_progress` dahil iki yetim anahtar) ve bazı eski yönetim metinleri.
- En belirgin ürün dili riski: `Üst Gövde`, `tam vücut`, `Full Body` (gün başlıkları A/B/C dahil), cinsiyetli teknik/search izlerinin bazı yüzeylere sızma ihtimali.
- Kullanılmayan kod adayları gerçekten azaldı (doğrulama sonrası); sadece form bileşenleri, iki premium dosya ve `aiProgramFeedbackStore` manuel karar bekliyor.
- Güvenlik: `.env.local` korumalı ama `.env.production` takipli — sır sızıntısı riskine karşı koruma eklenmeli.

## Önerilen Son Temizlik Sırası

1. `vitest.config.ts`'e `test.exclude` ekle (`.kilo/**`, `node_modules/**`, `dist/**`); gerçek test sayısını teyit et.
2. Tüm kullanılmayan `my_plans.*` anahtarlarını temizle (`empty_cta_custom`, `stat_progress` dahil); aktif boş durum metinlerini `fitness.*` altına taşı.
3. `aiProgramSplitRules.ts` içindeki 10 kullanıcıya dönebilecek metni `Üst Vücut / Alt Vücut / Tüm vücut` diline çek.
4. Program katalog filtrelerinde ve gün başlıklarında `Full Body` görünürse `Tüm Vücut` gösterim mapping'i ekle (`Full Body A/B/C` ve `Atlas Full Body Pro` başlıkları dahil).
5. Kullanılmayan UI form bileşenlerini + `paywallCopy`/`usePremiumAccess` + `aiProgramFeedbackStore`'u doğrula; gerçekten kullanılmıyorsa kaldır.
6. Release env değerlerini tamamla; `PRIVACY_URL`/`TERMS_URL` yayın erişilebilirliğini teyit et.
7. Güvenlik: `.env.production` için sır koruması (pre-commit hook veya `.gitignore` + CI env) ekle.
8. `count-inline.mjs` ve çeviri JSON varlıklarının kullanım zincirini netleştir; untracked video çıktılarını `.gitignore` kararı ver.
9. **Tamamlanma tanımı (DoD):** 1–8 sonrası `npm run check:quality && npm run check:release` yeniden çalıştırılmalı; ikisi de `0` exit koduyle çıkmalı.

## Bu Sürümde Değişenler

- **Test sayısı düzeltildi:** 48/466'nın `.kilo/worktrees` worktree kaynaklı iki katlı olduğu belgelendi; `vitest.config.ts` düzeltme önerisi eklendi (Yüksek Öncelik #3).
- **`check:release` denetim yüzeyi genişletildi:** Sadece eksik env değil, tüm kapılar tabloya döküldü (Yüksek Öncelik #1).
- **İki yetim `my_plans.*` anahtarı eklendi:** `empty_cta_custom`, `stat_progress` (Yüksek Öncelik #2).
- **Kullanılmayan kod adayları doğrulandı:** `tests/` dizini hariç tutulduğu için 7 AI modülü yanlış-pozitifti; gerçekte kullanılanlar işaretlendi, tek gerçek aday `aiProgramFeedbackStore` olarak kaldı.
- **`aiProgramSplitRules.ts` tam 10 satır listelendi** (Orta Öncelik #4).
- **Program kataloğu `Full Body` gün başlıkları eklendi** (Orta Öncelik #5).
- **Yeni bölümler:** Route Envanteri, Betik ve Çeviri Varlıkları, Güvenlik/Sır Yönetimi.
- **Tamamlanma tanımı (DoD)** temizlik sırasına eklendi.
