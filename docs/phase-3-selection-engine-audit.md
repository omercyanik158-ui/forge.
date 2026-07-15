# FORGE Phase 3 Selection Engine Audit

Date: 2026-07-15

## Current Architecture

The runtime program creation flow uses the curated CSV template library as the source of truth.

Flow:

1. UI answers are collected in `app/ai-program-builder.tsx`.
2. `createProgramRequestFromAnswers` converts answers into a normalized `ProgramRequest`.
3. `matchTemplates` hard-filters and scores templates.
4. `selectTemplateDeterministically` selects the highest-ranked compatible template.
5. `buildTemplateProgram` instantiates the selected template, applies substitutions/adaptations, orders exercises, validates, and converts to `AIProgramPlan`.
6. Existing-program reuse compares the stable request fingerprint before recreating.

## Fixes Applied

- Added `equipmentProfile` to normalized `ProgramRequest`.
- Added canonical lowercasing, trimming, de-duplication, and deterministic array sorting.
- Added legacy/Turkish split normalization such as `Tüm Vücut` -> `full_body`.
- Added versioned fingerprint format: `forge-program-request:v1:<hash>`.
- Added engine/adaptation/template-version inputs to the fingerprint.
- Converted rejection reasons to structured uppercase codes.
- Hardened hard filtering for goal, day count, level, equipment, duration, explicit split, required restrictions, and unavailable required substitutions.
- Updated equipment scoring so exact equipment profile wins over merely compatible narrower profiles.
- Added deterministic tie-break order: score, adaptation cost, duration fit, equipment fit, split fit, previous-template continuity, lexicographic template ID.
- Added `getTemplateSelectionDebugReport` for structured development traces.
- Updated tests that previously expected unsafe equipment rescue behavior.
- Added limitation-aware filtering using reviewed canonical limitation rules.
- Added reviewed limitation substitutions that are actually applied before final validation.

## Normalization Rules

- Strings are trimmed and lowercased for canonical identifiers.
- Arrays are de-duplicated and sorted.
- Empty optional strings become `undefined`.
- Days are clamped to application-safe numeric bounds before filtering.
- Session duration is clamped to application-safe numeric bounds before filtering.
- Goal mapping is explicit: `strength`, `build_muscle`, `recomposition`, `general_fitness`.
- Equipment values are canonicalized: `barbells` -> `barbell`, `dumbbells` -> `dumbbell`, `bands` -> `resistance_band`, `bodyweight_only` -> `bodyweight`.
- Semantically identical array order produces the same fingerprint and selection.
- Limitation values are normalized deterministically. `none`, `yok`, and `no_limitations` become an empty limitation list.

## Limitation Normalization

Canonical limitation values:

- `knee_pain`
- `lower_back_pain`
- `shoulder_pain`
- `elbow_pain`
- `wrist_pain`
- `hip_pain`
- `ankle_pain`
- `overhead_restriction`
- `deep_knee_flexion_restriction`
- `spinal_loading_restriction`

Reviewed Turkish/legacy mappings include:

- `diz ağrısı`, `diz problemi`, `knee` -> `knee_pain`
- `bel ağrısı`, `bel problemi`, `lower_back` -> `lower_back_pain`
- `omuz ağrısı`, `omuz problemi`, `shoulder` -> `shoulder_pain`
- `baş üstü hareket yapamıyorum` -> `overhead_restriction`
- `derin squat yapamıyorum` -> `deep_knee_flexion_restriction`

Unknown limitation text is ignored for compatibility interpretation. It should remain a display/debug concern, not a safety inference.

## Reviewed Limitation Compatibility Rules

Added explicit rules in `src/workout-programming/limitations/exerciseLimitationRules.ts`.

Examples:

- `back_squat` conflicts with knee/deep-knee/lower-back/spinal-loading limitations; reviewed replacements include `leg_press` and `hack_squat` where applicable.
- `front_squat` conflicts with knee/deep-knee/lower-back/spinal-loading limitations; reviewed replacement includes `leg_press`.
- `conventional_deadlift` conflicts with lower-back/spinal-loading limitations; reviewed replacement exists for lower-back only.
- `overhead_press`, `dumbbell_shoulder_press`, and `machine_shoulder_press` conflict with shoulder/overhead restrictions; reviewed replacement for overhead restriction is `machine_chest_press`.
- Optional isolation conflicts do not reject a template.

## Hard Filtering Rules

Templates are rejected when:

- Goal differs: `GOAL_MISMATCH`
- Day count differs: `DAY_COUNT_MISMATCH`
- Level differs: `LEVEL_MISMATCH`
- Equipment profile is unavailable: `EQUIPMENT_MISMATCH`
- Duration is far outside template range: `DURATION_INCOMPATIBLE`
- Explicit split does not match: `SPLIT_MISMATCH`
- Required restricted exercise has no valid reviewed substitution: `REQUIRED_EXERCISE_RESTRICTED`
- Required exercise needs unavailable equipment with no reviewed substitution: `NO_VALID_SUBSTITUTION`
- Required exercise conflicts with a declared limitation and has no valid reviewed substitution: `LIMITATION_CONFLICT`

Goal and day count are exact hard matches. The engine no longer falls back across goals or mutates day count.

## Scoring System

Only compatible templates are scored for selection.

Weights:

- Goal exact match: 35
- Days exact match: 25
- Level exact match: 15
- Equipment fit: 10 exact profile, 6 compatible profile
- Duration fit: 5 / 3 / 1 by distance from target
- Focus compatibility: max 5
- Preferred split: 5
- Adaptation cost penalty: negative points for required equipment substitutions
- Limitation substitution penalty: negative points for required limitation substitutions

Focus muscles can only choose between otherwise-compatible templates; they cannot override goal, days, level, equipment, duration, or split.

Limitation substitutions also cannot override goal, days, level, equipment, duration, or split.

## Fingerprint Format

Format: `forge-program-request:v1:<hash>`

Included:

- engine version
- goal
- level
- days per week
- preferred session minutes
- equipment profile
- sorted available equipment
- preferred split
- sorted focus muscles
- high-confidence physique focus
- sorted restricted exercise IDs
- sorted limitations
- previous template ID
- force new variation flag
- template library version seed
- adaptation version

Excluded:

- timestamps
- localized display labels
- user name
- temporary UI IDs
- insertion order

## Reuse Behavior

If a saved plan has the same fingerprint and same user ID, it is reused unless `forceNewVariation` is true.

If template versions or engine version change, the fingerprint changes and the existing plan is preserved rather than silently overwritten.

## New Variation Behavior

When `forceNewVariation` is true:

- The current template is excluded only if a sufficiently compatible alternative exists.
- The score floor is `bestScore - 8`.
- If no strong alternative exists, the current best template remains selected.
- Selection remains deterministic.

## No-Match Behavior

The selection layer now exposes structured rejection reasons through `matchTemplates` and `getTemplateSelectionDebugReport`.

UI can explain:

- no compatible template exists
- which fields caused rejection
- whether the user can change days, duration, equipment, split, restrictions, or level
- whether a declared limitation caused `LIMITATION_CONFLICT`

## UI Connection Findings

Verified fields reaching `ProgramRequest`:

- goal
- experience level
- days per week
- session duration
- equipment
- preferred split/style
- focus muscles
- avoided exercise IDs
- pain limitations
- force new variation
- previous template ID

No UI field was found to silently override an explicit user choice in the tested mapping.

## Bugs Found

- Fingerprint was unversioned.
- `equipmentProfile` was not part of the normalized request.
- Equipment scoring allowed full-gym users to select a narrower dumbbell-only template on tie.
- Band-home users could select bodyweight-home template on tie.
- Rejection reasons were string fragments instead of structured codes.
- Old tests expected barbell strength templates to be rescued for dumbbell-only requests; Phase 3 now rejects unsafe equipment mismatches.
- `LIMITATION_CONFLICT` existed but was not evaluated in `templateRejections`.
- `none` limitations were previously fingerprinted as a meaningful value; they now normalize to an empty limitation list.
- Reviewed limitation substitutions were initially checked for compatibility but not guaranteed to be applied; this is now fixed.

## Remaining Limitations

- Level fallback is currently disabled for safety. If product later wants intermediate-to-beginner fallback, it should be explicit and UI-visible.
- No-match UI copy can now be built from structured debug data, but this phase did not redesign the screen.
- Limitation rules are intentionally conservative and reviewed-list-only. They do not diagnose injuries or claim medical safety.

## Completion

PHASE 3 selection hardening is complete. PHASE 4 was not started.
