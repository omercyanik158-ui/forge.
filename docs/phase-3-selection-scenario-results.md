# FORGE Phase 3 Selection Scenario Results

Date: 2026-07-15

All scenarios below are covered by `tests/phase-3-selection-engine.test.ts`.

| # | Scenario | Normalized Request Summary | Compatible Templates | Selected Template | Expected | Actual | Result |
|---:|---|---|---:|---|---|---|---|
| 1 | Beginner strength, 3 days, full gym | strength/beginner/3/full_gym/60 | 1 | `forge_strength_fullbody_beginner_3d_v1` | same | same | Pass |
| 2 | Beginner strength, 4 days, full gym | strength/beginner/4/full_gym/60 | 1 | `forge_strength_upper_lower_beginner_4d_v1` | same | same | Pass |
| 3 | Intermediate strength, 3 days | strength/intermediate/3/full_gym/60 | 1 | `forge_strength_fullbody_intermediate_3d_v1` | same | same | Pass |
| 4 | Intermediate strength, 4 days | strength/intermediate/4/full_gym/60 | 1 | `forge_strength_upper_lower_intermediate_4d_v1` | same | same | Pass |
| 5 | Intermediate strength, 5 days | strength/intermediate/5/full_gym/60 | 1 | `forge_strength_intermediate_5d_v1` | same | same | Pass |
| 6 | Advanced strength, 4 days | strength/advanced/4/full_gym/75 | 1 | `forge_strength_advanced_4d_v1` | same | same | Pass |
| 7 | Beginner hypertrophy, 3 days | hypertrophy/beginner/3/full_gym/60 | 1 | `forge_hypertrophy_fullbody_beginner_3d_v1` | same | same | Pass |
| 8 | Beginner hypertrophy, 4 days | hypertrophy/beginner/4/full_gym/60 | 1 | `forge_hypertrophy_upper_lower_beginner_4d_v1` | same | same | Pass |
| 9 | Intermediate hypertrophy, 3 days | hypertrophy/intermediate/3/full_gym/60 | 1 | `forge_hypertrophy_fullbody_intermediate_3d_v1` | same | same | Pass |
| 10 | Intermediate hypertrophy, 4 days | hypertrophy/intermediate/4/full_gym/60 | 1 | `forge_hypertrophy_upper_lower_intermediate_4d_v1` | same | same | Pass |
| 11 | Intermediate hypertrophy, 5 days | hypertrophy/intermediate/5/full_gym/60 | 2 | `forge_hypertrophy_bodypart_intermediate_5d_v1` | same | same | Pass |
| 12 | Intermediate hypertrophy, 6 days | hypertrophy/intermediate/6/full_gym/60 | 1 | `forge_hypertrophy_ppl_intermediate_6d_v1` | same | same | Pass |
| 13 | Advanced hypertrophy, 4 days | hypertrophy/advanced/4/full_gym/60 | 1 | `forge_hypertrophy_upper_lower_advanced_4d_v1` | same | same | Pass |
| 14 | Advanced hypertrophy, 6 days | hypertrophy/advanced/6/full_gym/60 | 1 | `forge_hypertrophy_ppl_advanced_6d_v1` | same | same | Pass |
| 15 | Intermediate powerbuilding, 4 days | powerbuilding/intermediate/4/full_gym/60 | 1 | `forge_powerbuilding_intermediate_4d_v1` | same | same | Pass |
| 16 | Intermediate powerbuilding, 5 days | powerbuilding/intermediate/5/full_gym/60 | 1 | `forge_powerbuilding_intermediate_5d_v1` | same | same | Pass |
| 17 | Advanced powerbuilding, 4 days | powerbuilding/advanced/4/full_gym/75 | 1 | `forge_powerbuilding_advanced_4d_v1` | same | same | Pass |
| 18 | Advanced powerbuilding, 5 days | powerbuilding/advanced/5/full_gym/60 | 1 | `forge_powerbuilding_advanced_5d_v1` | same | same | Pass |
| 19 | Beginner general fitness, 3 days, full gym | general_fitness/beginner/3/full_gym/45 | 2 | `forge_general_fitness_beginner_gym_3d_v1` | same | same | Pass |
| 20 | Beginner general fitness, 4 days, full gym | general_fitness/beginner/4/full_gym/45 | 1 | `forge_general_fitness_beginner_gym_4d_v1` | same | same | Pass |
| 21 | Beginner dumbbell-only, 3 days | general_fitness/beginner/3/dumbbell_only/45 | 1 | `forge_general_fitness_dumbbell_beginner_3d_v1` | same | same | Pass |
| 22 | Beginner home/bodyweight, 3 days | general_fitness/beginner/3/bodyweight_home/30 | 1 | `forge_home_bodyweight_beginner_3d_v1` | same | same | Pass |
| 23 | Beginner resistance-band home, 3 days | general_fitness/beginner/3/resistance_band_bodyweight/30 | 2 | `forge_home_band_beginner_3d_v1` | same | same | Pass |
| 24 | Intermediate general fitness, 3 days | general_fitness/intermediate/3/full_gym/60 | 1 | `forge_general_fitness_intermediate_3d_v1` | same | same | Pass |
| 25 | Intermediate general fitness, 4 days | general_fitness/intermediate/4/full_gym/60 | 1 | `forge_general_fitness_intermediate_4d_v1` | same | same | Pass |

## Edge Cases

| Scenario | Expected | Actual | Result |
|---|---|---|---|
| Unsupported 2-day request | no compatible template | no compatible template with `DAY_COUNT_MISMATCH` | Pass |
| Unsupported 7-day request | no compatible template | no compatible template | Pass |
| Beginner requesting advanced PPL split | no compatible template | no compatible template with `LEVEL_MISMATCH` | Pass |
| Strength request with hypertrophy/PPL split | no compatible template | no compatible template with `SPLIT_MISMATCH` | Pass |
| Focus muscles on strength request | no cross-goal fallback | only strength templates compatible | Pass |
| Same request repeated 100 times | identical fingerprint, scores, selected template | identical | Pass |
| Arrays in different order | identical fingerprint and compatible list | identical | Pass |
| Turkish split label | canonical split mapping | `Tüm Vücut` -> `full_body` | Pass |
| Force new variation with no strong alternative | deterministic, keeps current best | keeps current best | Pass |
| UI answer mapping | all fields reach request | verified | Pass |
| `none`, `yok`, `no_limitations` | no interpreted limitation | empty limitation list | Pass |
| Turkish limitation labels | canonical limitation IDs | deterministic mapping | Pass |
| Same limitations in different order | same fingerprint | same fingerprint | Pass |
| Duplicate limitations | no fingerprint change | no fingerprint change | Pass |
| Knee/deep-knee limitation with blocked replacement | reject | `LIMITATION_CONFLICT` | Pass |
| Knee limitation with reviewed replacement | compatible with penalty | compatible with penalty | Pass |
| Shoulder/overhead required lift without valid replacement | reject | `LIMITATION_CONFLICT` | Pass |
| Overhead restriction with reviewed replacement | replacement applied | `csv-chest-press-machine` applied | Pass |
| Spinal-loading restriction on required main lift | reject when unresolved | `LIMITATION_CONFLICT` | Pass |
| Optional conflicting isolation | no whole-template rejection | compatible | Pass |
| Reviewed substitution equipment unavailable | reject | `LIMITATION_CONFLICT` | Pass |
| Reviewed substitution restricted | reject | `LIMITATION_CONFLICT` | Pass |
| Limitation request repeated 100 times | identical result | identical result | Pass |

## Summary

- Main supported scenarios: 25
- Edge/determinism/limitation scenarios: 25
- Passed: 50
- Failed: 0
