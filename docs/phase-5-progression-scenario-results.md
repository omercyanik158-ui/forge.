# Phase 5 Progression Scenario Results

| Scenario | Rule | Previous Target | Logged Result | Outcome | Decision | Next Target | Pass |
|---|---|---:|---|---|---|---:|---|
| Missing rule | none | 3x8-12 @ 40 kg | 12/12/12 | invalid | preserve | unchanged | Yes |
| Missing exercise-level rule with template rule present | none | 3x8-12 @ 40 kg | 12/12/12 | invalid | preserve | unchanged | Yes |
| Unknown exercise-level rule | unknown | 3x8-12 @ 40 kg | validation | invalid | reject template | n/a | Yes |
| Negative reps | double progression | 3x8-12 @ 40 kg | -1 reps | invalid | preserve | unchanged | Yes |
| Duplicate set indexes | double progression | 3x8-12 @ 40 kg | duplicate index 1 | invalid | preserve | unchanged | Yes |
| All sets skipped | double progression | 3x8-12 @ 40 kg | skipped/skipped/skipped | skipped | preserve | unchanged | Yes |
| Below minimum | double progression | 3x8-12 @ 40 kg | 8/7/8 | failure | repeat | 3x8-12 @ 40 kg | Yes |
| Inside range | double progression | 3x8-12 @ 40 kg | 10/9/8 | partial_success | hold | 3x8-12 @ 40 kg | Yes |
| Upper range | double progression | 3x8-12 @ 40 kg | 12/12/12 | success | increase_load | 3x8-12 @ 42.5 kg | Yes |
| First failure | double progression | failure count 0 | 7/7/7 | failure | repeat | unchanged | Yes |
| Repeated failure | double progression | failure count 1 | 7/7/7 | repeated_failure | reduce_load | reduced load | Yes |
| Stall threshold | double progression | failure count 2 | 7/7/7 | plateau | mark_stalled | no structural change | Yes |
| Deload threshold | double progression | failure count 3 | 7/7/7 | deload | recommend_deload | lower load/sets | Yes |
| Beginner strength success | linear load | 3x5 @ 40 kg | 5/5/5 | success | increase_load | 42.5 kg | Yes |
| Beginner strength miss | linear load | 3x5 @ 40 kg | 5/4/5 | failure | repeat | unchanged | Yes |
| Bodyweight progression | linear reps | 3x8-10 | 10/10/10 | success | increase_reps/hold | no kg assigned | Yes |
| Missing RIR on basic rule | double progression | 3x8-12 | 12/12/12 | success | increase_load | increased | Yes |
| Missing RIR on RIR-required rule | rir-based | 3x8-12 | 12/12/12 without RIR | failure | repeat | unchanged | Yes |
| Idempotency | any valid rule | same previous state | same normalized log | same | reuse | one persisted decision | Yes |
| Set array reorder | any valid rule | same previous state | same sets shuffled | same | same fingerprint | same decision | Yes |

## Notes

- Current app logs do not capture per-set RIR/RPE, so RIR-required rules intentionally avoid aggressive increases when effort data is missing.
- Time and distance rule contracts are supported at type/service level, but UI logging needs Phase 6 work before real runtime use.
- Template-level progression metadata is no longer used as a production fallback; exercise-level assignments are required.
