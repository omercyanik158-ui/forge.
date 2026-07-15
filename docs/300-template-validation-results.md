# FORGE 300 Template Validation Results

Date: 2026-07-15

## Source Package

- Source directory: `data/forge_workout_library_300/`
- Manifest schema version: `2`
- CSV source of truth preserved; no workout templates were rewritten.
- Legacy `data/forge_workout_csv_pack/` was not removed.

## Counts

- Templates: `300`
- Template exercise rows: `6565`
- Canonical exercises: `127`
- Progression rules: `7`
- Adaptation rules: `52`
- Exercise substitutions: `27`

## Coverage

- Modalities: strength `45`, hypertrophy `90`, powerbuilding `40`, general_fitness `45`, home `30`, yoga `25`, pilates `25`
- Goals: strength `45`, hypertrophy `90`, powerbuilding `40`, general_fitness `125`
- Levels: beginner `106`, intermediate `119`, advanced `75`
- Days per week: 2d `69`, 3d `80`, 4d `87`, 5d `50`, 6d `14`
- Equipment profiles: full_gym `182`, dumbbell_only `38`, bodyweight_home `65`, resistance_band_bodyweight `15`

## Prescription Types

- `reps`: `5655`
- `duration`: `861`
- `rounds`: `49`
- `breaths`: supported by schema/runtime, but not present in this package.

## Validation Behavior

- Template IDs are unique.
- Every template exercise references a generated canonical exercise.
- Every exercise-level progression rule reference resolves to a generated rule.
- Supported prescription types are restricted to `reps`, `duration`, `breaths`, and `rounds`.
- Yoga and Pilates retain distinct modalities and are not treated as gym hypertrophy.
- 300 library selection uses strict hard filtering; relaxed fallback remains disabled for this library.

