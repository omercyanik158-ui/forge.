# FORGE Workout Library 300 — Integration Notes

This package expands the reviewed template library to 300 programs.

## Important schema changes

- `forge_program_templates_300.csv` adds:
  - `modality`
  - `library_tier`
- `forge_template_exercises_300.csv` adds:
  - `progression_rule_id`
  - `prescription_type`
  - `duration_seconds_min`
  - `duration_seconds_max`
  - `breaths_min`
  - `breaths_max`

Yoga and Pilates keep `goal=general_fitness` for compatibility, while `modality` distinguishes them.

## Runtime guidance

1. Keep existing deterministic hard filters.
2. Add `modality` as an optional builder/request field.
3. Use conventional splits for strength/hypertrophy/powerbuilding.
4. Use `custom` split for Yoga and Pilates.
5. Do not apply kilogram progression to yoga/pilates duration prescriptions.
6. Do not infer pull-up bar or rack from bodyweight/barbell.
7. Validate all templates after import.
8. Regenerate TypeScript data from these CSV sources.
9. Keep the raw 281 MB Kaggle CSV outside the repository.

## Quality note

The 300 programs are generated from reviewed archetypes and deterministic variation rules.
They should still be audited by the existing semantic, duration, equipment, adaptation,
and progression validation suites before production rollout.
