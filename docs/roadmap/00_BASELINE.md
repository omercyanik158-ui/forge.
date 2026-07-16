# Forge V1 Baseline

- Tarih: 2026-07-16
- Repository root: `/Users/omercyanik/Desktop/forgevolution-main`
- İncelenen branch'ler:
  - `main` -> `46dd2e3` (`origin/main` ile aynı)
  - `rescue/program-engine-partial` -> `13c085b` (`origin/rescue/program-engine-partial` ile aynı)
  - `phase/00-baseline` -> `46dd2e3` başlangıç noktası
- Doğrulanan commitler:
  - `46dd2e3` `Integrate 300-template multimodality workout library`
  - `60006ac` `checkpoint: preserve partial program engine work`
  - `13c085b` `fix: complete deterministic program recommendation selection`

## Working Tree Durumu

- Kaynak worktree: `rescue/program-engine-partial`
- Kaynak worktree durumu: dirty, unstaged değişiklikler ve untracked kullanıcı dosyaları içeriyor
- Yeni güvenli worktree: `/Users/omercyanik/Desktop/forge-phase-00`
- Yeni güvenli branch: `phase/00-baseline`
- Yeni worktree durumu: temiz başlangıç, yalnızca repo dışı raporlama için `.baseline-logs/` üretildi

### Korunan kullanıcı değişiklikleri

- Unstaged dosyalar:
  - `app/ai-program-builder.tsx`
  - `app/create-workout.tsx`
  - `app/program-session.tsx`
  - `src/components/ExerciseImageModal.tsx`
  - `src/services/exerciseCatalog.ts`
  - `src/services/templateProgramEngine.ts`
  - `tests/program-recommendation-system.test.ts`
- Untracked dosyalar:
  - `.kilo/plans/1784213158353-recommendation-ui-completion-plan.md`
  - `src/data/exerciseMedia.generated.ts`
  - `src/services/exerciseMedia.ts`
  - `src/services/programRecommendationPresentation.ts`
  - `tests/_diag.tmp.test.ts`
  - `tests/exercise-media.test.ts`
  - `tests/program-recommendation-builder-runtime.test.ts`
  - `tests/program-recommendation-integration.test.ts`
  - `tests/program-recommendation-presentation.test.ts`
- Repo dışı güvenlik klasörü:
  - `/Users/omercyanik/Desktop/forge-baseline-safety-20260716`
  - `unstaged.diff`
  - `staged.diff`
  - `untracked-files.txt`
  - `untracked/` altında kaynakları yerinde bırakılarak kopyalanan kullanıcı dosyaları

## Backup Ref’leri

- `backup/main-before-roadmap-20260716` -> `46dd2e3`
- `backup/rescue-before-roadmap-20260716` -> `13c085b`

## Branch İlişkisi

- Merge-base: `46dd2e3`
- `main..rescue/program-engine-partial`:
  - `60006ac` `checkpoint: preserve partial program engine work`
  - `13c085b` `fix: complete deterministic program recommendation selection`
- `rescue/program-engine-partial..main`: boş
- Karar: `rescue/program-engine-partial` merge edilmemeli; daha sonra seçili parçalar taşınmalı

## Çalıştırılan Kontroller

| Kontrol | Komut | Exit | Sonuç | Süre |
| --- | --- | ---: | --- | ---: |
| Install | `npm ci` | 0 | Pass | 6.92s |
| Typecheck | `npm run typecheck` | 0 | Pass | 6.50s |
| Lint | `npm run lint` | 0 | Pass | 12.42s |
| Test | `npm test` | 1 | Fail | 5.07s |
| Content validation | `npm run check:content` | 0 | Pass | 0.22s |
| Repo hygiene | `npm run check:repo-hygiene` | 1 | Fail | 0.13s |
| Release config check | `npm run check:release-config` | 0 | Pass | 0.11s |
| Expo Doctor | `npm run check:expo` | 1 | Fail | 2.91s |
| Release gate | `npm run check:release` | 1 | Fail | 0.14s |
| Quality gate | `npm run check:quality` | 1 | Fail | 22.50s |

### Sonuç özeti

- `npm test`:
  - 474/475 geçti
  - Başarısız test: `tests/phase-7-release-hardening.test.ts > repository hygiene checker passes for tracked files`
  - Kök neden: `scripts/check-repository-hygiene.mjs` `src/workout-programming/generated/templates300.generated.ts` dosyasını `LARGE_TRACKED_FILE` olarak blokluyor
- `npm run check:repo-hygiene`:
  - Bloklayıcı dosya: `src/workout-programming/generated/templates300.generated.ts`
  - Doğrulanan boyut: `5,403,296` byte
- `npm run check:expo`:
  - 24 Expo patch mismatch bulundu
  - `expo`, `expo-router`, `expo-notifications` ve diğer SDK 57 paketleri beklenen patch seviyesinde değil
- `npm run check:release`:
  - Eksik production anahtar adları:
    - `EXPO_PUBLIC_RC_IOS_API_KEY`
    - `EXPO_PUBLIC_RC_ANDROID_API_KEY`
    - `EXPO_PUBLIC_AI_API_URL`
    - `EXPO_PUBLIC_PRIVACY_URL`
    - `EXPO_PUBLIC_TERMS_URL`
    - `EXPO_PUBLIC_SUPPORT_EMAIL`
    - `GEMINI_API_KEY`
    - `REVENUECAT_SECRET_API_KEY`
    - `UPSTASH_REDIS_REST_URL`
    - `UPSTASH_REDIS_REST_TOKEN`
  - Ek bloklayıcı: `EXPO_PUBLIC_PURCHASES_ENABLED=true` gereksinimi sağlanmıyor
- `npm run check:quality`:
  - `typecheck` ve `lint` geçti
  - `npm test` aşamasında aynı repo hygiene test kırığıyla durdu

## Bilinen Release Blocker’ları

- `src/workout-programming/generated/templates300.generated.ts` tracked source olarak çok büyük
- `README.md` UTF-8 değil
- Expo Doctor paket patch seviyeleri geride
- Production release env anahtarları eksik
- `EXPO_PUBLIC_PURCHASES_ENABLED` release beklentisini karşılamıyor
- Rescue worktree içinde korunması gereken kullanıcı değişiklikleri var; temiz baseline dışında kesinlikle taşınmamalı

## Secret Taraması

- Tracked `.env` dosyası:
  - `.env.example`
- Şüpheli anahtar türü geçen dosyalar:
  - `.env.example` -> `revenuecat_secret`, `gemini_api_key`, `upstash_token`
  - `src/server/revenueCatVerification.ts` -> `revenuecat_secret`
  - `src/server/geminiServer.ts` -> `gemini_api_key`
  - `src/server/upstashRedis.ts` -> `upstash_token`
  - `scripts/release-check.mjs` -> `revenuecat_secret`, `gemini_api_key`, `upstash_token`
  - `docs/REVENUECAT_SETUP.md` -> `revenuecat_secret`
  - `docs/INTEGRATION_STACK.md` -> `revenuecat_secret`, `gemini_api_key`
- Değer gösterilmedi
- Sonuç: path-only taramada çok sayıda referans bulundu; `.env.example` ayrıca canlı secret şüphesi olarak manuel doğrulama gerektiriyor

## Envanter Notları

- Package manager: `npm`
- Lockfile: `package-lock.json`
- Node: `v26.5.0`
- 1 MB üzeri tracked dosyalar:
  - `src/workout-programming/generated/templates300.generated.ts` -> `5,403,296`
  - `src/data/trainingCatalog.generated.ts` -> `3,076,620`
  - `assets/icon.png` -> `1,993,848`
  - `assets/splash-icon.png` -> `1,993,848`
  - `data/forge_workout_library_300/forge_template_exercises_300.csv` -> `1,373,443`
- Duplicate exercise ID kontrolü:
  - `trainingCatalog.generated.ts` içinde `0` duplicate bulundu
- Bundle/import zinciri:
  - Stable ve 300 template datasetleri `src/services/templateProgramEngine.ts` içinde aynı anda import ediliyor
  - Aktif seçim `src/services/workoutEngineFeatureFlags.ts` üzerinden `EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION` ile yapılıyor
  - `CSV_EXERCISES` doğrudan `src/services/exerciseCatalog.ts` içine giriyor
  - `FORGE_PROGRAM_TEMPLATES_300` doğrudan `src/services/templateProgramEngine.ts` ve `tests/forge-workout-library-300-integration.test.ts` tarafından import ediliyor
- Remote URL:
  - `origin -> https://github.com/omercyanik158-ui/forge..git`

## Faz 1 İçin Başlangıç Önerisi

1. Stable 26 dataset ve 300 dataset import/bundle zincirini ayır
2. Repo hygiene blocker olan büyük generated dosya stratejisini netleştir
3. Release env contract ve README encoding problemini düzelt

## `forge.` -> `forge` Manuel Checklist

- GitHub repository gerçek adını doğrula
- Repository rename gerekip gerekmediğini GitHub UI üzerinden kontrol et
- Rename yapılacaksa önce redirect davranışını doğrula
- Local `origin` URL’lerini rename sonrası manuel güncelle
- CI/CD, App Store metadata, docs ve badge URL’lerinde eski repo adını ara
- Expo/EAS veya webhook integrasyonlarında repo adına bağlı ayar varsa yeniden doğrula
- Rename sonrası `git remote -v`, GitHub Actions, release docs ve onboarding linklerini tekrar test et
