# FORGE CSV Workout Brain Integration Report

Generated: 2026-07-15

## Summary

The curated CSV workout package in `data/forge_workout_csv_pack/` is now integrated as the workout-brain source of truth for template selection and controlled adaptation. The app does not parse CSV at runtime; the package is validated and converted into generated TypeScript data.

## Files Created

- `scripts/generate_forge_workout_brain.py`
- `src/workout-programming/selection/normalizeProgramRequest.ts`
- `src/workout-programming/selection/filterTemplates.ts`
- `src/workout-programming/selection/scoreTemplate.ts`
- `src/workout-programming/selection/selectTemplateDeterministically.ts`
- `src/workout-programming/fingerprint/createProgramRequestFingerprint.ts`
- `src/workout-programming/instantiation/instantiateUserProgram.ts`
- `src/workout-programming/adaptation/adaptProgramForPhysique.ts`
- `src/workout-programming/adaptation/applyExerciseSubstitutions.ts`
- `src/workout-programming/validation/validateInstantiatedProgram.ts`
- `src/workout-programming/persistence/programInstanceRepository.ts`
- `src/workout-programming/engine/createPersonalizedProgram.ts`
- `src/workout-programming/generated/templates.generated.ts`
- `src/workout-programming/generated/progressionRules.generated.ts`
- `src/workout-programming/generated/adaptationRules.generated.ts`
- `src/workout-programming/generated/substitutions.generated.ts`
- `src/workout-programming/generated/exerciseCatalog.generated.ts`
- `src/workout-programming/data/exerciseIdMap.ts`
- `src/workout-programming/types/csvWorkoutBrain.ts`
- `docs/forge-csv-exercise-mapping-report.md`
- `docs/forge-csv-workout-brain-integration-report.md`
- `tests/forge-csv-workout-brain.test.ts`
- `tests/runtime-template-engine.test.ts`

## Files Modified

- `package.json`
- `src/services/exerciseCatalog.ts`
- `src/services/templateProgramEngine.ts`
- `tests/program-catalog.test.ts`

## CSV Validation Results

- Templates: 26
- Template exercise rows: 564
- Progression rules: 6
- Adaptation rules: 52
- Exercise substitutions: 27
- Canonical exercises: 67
- Research sources: 6
- Blocking validation errors: 0

The build-time script validates unique template IDs, active template status, versions, progression rule references, day counts, day indices, exercise order uniqueness, positive sets/reps/rest, RIR range, exercise catalog references, substitution references and duplicate exercises per day.

## Exercise Mapping

- Exact name mappings: 19
- Reviewed alias mappings: 37
- Reviewed app exercise entries added: 11
- Blocking mapping gaps: 0

No runtime fuzzy matching is used. See `docs/forge-csv-exercise-mapping-report.md`.

## Generated Data Outputs

Generated TypeScript data lives under `src/workout-programming/generated/`. The mobile runtime imports immutable generated arrays instead of parsing CSV files.

## Selection Logic

`src/services/templateProgramEngine.ts` now uses the generated CSV templates. The public API remains stable:

- `createProgramRequestFromAnswers()`
- `fingerprintProgramRequest()`
- `matchTemplates()`
- `buildTemplateProgram()`

The engine hard-filters incompatible templates by goal, days, equipment profile, level, duration and restricted required exercises. Compatible templates are scored deterministically using goal, days, level, equipment, duration, focus and preferred split. Tie-breaking is stable.

Runtime orchestration is also exposed through `src/workout-programming/engine/createPersonalizedProgram.ts`, with separate selection, fingerprint, instantiation, adaptation, validation and persistence modules.

## Adaptation Logic

Physique and focus adaptation uses only `forge_adaptation_rules.csv` and `forge_exercise_substitutions.csv`.

- Confidence below 0.60 is ignored.
- Adaptations are capped by template `max_focus_muscles` and `max_extra_sets_per_focus_muscle_week`.
- Split and progression model are preserved.
- Required restricted exercises reject the template.
- Substitutions are chosen deterministically by `deterministic_rank`.

## Persistence

Generated `AIProgramPlan` instances carry:

- `selectedTemplateId`
- `selectedTemplateVersion`
- `requestFingerprint`
- `requestSnapshot`
- `appliedAdaptations`
- `adaptationVersion`

`buildOrReuseRecommendedAIProgram()` reuses an existing stored plan when the fingerprint is unchanged. Invalid generated programs throw before save, so they cannot become active via the builder flow.

## UI Changes

No major UI rewrite was required. Existing builder copy already describes the experience as selecting/recommending a suitable plan rather than inventing one from scratch. The generated plan explanation explicitly says the program was selected from curated CSV templates and adapted safely.

## Rollback

Set:

```bash
EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE=false
```

The legacy path remains available behind the feature flag where a caller provides `basePlan`. Existing saved programs are not deleted or migrated destructively.

## Tests

Commands run:

- `npm run build:forge-workout-brain`
- `npm run typecheck`
- `npm run lint`
- `npm run test`

Results:

- TypeScript: passed
- ESLint: passed
- Vitest: 32 files passed, 351 tests passed

## Remaining Risks

- Some reviewed exercise entries are intentionally added because the existing app catalog lacked exact equivalents.
- Equipment metadata still comes from mixed sources and should become stricter in the next phase.
- The CSV package is curated source-of-truth; future program quality improvements should happen by updating the CSV package and regenerating data, not by runtime randomization.
