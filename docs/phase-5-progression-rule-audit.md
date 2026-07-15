# Phase 5 Progression Rule Audit

| Rule ID | Runtime Type | Goals | Active Templates | Explicit Exercise Rows | Validation | Test Status |
|---|---|---|---:|---:|---|---|
| `linear_beginner` | `linear_load` | strength, general_fitness | 3 | 53 | Pass | Covered |
| `double_progression` | `double_progression` | hypertrophy, general_fitness, powerbuilding | 13 | 352 | Pass | Covered |
| `top_set_backoff` | `top_set_backoff` for main lifts, `double_progression` for assistance | strength, powerbuilding | 2 | 40 | Pass | Covered |
| `undulating_strength` | `percentage_based` for main lifts, `linear_load` for assistance | strength | 2 | 37 | Pass | Covered |
| `powerbuilding_hybrid` | `top_set_backoff` for main lifts, `double_progression` for assistance | powerbuilding | 4 | 98 | Pass | Covered |
| `bodyweight_rep_leverage` | `linear_reps` | strength, hypertrophy, powerbuilding, general_fitness, home | 2 | 44 | Pass | Covered |
| `rep_range_accessory` | `rep_range` | strength, hypertrophy, powerbuilding, general_fitness | 0 | 90 | Pass | Covered |
| `fixed_load_technique` | `fixed_load` | strength, hypertrophy, powerbuilding, general_fitness, home | 0 | 13 | Pass | Covered |
| `time_based_conditioning` | `time_based` | general_fitness, home | 0 | 5 | Pass | Covered |
| `distance_based_conditioning` | `distance_based` | general_fitness, home | 0 | 4 | Pass | Covered |

## Findings

- `powerbuilding_hybrid` remains template-level metadata but is no longer used as a final exercise rule.
- No active template references an unknown rule.
- Every active template exercise has an explicit exercise-level progression rule.
- Runtime no longer silently uses template-level fallback for production progression decisions.

## Compatibility Notes

- Main-lift contexts receive strength-specific behavior where the generated rule implies it.
- Accessory contexts remain conservative and use double progression where appropriate.
- Bodyweight rules never create arbitrary kilogram targets.
- Equipment increments are deterministic and validated.
