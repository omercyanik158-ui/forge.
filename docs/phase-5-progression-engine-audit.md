# Phase 5 Progression Engine Audit

## Existing Architecture

- `src/services/aiProgramProgressionEngine.ts` builds static multi-week fatigue/progression blocks before a plan is saved.
- It did not process completed workout logs and could not update next-session targets.
- Workout logs are saved through `app/program-session.tsx` into `src/services/workoutStore.ts`.
- AI plans are persisted in `src/services/aiProgramInstanceStore.ts`.
- Template selection, substitutions and physique adaptation were already handled before this phase and were not changed.

## Fixes Applied

- Added a runtime progression engine under `src/workout-programming/progression`.
- Added canonical progression types to `src/types/aiProgramProgression.ts`.
- Added idempotent progression decision persistence at `@forge/progression-decisions`.
- Integrated full AI-program session completion with progression processing after the workout log is saved.
- Added progression preview and debug report contracts.
- Added validation that fails closed for invalid logs or missing progression rules.
- Added explicit exercise-level `progression_rule_id` assignments to every generated template exercise row.
- Removed silent production fallback from template-level progression rules.

## Decision Pipeline

1. Normalize completed set logs by stable set index.
2. Validate program/session/exercise identifiers, completion status, set indexes, reps, load, RIR and RPE.
3. Resolve the template progression rule.
4. Build or load the exercise progression state.
5. Create a deterministic fingerprint excluding timestamps.
6. Reuse an existing decision when the fingerprint already exists.
7. Classify the outcome as success, partial success, failure, skipped, plateau or deload.
8. Apply the smallest safe target change.
9. Validate and persist only valid decisions.

## Supported Rule Types

- `double_progression`
- `linear_load`
- `linear_reps`
- `percentage_based`
- `rep_range`
- `top_set_backoff`
- `rir_based`
- `fixed_load`
- `time_based`
- `distance_based`

## Rule Behavior

- Double progression increases load only when every required set reaches the top of the rep range.
- Linear load increases only after all required sets meet the target.
- Rep-based rules increase reps until the rule upper bound, then hold.
- RIR/RPE rules are conservative when required effort data is missing.
- Top-set/backoff and percentage-based rules are mapped for main-lift contexts; accessory work remains conservative.
- Time/distance rule contracts exist, but current workout logs do not yet capture duration/distance per set.

## Failure Handling

- First valid miss repeats the same target.
- Repeated misses trigger a reviewed load reduction.
- Further repeated misses mark stall.
- Deload is recommended only after the configured threshold.
- Skipped sets do not count as failures.

## Equipment Rounding

- Barbell: 2.5 kg
- Dumbbell pair: 2 kg
- Cable stack: 2.5 kg
- Machine plate: 5 kg
- Kettlebell: 4 kg
- Bodyweight: no arbitrary kilogram progression

## Persistence and Idempotency

- Decisions are stored with a deterministic `progressionFingerprint`.
- The same session/exercise/fingerprint returns the stored decision and does not apply twice.
- Invalid decisions are returned to callers for debug but are never persisted.
- The next exercise state is stored separately from the decision history.

## Bugs Found

- Existing progression was static and not connected to workout logs.
- Workout set logs did not contain RIR/RPE, so RIR-specific rules needed conservative fallback behavior.
- Generated CSV templates previously exposed `progressionRuleId` only at template level, not per exercise.
- `dataHealth` needed a validator for the new progression storage key.

## Final Exercise-Level Assignment Audit

- Active templates: 26
- Template exercise rows: 564
- Progressible exercises: 564
- Explicit exercise-level assignments: 564
- Missing exercise-level assignments: 0
- Generated progression rules: 10
- Main-lift role rows: 68
- Accessory/non-main rows: 496
- Bodyweight rows: 44
- Conditioning rows: 9
- Invalid assignments found and corrected: template-level-only fallback, narrow `applies_to` metadata for bodyweight/fixed/double accessory rules.
- Final validation result: pass.

## Rule Counts By Assignment

- `double_progression`: 352
- `rep_range_accessory`: 90
- `bodyweight_rep_leverage`: 44
- `top_set_backoff`: 24
- `linear_beginner`: 20
- `fixed_load_technique`: 13
- `undulating_strength`: 12
- `time_based_conditioning`: 5
- `distance_based_conditioning`: 4

## Remaining Limitations

- Current UI logs reps and kg, but not per-set RIR/RPE, time or distance.
- Phase 6 should surface progression previews directly in the session UI.
