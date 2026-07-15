# Phase 2 Template Builder Report

Generated: 2026-07-15T00:00:00.000Z

## Templates Created

- Active templates: 28
- By goal: strength 8, hypertrophy 10, powerbuilding 4, general_fitness 6
- By level: beginner 8, intermediate 13, advanced 7
- By days/week: 3-day 8, 4-day 11, 5-day 7, 6-day 2

## Templates Excluded

- Yoga and Pilates: excluded because Phase 1 requires separate domain sources.
- Branded program clones: excluded by product rule.
- Superficial exercise-swap variants: excluded; Phase 3 adaptation should handle safe substitutions.

## Exercise Gaps

No blocking gaps. See `docs/template-exercise-gaps-v1.md`.

## Validation

- Active template validation errors: 0
- Template IDs are unique.
- Template versions are valid.
- Exercise IDs resolve against the CSV-backed exercise catalog.
- Day counts and day ordering are deterministic.
- Main lifts precede accessory and isolation work.

## Known Limitations

- This phase does not implement user selection or active program instantiation.
- Equipment metadata is still inherited from the CSV-backed exercise catalog and needs stricter compatibility before Phase 3.
- Volume reports are estimates based on template metadata, not measured training response.

## Readiness For Phase 3

Ready for deterministic template selection and user-program instantiation, provided Phase 3 keeps selection separate from uncontrolled random generation.
