# FORGE CSV Workout Brain — Codex Entegrasyon Talimatı

Bu paket, çalışma zamanında yapay zekâya rastgele program yazdırmak yerine önceden hazırlanmış ve sürümlenmiş şablonlardan deterministik seçim yapılması için hazırlandı.

## Paket içeriği

- `forge_program_templates.csv`: 26 programın üst bilgileri
- `forge_template_exercises.csv`: 564 antrenman-egzersiz satırı
- `forge_progression_rules.csv`: 6 ilerleme modeli
- `forge_adaptation_rules.csv`: 52 vücut analizi odak kuralı
- `forge_exercise_substitutions.csv`: 27 deterministik alternatif
- `forge_exercise_catalog.csv`: 67 kanonik egzersiz
- `forge_research_sources.csv`: temel araştırma kaynakları
- `manifest.json`: paket özeti ve sayımlar

## Codex'e doğrudan verilecek talimat

```text
You are working inside my existing FORGE React Native / Expo / TypeScript repository.

I have added a curated CSV workout-brain package. The CSV files are the source of truth for workout templates, progression, physique-focus adaptation and exercise substitutions.

FILES

- forge_program_templates.csv
- forge_template_exercises.csv
- forge_progression_rules.csv
- forge_adaptation_rules.csv
- forge_exercise_substitutions.csv
- forge_exercise_catalog.csv
- forge_research_sources.csv

Your job is NOT to write new workout programs.
Your job is NOT to improve, rewrite or creatively alter the CSV content.
Your job is to validate, transform and integrate these curated files into the application.

PRODUCT BEHAVIOR

At runtime the app must:

1. Normalize the user request.
2. Hard-filter incompatible templates.
3. Score compatible templates deterministically.
4. Select the best template.
5. Apply only allowed deterministic substitutions and physique-focus adaptations.
6. Validate the final program.
7. Persist the program instance with source template ID and version.
8. Return the same program for the same normalized inputs unless the user explicitly requests a new variation.

Never call Gemini, OpenAI or another LLM to create the workout.
Never use Math.random().
Never alter the canonical source template object.
Never claim that the routine was invented from scratch.
Use user-facing language meaning:
“Hedeflerine ve tercihlerine göre en uygun program seçildi ve sana göre uyarlandı.”

PHASE A — REPOSITORY INSPECTION

Inspect:

- Current local program generator
- Exercise database and exercise IDs
- Program types
- Active-program persistence
- Zustand stores
- AsyncStorage/Supabase usage
- Program creation screens
- Existing tests

Report a concise implementation plan before changing code.

PHASE B — CSV IMPORT AND VALIDATION

Create a build-time import pipeline.

The original Kaggle research CSV files must not be bundled in the mobile application.
Only this curated FORGE package may be converted to production TypeScript/JSON.

Validate:

- Unique template IDs
- Template version
- Active status
- Valid progression_rule_id
- Correct days_per_week
- Consecutive day indices
- Unique exercise order per day
- Positive sets and reps
- reps_max >= reps_min
- target_rir within 0–5
- Positive rest_seconds
- Every exercise exists in forge_exercise_catalog.csv
- Every source/alternative substitution exists
- No duplicate exercise in one workout day
- Main lifts appear before isolation work
- Template day count equals actual day count

Fail the build when a canonical data error exists.

PHASE C — EXERCISE ID MAPPING

Map canonical CSV exercise IDs to the app’s existing exercise IDs.

Create:

src/workout-programming/data/exerciseIdMap.ts

Do not use fuzzy matching at runtime.

If an exercise has no exact app equivalent:

- Stop that template from becoming active, or
- Add a reviewed exercise entry to the app database.

Generate a missing mapping report.
Do not silently substitute an unrelated exercise.

PHASE D — GENERATED PRODUCTION DATA

Convert CSV files at build/development time into immutable TypeScript or compact JSON under:

src/workout-programming/generated/

Suggested outputs:

- templates.generated.ts
- progressionRules.generated.ts
- adaptationRules.generated.ts
- substitutions.generated.ts

The mobile runtime must not parse CSV files on every launch.

PHASE E — DETERMINISTIC SELECTION ENGINE

Implement:

normalizeProgramRequest()
filterCompatibleTemplates()
scoreTemplate()
selectTemplateDeterministically()
createRequestFingerprint()
findExistingProgramByFingerprint()

Suggested scoring:

- Goal exact match: 35
- Days exact match: 25
- Level exact match: 15
- Equipment compatibility: 10
- Duration fit: 5
- Focus compatibility: 5
- Preferred split: 5

Hard reject:

- Wrong goal
- Wrong days
- Missing required equipment
- Incompatible level
- Impossible duration
- Unsatisfied mandatory exercise restriction

Tie break:

1. Duration fit
2. Equipment fit
3. Lowest adaptation cost
4. Stable template_id ordering

PHASE F — CONTROLLED ADAPTATION

Use `forge_adaptation_rules.csv` as the only source for physique-focus behavior.

Physique analysis must provide structured focus data:

type PhysiqueFocus = {
  muscle: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
};

Rules:

- confidence < 0.60: ignore
- 0.60–0.75: substitution/reorder only; at most a very small set increase
- 0.75–0.90: normal allowed adaptation
- >0.90: maximum CSV rule limit
- Adapt at most two focus muscles
- Never exceed template max_extra_sets_per_focus_muscle_week
- Never change split or progression model
- Never remove required main lifts
- Never create redundant movement patterns
- Never add several similar presses or rows to the same day

Use `forge_exercise_substitutions.csv`.
Choose alternatives deterministically by deterministic_rank and equipment compatibility.

PHASE G — FINAL VALIDATION

Validate the instantiated user program:

- Requested day count
- No restricted exercise
- Available equipment
- No duplicate exercise in a day
- Exercise order
- Main lift preservation
- Rep/set validity
- Progression preservation
- Session-duration bound
- Focus adaptation cap
- No more than two adapted focus muscles
- No excessive same-pattern redundancy
- No empty workout day

Invalid programs must never be saved as active.

PHASE H — PERSISTENCE

Save a user program instance separately from canonical templates:

- id
- userId
- sourceTemplateId
- sourceTemplateVersion
- requestFingerprint
- normalizedRequest
- appliedAdaptations
- workouts
- validationResult
- createdAt
- isActive

If the fingerprint is unchanged, return the existing program.

PHASE I — MIGRATION

Keep the old local generator behind a rollback feature flag until all tests pass:

EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE=true

Do not delete saved user programs.
Add a safe adapter or migration where needed.

PHASE J — TESTS

Add tests for:

- All CSV data validates
- Same request returns same template
- Same request returns same adaptation
- Template objects are immutable
- Equipment filters work
- Exercise restrictions work
- Physique focus respects confidence and volume caps
- Strength template is not converted into bodybuilding
- New variation requires explicit request
- Invalid program is not persisted
- Existing fingerprint returns existing program
- Stable tie breaking
- Every generated exercise ID maps to a real app exercise

DELIVERABLES

Report:

- Files created
- Files modified
- CSV validation results
- Mapping gaps
- Generated data outputs
- Selection logic
- Adaptation logic
- Persistence changes
- UI changes
- Tests and results
- Rollback instructions
- Remaining risks

Do not create new workout templates. Treat the supplied CSV pack as curated source data.
```

## Kullanım sırası

1. ZIP’i aç ve CSV’leri proje kökünde geçici bir `data/forge-workout-brain/` klasörüne koy.
2. Bu Markdown dosyasındaki Codex promptunu gönder.
3. Codex’in önce egzersiz ID eşleme raporu üretmesini bekle.
4. Eşlenmeyen egzersizleri çözmeden motoru aktif etme.
5. Bütün testler geçtikten sonra feature flag’i aç.
6. Eski motoru en az bir sürüm rollback amacıyla sakla.

## Kapsam notu

Bu ilk sürümde 26 özgün şablon vardır. Yüzeysel olarak birbirinin kopyası 100 program üretmek yerine, seçim ve kontrollü uyarlama için sağlam bir başlangıç kütüphanesi oluşturuldu. Yoga ve Pilates eklenmedi; bu disiplinler ayrı kaynak, akış ve güvenlik kuralları gerektirir.
