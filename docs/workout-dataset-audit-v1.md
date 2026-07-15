# Workout Dataset Audit v1

Generated: 2026-07-15T00:00:00.000Z

## Scope

This audit is derived only from `program_summary.csv` and `programs_detailed_boostcamp_kaggle.csv`. It describes structure and data quality. It does not claim that any dataset program is effective.

## Files And Schema

| File |Size bytes |Rows |Columns |
| --- |--- |--- |--- |
| program_summary.csv |1167365 |2598 |title, description, level, goal, equipment, program_length, time_per_workout, total_exercises, created, last_edit |
| programs_detailed_boostcamp_kaggle.csv |294831276 |605033 |title, description, level, goal, equipment, program_length, time_per_workout, week, day, number_of_exercises, exercise_name, sets, reps, intensity, created, last_edit |

## Column Types

### program_summary.csv

| Column |Detected type |Missing rate |
| --- |--- |--- |
| title |string |0 |
| description |string |0.0015 |
| level |list-like-string |0 |
| goal |list-like-string |0 |
| equipment |string |0.0004 |
| program_length |number |0.0004 |
| time_per_workout |number |0 |
| total_exercises |number |0 |
| created |datetime |0.0004 |
| last_edit |datetime |0.0008 |

### programs_detailed_boostcamp_kaggle.csv

| Column |Detected type |Missing rate |
| --- |--- |--- |
| title |string |0 |
| description |string |0.0014 |
| level |list-like-string |0 |
| goal |list-like-string |0 |
| equipment |string |0 |
| program_length |number |0 |
| time_per_workout |number |0 |
| week |number |0 |
| day |number |0 |
| number_of_exercises |number |0 |
| exercise_name |string |0 |
| sets |number |0 |
| reps |number |0 |
| intensity |number |0 |
| created |datetime |0 |
| last_edit |datetime |0.0001 |

## Quality Counts

| Class |Program count |
| --- |--- |
| structurally_reliable |1914 |
| usable_with_caution |658 |
| structurally_unreliable |26 |

## Suspicious Values

| Signal |Rows |
| --- |--- |
| unusualSets |100 |
| unusualReps |26046 |
| unusualIntensity |0 |
| invalidWeekDayRows |0 |
| emptyExerciseNameRows |0 |

## Most Common Exclusion Or Caution Reasons

| Reason |Program count |
| --- |--- |
| Multiple duplicate exercise names appear inside the same session. |318 |
| More than 35% of exercise rows could not be confidently classified. |132 |
| 4 rows have missing, negative, zero or extreme rep values. |99 |
| 2 rows have missing, negative, zero or extreme rep values. |82 |
| Major movement-pattern coverage is narrow for a resistance-training program. |80 |
| 1 rows have missing, negative, zero or extreme rep values. |77 |
| 3 rows have missing, negative, zero or extreme rep values. |77 |
| 6 rows have missing, negative, zero or extreme rep values. |73 |
| 5 rows have missing, negative, zero or extreme rep values. |56 |
| 8 rows have missing, negative, zero or extreme rep values. |52 |
| 9 rows have missing, negative, zero or extreme rep values. |46 |
| 10 rows have missing, negative, zero or extreme rep values. |40 |

## Normalization Decisions

- Raw list-like goal and level strings are tokenized conservatively; multi-goal records become mixed unless powerbuilding is explicit.
- Exercise roles, muscles and movement patterns are heuristic labels for analysis only; ambiguous exercise names remain unknown.
- Compound secondary muscles are counted as fractional exposure in aggregate volume estimates, not full direct sets.
- Split classification uses title/description/equipment text and should be treated as a candidate label, not ground truth.

## Limitations

- Dataset popularity or frequency is not evidence of effectiveness.
- The detailed CSV has malformed negative rep values and mobility-test rows that are not normal prescription data.
- Rest intervals, explicit RPE/RIR and progression models are sparsely represented or absent in the structured columns.
- Descriptions may contain copyrighted program names; documents intentionally summarize patterns rather than reproduce complete programs.
- Yoga and Pilates are not meaningfully supported by this resistance-training dataset.
