# Phase 5 Template Progression Matrix

All 26 active templates were audited against the generated progression rule registry. Exercise rows are CSV-generated prescription rows across all workout days, and every row now has an explicit exercise-level `progressionRuleId`.

| Template ID | Goal | Level | Days | Rule | Exercise Rows | Runtime Status |
|---|---|---|---:|---|---:|---|
| `forge_strength_fullbody_beginner_3d_v1` | strength | beginner | 3 | `linear_beginner` | 18 | Pass |
| `forge_strength_upper_lower_beginner_4d_v1` | strength | beginner | 4 | `linear_beginner` | 20 | Pass |
| `forge_strength_fullbody_intermediate_3d_v1` | strength | intermediate | 3 | `undulating_strength` | 16 | Pass |
| `forge_strength_upper_lower_intermediate_4d_v1` | strength | intermediate | 4 | `top_set_backoff` | 20 | Pass |
| `forge_strength_intermediate_5d_v1` | strength | intermediate | 5 | `undulating_strength` | 21 | Pass |
| `forge_strength_advanced_4d_v1` | strength | advanced | 4 | `top_set_backoff` | 20 | Pass |
| `forge_hypertrophy_fullbody_beginner_3d_v1` | hypertrophy | beginner | 3 | `double_progression` | 19 | Pass |
| `forge_hypertrophy_fullbody_intermediate_3d_v1` | hypertrophy | intermediate | 3 | `double_progression` | 19 | Pass |
| `forge_hypertrophy_upper_lower_beginner_4d_v1` | hypertrophy | beginner | 4 | `double_progression` | 24 | Pass |
| `forge_hypertrophy_upper_lower_intermediate_4d_v1` | hypertrophy | intermediate | 4 | `double_progression` | 26 | Pass |
| `forge_hypertrophy_intermediate_5d_v1` | hypertrophy | intermediate | 5 | `double_progression` | 30 | Pass |
| `forge_hypertrophy_bodypart_intermediate_5d_v1` | hypertrophy | intermediate | 5 | `double_progression` | 30 | Pass |
| `forge_hypertrophy_ppl_intermediate_6d_v1` | hypertrophy | intermediate | 6 | `double_progression` | 30 | Pass |
| `forge_hypertrophy_upper_lower_advanced_4d_v1` | hypertrophy | advanced | 4 | `double_progression` | 26 | Pass |
| `forge_hypertrophy_ppl_advanced_6d_v1` | hypertrophy | advanced | 6 | `double_progression` | 30 | Pass |
| `forge_powerbuilding_intermediate_4d_v1` | powerbuilding | intermediate | 4 | `powerbuilding_hybrid` | 23 | Pass |
| `forge_powerbuilding_intermediate_5d_v1` | powerbuilding | intermediate | 5 | `powerbuilding_hybrid` | 26 | Pass |
| `forge_powerbuilding_advanced_4d_v1` | powerbuilding | advanced | 4 | `powerbuilding_hybrid` | 23 | Pass |
| `forge_powerbuilding_advanced_5d_v1` | powerbuilding | advanced | 5 | `powerbuilding_hybrid` | 26 | Pass |
| `forge_general_fitness_beginner_gym_3d_v1` | general_fitness | beginner | 3 | `linear_beginner` | 15 | Pass |
| `forge_general_fitness_beginner_gym_4d_v1` | general_fitness | beginner | 4 | `double_progression` | 19 | Pass |
| `forge_general_fitness_dumbbell_beginner_3d_v1` | general_fitness | beginner | 3 | `double_progression` | 16 | Pass |
| `forge_home_bodyweight_beginner_3d_v1` | general_fitness | beginner | 3 | `bodyweight_rep_leverage` | 15 | Pass |
| `forge_home_band_beginner_3d_v1` | general_fitness | beginner | 3 | `bodyweight_rep_leverage` | 15 | Pass |
| `forge_general_fitness_intermediate_3d_v1` | general_fitness | intermediate | 3 | `double_progression` | 17 | Pass |
| `forge_general_fitness_intermediate_4d_v1` | general_fitness | intermediate | 4 | `double_progression` | 20 | Pass |

## Audit Result

- Active templates audited: 26
- Exercise rows audited: 564
- Explicit exercise-level progression assignments: 564
- Missing generated rule references: 0
- Missing exercise-level progression assignments: 0
- Production validation result: pass
