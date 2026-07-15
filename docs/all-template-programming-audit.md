# FORGE All Template Programming Audit

Date: 2026-07-15

Scope: all active curated CSV workout templates, generated TypeScript template data, exercise ID mapping, deterministic selection, substitution/adaptation, instantiation, UI-plan conversion, and persistence-compatible plan shape.

## Audit Method

- Added `validateTemplateSemantics` and `validateInstantiatedProgramSemantics` in `src/workout-programming/validation/semanticProgramValidation.ts`.
- Checked split-level invariants for full body, upper/lower, push/pull/legs, powerbuilding, strength, hypertrophy, general fitness, and home/bodyweight templates.
- Calculated weekly set totals, movement-pattern counts, muscle set counts, muscle frequencies, day exercise counts, and day set totals.
- Revalidated representative instantiated user-facing programs after template selection and conversion into `AIProgramPlan`.
- Added regression tests in `tests/template-semantic-validation.test.ts`.

## Final Template Audit Table

| Template | Goal | Level | Split | Days | Equipment | Exercises | Weekly Sets | Final Status |
|---|---|---|---:|---:|---|---:|---:|---|
| `forge_strength_fullbody_beginner_3d_v1` | strength | beginner | full_body | 3 | full_gym | 18 | 47 | Approved |
| `forge_strength_upper_lower_beginner_4d_v1` | strength | beginner | upper_lower | 4 | full_gym | 20 | 52 | Approved |
| `forge_strength_fullbody_intermediate_3d_v1` | strength | intermediate | full_body | 3 | full_gym | 16 | 52 | Approved |
| `forge_strength_upper_lower_intermediate_4d_v1` | strength | intermediate | upper_lower | 4 | full_gym | 20 | 64 | Approved |
| `forge_strength_intermediate_5d_v1` | strength | intermediate | strength_split | 5 | full_gym | 21 | 69 | Approved |
| `forge_strength_advanced_4d_v1` | strength | advanced | upper_lower | 4 | full_gym | 20 | 74 | Approved |
| `forge_hypertrophy_fullbody_beginner_3d_v1` | hypertrophy | beginner | full_body | 3 | full_gym | 19 | 53 | Approved |
| `forge_hypertrophy_fullbody_intermediate_3d_v1` | hypertrophy | intermediate | full_body | 3 | full_gym | 19 | 53 | Approved |
| `forge_hypertrophy_upper_lower_beginner_4d_v1` | hypertrophy | beginner | upper_lower | 4 | full_gym | 24 | 67 | Approved |
| `forge_hypertrophy_upper_lower_intermediate_4d_v1` | hypertrophy | intermediate | upper_lower | 4 | full_gym | 26 | 85 | Approved |
| `forge_hypertrophy_intermediate_5d_v1` | hypertrophy | intermediate | body_part | 5 | full_gym | 30 | 99 | Approved |
| `forge_hypertrophy_bodypart_intermediate_5d_v1` | hypertrophy | intermediate | body_part | 5 | full_gym | 30 | 88 | Approved |
| `forge_hypertrophy_ppl_intermediate_6d_v1` | hypertrophy | intermediate | push_pull_legs | 6 | full_gym | 30 | 93 | Approved |
| `forge_hypertrophy_upper_lower_advanced_4d_v1` | hypertrophy | advanced | upper_lower | 4 | full_gym | 26 | 101 | Approved |
| `forge_hypertrophy_ppl_advanced_6d_v1` | hypertrophy | advanced | push_pull_legs | 6 | full_gym | 30 | 101 | Approved |
| `forge_powerbuilding_intermediate_4d_v1` | powerbuilding | intermediate | powerbuilding | 4 | full_gym | 23 | 76 | Approved |
| `forge_powerbuilding_intermediate_5d_v1` | powerbuilding | intermediate | powerbuilding | 5 | full_gym | 26 | 87 | Approved |
| `forge_powerbuilding_advanced_4d_v1` | powerbuilding | advanced | powerbuilding | 4 | full_gym | 23 | 76 | Approved |
| `forge_powerbuilding_advanced_5d_v1` | powerbuilding | advanced | powerbuilding | 5 | full_gym | 26 | 87 | Approved |
| `forge_general_fitness_beginner_gym_3d_v1` | general_fitness | beginner | full_body | 3 | full_gym | 15 | 40 | Approved |
| `forge_general_fitness_beginner_gym_4d_v1` | general_fitness | beginner | upper_lower | 4 | full_gym | 19 | 48 | Approved |
| `forge_general_fitness_dumbbell_beginner_3d_v1` | general_fitness | beginner | full_body | 3 | dumbbell_only | 16 | 46 | Approved |
| `forge_home_bodyweight_beginner_3d_v1` | general_fitness | beginner | home_bodyweight | 3 | bodyweight_home | 15 | 51 | Approved |
| `forge_home_band_beginner_3d_v1` | general_fitness | beginner | home_bodyweight | 3 | resistance_band_bodyweight | 15 | 53 | Approved |
| `forge_general_fitness_intermediate_3d_v1` | general_fitness | intermediate | full_body | 3 | full_gym | 17 | 48 | Approved |
| `forge_general_fitness_intermediate_4d_v1` | general_fitness | intermediate | upper_lower | 4 | full_gym | 20 | 57 | Approved |

## Pipeline Findings

- CSV source rows are the source of truth; generated TypeScript was regenerated with `npm run build:forge-workout-brain`.
- Exercise ID mapping remains complete: `mappingGaps: 0`.
- Template registry exposes 26 active templates and all were semantically validated.
- Deterministic substitution candidates preserve movement-pattern compatibility.
- Physique adaptation remains bounded by template focus caps and does not change split or progression model.
- Instantiated user-facing plans preserve day count and exercise count; non-adapted days preserve exact exercise order.
- Invalid semantic states are covered by regression tests, not only manual review.

## Remaining Notes

- Home/bodyweight templates now require a realistic pulling option through resistance-band row. Pure no-equipment pulling is still structurally limited and should be described honestly in UX copy.
- The semantic validator intentionally avoids forcing all templates into one style. It only fails templates when required movement, ordering, or goal-specific invariants are broken.
