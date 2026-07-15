# FORGE 300 Template Migration Report

Date: 2026-07-15

## Runtime Flow

1. CSV files in `data/forge_workout_library_300/` are parsed by `scripts/generate_forge_workout_library_300.py`.
2. The script validates manifest counts, template exercise references, prescription types, progression rule references, adaptation rules, and substitutions.
3. Generated files are written under `src/workout-programming/generated/` and `src/workout-programming/data/`.
4. `getWorkoutLibraryVersionState()` reads `EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION`.
5. Missing or invalid flag values select the stable 26-template library.
6. Exact value `300` selects the 300-template library.
7. Program requests are normalized into goal plus modality.
8. 300 selection uses strict filters only; stable selection keeps the previous relaxed fallback behavior.
9. Instantiation applies substitutions, physique adaptation, exercise ordering, and final validation before returning the plan.

## Feature Flag Behavior

- `EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION=300`: uses generated 300 templates, 300 progression rules, 300 adaptation rules, and 300 substitutions.
- Missing env var: uses stable generated templates.
- Any value other than `300`: uses stable generated templates.

## Persistence Behavior

- New plans continue using the existing AI program instance flow.
- Request fingerprints include modality, so yoga, pilates, home, and gym requests remain distinct.
- Legacy saved programs remain readable through the read-compatible template registry.
- Invalid instantiated programs are not accepted by the validation path.

## Remaining Blockers

- Manual device QA is still required before making 300 the production default.
- Product should decide whether bodyweight-only home users should see a no-match explanation or be guided to add a pull-up bar/bands when curated plans require `bar_or_rings`.
- Duration/round exercise logging should be checked in the actual session player on device.

